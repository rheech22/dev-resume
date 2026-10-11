#!/usr/bin/env node
// 마크다운 이력서를 HTML로 바꾸고, 설치된 Chrome 계열 브라우저로 PDF를 만듭니다.
// 사용: node scripts/render.mjs <resume.md> [--css style.css] [--out resume.pdf] [--html-only]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_CSS = join(HERE, "..", "templates", "resume.css");

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// 굵게, 기울임, 코드, 링크, 자동 링크, 역슬래시 이스케이프를 다룹니다. 이력서에 필요한 범위입니다.
export function inline(text) {
  const held = [];
  const hold = (html) => `\u0000${held.push(html) - 1}\u0000`;
  let s = text
    .replace(/`([^`]+)`/g, (_, c) => hold(`<code>${escapeHtml(c)}</code>`))
    .replace(/\\([\\`*_[\]()#+\-.!<>~|])/g, (_, c) => hold(escapeHtml(c)));
  s = s.replace(/\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g, (_, label, url) => hold(`<a href="${escapeHtml(url)}">`) + label + hold("</a>"));
  s = s.replace(/<(https?:\/\/[^>\s]+)>/g, (_, url) => hold(`<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`));
  s = s.replace(/<([^>\s@]+@[^>\s@]+\.[^>\s@]+)>/g, (_, mail) => hold(`<a href="mailto:${escapeHtml(mail)}">${escapeHtml(mail)}</a>`));
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<>()]*[^\s<>().,;:!?])/g, (_, pre, url) => pre + hold(`<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`));
  s = s.replace(/(^|[\s(])([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g, (_, pre, mail) => pre + hold(`<a href="mailto:${mail}">${mail}</a>`));
  s = escapeHtml(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => held[i]);
}

// "제목 (2025.12 – 현재)"처럼 끝의 괄호가 날짜 모양이면 기간으로 봅니다. "(iOS 17 대응)"은 기간이 아닙니다.
const DATE = /(?:19|20)\d{2}|\d{1,2}[./]\d{2,4}|현재|Present/;
function splitPeriod(text) {
  const m = text.match(/^(.*\S)\s+\(([^()]*)\)\s*$/);
  if (!m || !DATE.test(m[2]) || /[가-힣]{2,}/.test(m[2].replace(/현재/g, ""))) return { title: text, period: "" };
  return { title: m[1], period: m[2] };
}

export function toHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").replace(/<!--[\s\S]*?-->/g, "").split("\n");
  const out = [];
  let para = [];
  let list = []; // { depth, html, ordered }
  let indents = [];
  let afterName = false;

  const flushPara = () => {
    if (!para.length) return;
    const paraLines = para;
    const text = para.join(" ");
    para = [];
    if (afterName) {
      out.push(`<p class="contact">${paraLines.map(inline).join("<br>")}</p>`);
      afterName = false;
    } else if (/^\*\*[^*]+\*\*$/.test(text)) {
      out.push(`<h4>${inline(text.slice(2, -2))}</h4>`);
    } else {
      out.push(`<p>${inline(text)}</p>`);
    }
  };
  const flushList = () => {
    if (!list.length) return;
    let html = "";
    const open = []; // 열린 목록 태그
    for (const item of list) {
      const tag = item.ordered ? "ol" : "ul";
      if (item.depth >= open.length) {
        html += `<${tag}>`;
        open.push(tag);
      } else {
        html += "</li>";
        while (open.length > item.depth + 1) html += `</${open.pop()}></li>`;
      }
      html += `<li>${item.html}`;
    }
    html += "</li>";
    while (open.length) html += `</${open.pop()}>` + (open.length ? "</li>" : "");
    out.push(html);
    list = [];
    indents = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const item = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (heading) {
      flushPara();
      flushList();
      const level = heading[1].length;
      if (level === 1) {
        out.push(`<h1>${inline(heading[2])}</h1>`);
        afterName = true;
      } else if (level === 2) {
        out.push(`<h2>${inline(heading[2])}</h2>`);
      } else if (level === 4) {
        out.push(`<h4>${inline(heading[2])}</h4>`);
      } else {
        const { title, period } = splitPeriod(heading[2]);
        out.push(`<h3><span>${inline(title)}</span>${period ? `<span class="period">${inline(period)}</span>` : ""}</h3>`);
      }
    } else if (item) {
      flushPara();
      // 들여쓰기 칸 수가 아니라 앞 항목보다 더 들여 썼는지로 깊이를 정합니다. 2칸이든 4칸이든 같습니다.
      const indent = item[1].replace(/\t/g, "    ").length;
      while (indents.length && indent < indents[indents.length - 1]) indents.pop();
      if (!indents.length || indent > indents[indents.length - 1]) indents.push(indent);
      list.push({ depth: indents.length - 1, html: inline(item[3]), ordered: /\d/.test(item[2]) });
    } else if (list.length && /^\s+\S/.test(line)) {
      list[list.length - 1].html += " " + inline(line.trim());
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  return out.join("\n");
}

export function page(body, css, title) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
${css}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

const BROWSERS = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const BROWSER_COMMANDS = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge"];

export function findBrowser() {
  for (const path of BROWSERS) if (path && existsSync(path)) return path;
  for (const cmd of BROWSER_COMMANDS) {
    try {
      return execFileSync("which", [cmd], { encoding: "utf8" }).trim();
    } catch {}
  }
  return null;
}

function main(argv) {
  const args = { css: DEFAULT_CSS, out: null, htmlOnly: false, input: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--css") args.css = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--html-only") args.htmlOnly = true;
    else args.input = argv[i];
  }
  if (!args.input) {
    console.error("사용: node scripts/render.mjs <resume.md> [--css style.css] [--out resume.pdf] [--html-only]");
    process.exit(2);
  }
  const input = resolve(args.input);
  const markdown = readFileSync(input, "utf8");
  const name = (markdown.match(/^#\s+(.*)$/m) || [, "이력서"])[1];
  const pdf = resolve(args.out || input.replace(/\.md$/, "") + ".pdf");
  const html = pdf.replace(/\.pdf$/, "") + ".html";
  writeFileSync(html, page(toHtml(markdown), readFileSync(args.css, "utf8"), name));
  console.log(`HTML: ${html}`);
  if (args.htmlOnly) return;

  const browser = findBrowser();
  if (!browser) {
    console.error("Chrome 계열 브라우저를 찾지 못했습니다. HTML을 브라우저에서 열고 인쇄 → PDF로 저장하세요. 경로를 아시면 CHROME_PATH로 지정하세요.");
    process.exit(3);
  }
  execFileSync(browser, [
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--print-to-pdf-no-header",
    `--print-to-pdf=${pdf}`,
    pathToFileURL(html).href,
  ], { stdio: "ignore" });
  console.log(`PDF: ${pdf}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));

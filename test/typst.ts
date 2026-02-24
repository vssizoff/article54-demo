// render-typst.ts
import { readFileSync, writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import hljs, {type HighlightResult} from "highlight.js";

export function renderTypstHtmlToStaticBody(html: string): string {
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // --- Код: highlight.js ---
    const codeBlocks = document.querySelectorAll<HTMLElement>("pre.hljs");
    codeBlocks.forEach((code) => {
        const classAttr = code.className || "";
        const match = classAttr.match(/language-([a-z0-9+-]+)/i);
        const lang = match?.[1];

        const source = code.querySelector("code")?.textContent ?? "";

        let result: HighlightResult;
        if (lang && hljs.getLanguage(lang)) {
            result = hljs.highlight(source, { language: lang });
        } else {
            result = hljs.highlightAuto(source);
        }

        code.innerHTML = `<code>${result.value}</code>`;
        // Убедимся, что класс hljs есть
        // if (!code.classList.contains("hljs")) {
        //     code.classList.add("hljs");
        // }
    });

    // Возвращаем только тело
    return document.body.innerHTML.trim();
}

// CLI-использование: node render-typst.js input.html output.html
if (require.main === module) {
    const inputPath = process.argv[2] ?? "test.html";
    const outputPath = process.argv[3] ?? "body.html";

    const html = readFileSync(inputPath, "utf8");
    const body = renderTypstHtmlToStaticBody(html);
    writeFileSync(outputPath, body, "utf8");
}
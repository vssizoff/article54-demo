import MarkdownIt from 'markdown-it';
import katex from 'katex';
import hljs from 'highlight.js';
import fs from "fs";
import vueHljs from 'vue-highlight.js/lib/languages/vue';

hljs.registerLanguage("vue", vueHljs)

// Initialize markdown-it
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str: string, lang: string): string => {
        if (lang && hljs.getLanguage(lang)) {
            return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
        }
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
});

// KaTeX plugin for markdown-it
function katexPlugin(md: MarkdownIt) {
    // Inline math: $...$
    md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
        if (state.src.charCodeAt(state.pos) !== 0x24) return false; // $

        const start = state.pos;
        let pos = start + 1;

        if (pos >= state.src.length || state.src.charCodeAt(pos) === 0x24) return false;

        while (pos < state.src.length && state.src.charCodeAt(pos) !== 0x24) {
            pos++;
        }

        if (pos >= state.src.length) return false;

        const content = state.src.slice(start + 1, pos);
        if (silent) return true;

        try {
            const token = state.push('math_inline', 'math', 0);
            token.content = content.trim();
            token.markup = '$';
        } catch (error) {
            return false;
        }

        state.pos = pos + 1;
        return true;
    });

    // Display math: $$...$$
    md.block.ruler.after('blockquote', 'math_block', (state, startLine, endLine, silent) => {
        const pos = state.bMarks[startLine] + state.tShift[startLine];
        if (state.src.charCodeAt(pos) !== 0x24) return false; // $
        if (state.src.charCodeAt(pos + 1) !== 0x24) return false; // $

        const max = state.eMarks[startLine];
        if (pos + 2 > max) return false;

        let nextLine = startLine + 1;
        while (nextLine < endLine) {
            const start = state.bMarks[nextLine] + state.tShift[nextLine];
            const max = state.eMarks[nextLine];

            if (start < max && state.src.charCodeAt(start) === 0x24 &&
                state.src.charCodeAt(start + 1) === 0x24) {
                break;
            }

            nextLine++;
        }

        const content = state.src.slice(pos + 2, state.bMarks[nextLine]).trim();
        if (silent) return true;

        try {
            const token = state.push('math_block', 'math', 0);
            token.content = content.trim();
            token.markup = '$$';
            token.block = true;
        } catch (error) {
            return false;
        }

        state.line = nextLine + 1;
        return true;
    });

    // Render math tokens
    md.renderer.rules.math_inline = (tokens, idx) => {
        try {
            return katex.renderToString(tokens[idx].content, {
                throwOnError: false,
                displayMode: false,
            });
        } catch (error) {
            return `$${tokens[idx].content}$`;
        }
    };

    md.renderer.rules.math_block = (tokens, idx) => {
        try {
            return katex.renderToString(tokens[idx].content, {
                throwOnError: false,
                displayMode: true,
            });
        } catch (error) {
            return `$$\n${tokens[idx].content}\n$$`;
        }
    };
}

// Use the plugin
md.use(katexPlugin);

// Compile markdown to HTML (body only)
function compileMarkdown(markdown: string): string {
    const html = md.render(markdown);

    // Remove html, head, body tags if present
    return html
        .replace(/^<html[^>]*>/i, '')
        .replace(/<\/html>$/i, '')
        .replace(/^<head[^>]*>[\s\S]*?<\/head>/i, '')
        .replace(/^<body[^>]*>/i, '')
        .replace(/<\/body>$/i, '')
        .trim();
}

// Usage
const markdown = fs.readFileSync("./index.md", {encoding: "utf-8"});

const htmlBody = compileMarkdown(markdown);
console.log(htmlBody);
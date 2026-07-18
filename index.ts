import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import anchor from 'markdown-it-anchor';
import { slugify } from 'transliteration';
import mk from "@vscode/markdown-it-katex"
// import container from "markdown-it-container"

// Загружаем языки для подсветки синтаксиса
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import vueHljs from 'vue-highlight.js/lib/languages/vue';
import katex from "katex";

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('vue', vueHljs);

const customTags = ["Tabs", "TabPanel", "Spoiler"];

/**
 * Интерфейс данных статьи для фронтенда
 */
export interface ArticleData {
    title: string;
    description?: string;
    date?: string;
    tags?: string[];
    content: string;
    toc: { level: number; title: string; slug: string }[];
}

/**
 * Предварительная обработка контента: удаление импортов Vue-компонентов
 */
function preprocessContent(content: string): string {
    return content
        // Удаляем импорты Vue-компонентов
        .replace(/import\s+[^;]+?\.vue['"];\s*/g, '')
        // Удаляем пустые строки после удаления импортов
        .replace(/\n{3,}/g, '\n\n');
}

/**
 * Пост-обработка HTML: очистка от лишних символов
 */
function postprocessHtml(html: string): string {
    return html
        // Удаляем лишние переносы строк
        .replace(/\n\s*\n/g, '\n')
        // Удаляем пустые параграфы
        .replace(/<p>\s*<\/p>/g, '')
        // Удаляем лишние пробелы перед/после тегов
        // .replace(/>\s+</g, '><')
        // Удаляем пробелы в начале и конце
        .trim();
}

function nestedContainersPlugin(md, tagNames) {
    // Regex for opening: ::: TagName [optional attributes]
    const openRegex = new RegExp(`^\\s*:::\\s+(${tagNames.join('|')})(?:\\s+(.*))?$`, 'i');
    // Regex for closing: ::: /TagName
    const closeRegex = /^:::\s+\/([a-zA-Z0-9_]+)\s*$/;

    md.block.ruler.before('fence', 'nested_container', (state, startLine, endLine, silent) => {
        const pos = state.bMarks[startLine] + state.tShift[startLine];
        const max = state.eMarks[startLine];
        const lineText = state.src.slice(pos, max);

        const openMatch = lineText.match(openRegex);
        const closeMatch = lineText.match(closeRegex);

        if (!openMatch && !closeMatch) return false;
        if (silent) return true; // Prevent parser errors during validation

        // Initialize stack in environment if not exists
        if (!state.env.containerStack) state.env.containerStack = [];

        if (openMatch) {
            const tagName = openMatch[1];
            const attrs = openMatch[2] || '';

            state.env.containerStack.push(tagName);

            const token = state.push('nested_container_open', tagName, 1);
            token.markup = ':::';
            token.info = attrs;
            token.map = [startLine, startLine + 1];

            state.line = startLine + 1;
            return true;
        }

        if (closeMatch) {
            const tagName = closeMatch[1];

            // Pop from stack until we find the matching tag (handles missing closes gracefully)
            while (state.env.containerStack.length > 0) {
                const last = state.env.containerStack.pop();
                if (last === tagName) break;
            }

            const token = state.push('nested_container_close', tagName, -1);
            token.markup = ':::';
            token.map = [startLine, startLine + 1];

            state.line = startLine + 1;
            return true;
        }

        return false;
    });

    // Renderers
    md.renderer.rules.nested_container_open = (tokens, idx) => {
        const token = tokens[idx];
        const attrs = token.info ? ` ${token.info}` : '';
        return `<${token.tag}${attrs}>\n`;
    };

    md.renderer.rules.nested_container_close = (tokens, idx) => {
        return `</${tokens[idx].tag}>\n`;
    };
}

/**
 * Получает данные статьи по пути к папке
 * @param articlePath Путь к папке со статьей
 * @returns Данные статьи для использования в Vue фронтенде
 */
export async function getArticleData(articlePath: string): Promise<ArticleData> {
    // Определяем возможные файлы статьи
    const possibleFiles = ['index.md', 'README.md'];
    let filePath: string | undefined;

    // Ищем существующий файл статьи
    for (const file of possibleFiles) {
        const candidate = path.join(articlePath, file);
        try {
            await fs.access(candidate);
            filePath = candidate;
            break;
        } catch {}
    }

    if (!filePath) {
        throw new Error(`Article file not found in ${articlePath}`);
    }

    // Читаем содержимое файла
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Парсим frontmatter
    const { data: frontmatter, content: rawContent } = matter(fileContent);

    // Предварительная обработка контента
    const cleanedContent = preprocessContent(rawContent);

    // Настройка Markdown парсера
    const md = new MarkdownIt({
        html: true,
        xhtmlOut: true,
        linkify: true,
        typographer: true,
        highlight: (str: string, lang: string): string => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    const highlighted = hljs.highlight(str, { language: lang });
                    // console.log(`<pre class="language-${lang}"><code>${highlighted.value}</code></pre>`);
                    return `<pre class="language-${lang}"><code>${highlighted.value}</code></pre>`;
                } catch (err) {
                    console.error('Highlight error:', err);
                }
            }
            return `<pre><code>${md.utils.escapeHtml(str)}</code></pre>`;
        }
    });

    // customTags.forEach(tag => {
    //     md.use(container, tag, {
    //         // Optional: Custom validation if you want to ensure the tag name matches exactly
    //         // @ts-ignore
    //         validate: function(params) {
    //             return params.trim().match(new RegExp(`^${tag}\\b`, 'i'));
    //         },
    //         // @ts-ignore
    //         render: function (tokens, idx) {
    //             // Extract the tag name and any trailing attributes (e.g., value="0")
    //             const regex = new RegExp(`^${tag}\\s*(.*)$`, 'i');
    //             const m = tokens[idx].info.trim().match(regex);
    //
    //             // m[1] contains everything after the tag name
    //             const attrs = m && m[1] ? m[1].trim() : '';
    //             console.log(tokens[idx]);
    //
    //             if (tokens[idx].nesting === 1) {
    //                 // Opening tag: append attributes if they exist
    //                 return `<${tag}${attrs ? ' ' + attrs : ''}>\n`;
    //             } else {
    //                 // Closing tag
    //                 return `</${tag}>\n`;
    //             }
    //         }
    //     });
    // });

    md.use(mk);
    md.use(nestedContainersPlugin, customTags);

    // Добавляем плагин для генерации якорей (необходимо для TOC)
    md.use(anchor, {
        permalink: false,
        slugify: (s: string) => slugify(s.trim(), { lowercase: true, separator: '-' }),
        level: [1, 2, 3, 4]
    });

    // Генерируем HTML из Markdown
    const rawHtml = md.render(cleanedContent);

    // Пост-обработка HTML
    const htmlContent = postprocessHtml(rawHtml);

    // Извлекаем оглавление из контента
    const toc = extractTableOfContents(htmlContent);

    return {
        title: (frontmatter.title as string) || 'Untitled',
        description: frontmatter.description as string | undefined,
        date: frontmatter.date as string | undefined,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        content: htmlContent,
        toc
    };
}

/**
 * Извлекает оглавление из HTML содержимого
 */
function extractTableOfContents(html: string): { level: number; title: string; slug: string }[] {
    const headings: { level: number; title: string; slug: string  }[] = [];
    const headingRegex = /<h([1-4])\s+id="([^"]+)">(.+?)<\/h\1>/gi;
    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(html)) !== null) {
        if (match[1] && match[2] && match[3]) {
            const level = parseInt(match[1], 10);
            const slug = match[2];
            const title = match[3]
                .replace(/<\/?[^>]+(>|$)/g, '') // Удаляем HTML-теги внутри заголовка
                .replace(/&nbsp;/g, ' ')       // Заменяем HTML-пробелы
                .trim();

            headings.push({
                level,
                title,
                slug
            });
        }
    }

    return headings;
}

getArticleData("./test").then(data => console.log(data.content));
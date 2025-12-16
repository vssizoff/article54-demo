import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import anchor from 'markdown-it-anchor';
import { slugify } from 'transliteration';

// Загружаем языки для подсветки синтаксиса
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);

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
        .replace(/>\s+</g, '><')
        // Удаляем пробелы в начале и конце
        .trim();
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
                    const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true });
                    return `<pre class="language-${lang}"><code>${highlighted.value}</code></pre>`;
                } catch (err) {
                    console.error('Highlight error:', err);
                }
            }
            return `<pre><code>${md.utils.escapeHtml(str)}</code></pre>`;
        }
    });

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
    const headings: { level: number; title: string; slug: string }[] = [];
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

getArticleData("./test").then(console.log);
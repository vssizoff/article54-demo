import { compile } from '@mdx-js/mdx';
import fs from 'fs/promises';
import path from 'path';
import { RecmaPlugin, RehypePlugin, RemarkPlugin } from '@mdx-js/mdx/lib/plugin'; // Types for plugins

interface CompileOptions {
    mdxFiles: string[]; // Array of paths to MDX files
    outputPath: string; // Path to save the compiled JS file
    remarkPlugins?: RemarkPlugin[]; // Optional remark plugins
    rehypePlugins?: RehypePlugin[]; // Optional rehype plugins
    recmaPlugins?: RecmaPlugin[]; // Optional recma plugins for import validation or modification
}

async function compileMdxToJs(options: CompileOptions): Promise<void> {
    const { mdxFiles, outputPath, remarkPlugins = [], rehypePlugins = [], recmaPlugins = [] } = options;

    // Read and merge contents of all MDX files
    let mergedContent = '';
    for (const filePath of mdxFiles) {
        const content = await fs.readFile(filePath, 'utf-8');
        mergedContent += `\n\n${content}`; // Merge with separators; adjust as needed (e.g., add headings)
    }

    // Compile the merged MDX content to JS
    // Use providerImportSource for Vue compatibility
    // This will generate JS that imports from '@mdx-js/vue' and keeps component imports intact
    const compiledJs = await compile(mergedContent, {
        outputFormat: 'program', // Full ES module format
        providerImportSource: '@mdx-js/vue', // For Vue MDX provider
        remarkPlugins, // Support for remark plugins (Markdown processing)
        rehypePlugins, // Support for rehype plugins (HTML processing)
        recmaPlugins, // Support for recma plugins (JS AST processing, e.g., for validating import paths)
    });

    // Write the compiled JS to the output file
    await fs.writeFile(outputPath, compiledJs.toString(), 'utf-8');
    console.log(`Compiled MDX to JS at: ${outputPath}`);
}

// Example usage:
// Define any custom recma plugins here for path validation
// For instance, a simple recma plugin to log imports (extend for validation)
const exampleRecmaPlugin: RecmaPlugin = () => (tree) => {
    // Traverse the JS AST to find imports
    // Use 'estree-util-visit' or similar for actual traversal
    console.log('Checking imports in RECma...');
    // Example: Validate paths start with '@/components/' or throw error
    return tree;
};

// Run the compilation
compileMdxToJs({
    mdxFiles: ['./main.mdx', "./test.mdx"],
    outputPath: './output.js',
    // recmaPlugins: [exampleRecmaPlugin], // Pass custom recma plugins for path checking
    // Add remark/rehype plugins as needed
}).catch(console.error);
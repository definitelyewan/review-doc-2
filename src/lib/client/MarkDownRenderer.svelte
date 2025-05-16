<script lang="ts">
    import type { PageProps } from './$types';
    import { Progress } from '@skeletonlabs/skeleton-svelte';
    import { marked } from 'marked';

    let { md = '', darkMode = false, mobile = false}: PageProps = $props();
    

    
    const renderMarkdown = (markdown: string): string => marked(markdown);


    let html = renderMarkdown(md);

    html = html.replaceAll('<img', '<img class="w-full max-w-xs max-h-64 object-contain"');

    if (mobile) {
        const tagsToShrink = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'blockquote', 'code', 'pre', 'strong', 'em', 'ul', 'ol', 'table', 'th', 'td'];
        for (const tag of tagsToShrink) {
            html = html.replaceAll(`<${tag}`, `<${tag} class="text-xs"`);
        }
    }

</script>

<style>

    .custom-prose-dark :global(h1),
    .custom-prose-dark :global(h2),
    .custom-prose-dark :global(h3),
    .custom-prose-dark :global(h4),
    .custom-prose-dark :global(h5),
    .custom-prose-dark :global(h6),
    .custom-prose-dark :global(p),
    .custom-prose-dark :global(li),
    .custom-prose-dark :global(a),
    .custom-prose-dark :global(blockquote),
    .custom-prose-dark :global(code),
    .custom-prose-dark :global(pre),
    .custom-prose-dark :global(strong),
    .custom-prose-dark :global(em),
    .custom-prose-dark :global(ul),
    .custom-prose-dark :global(ol),
    .custom-prose-dark :global(table),
    .custom-prose-dark :global(th),
    .custom-prose-dark :global(td) {
        color: #FFFFFF !important;
    }

    .custom-prose-dark :global(blockquote) {
        border-left: 4px solid #FFFFFF;
        padding-left: 1rem;
        font-style: italic;
    }

    .custom-prose-dark :global(code) {
        background-color: #333333;
        color: #FFD700;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
    }

    .custom-prose-dark :global(pre) {
        background-color: #333333;
        color: #FFFFFF;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
    }

    .custom-prose-dark :global(strong) {
        font-weight: bold;
    }

    .custom-prose-dark :global(em) {
        font-style: italic;
    }

    .custom-prose-dark :global(ul),
    .custom-prose-dark :global(ol) {
        padding-left: 2rem;
    }

    .custom-prose-dark :global(table) {
        width: 100%;
        border-collapse: collapse;
    }

    .custom-prose-dark :global(th),
    .custom-prose-dark :global(td) {
        border: 1px solid #FFFFFF;
        padding: 0.5rem;
        text-align: left;
    }

</style>




{#if darkMode == true}
    <div class="prose custom-prose-dark">
        {@html html}
    </div>
{:else}
    <div class="prose">
        {@html html}
    </div>
{/if}
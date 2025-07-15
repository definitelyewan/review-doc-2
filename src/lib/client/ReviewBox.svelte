<script lang="ts">
    import type { PageProps } from './$types';
    import { onMount } from 'svelte';
    import ReviewBar from '$lib/client/ReviewBar.svelte';
    import { marked } from 'marked';

    let { type = 'other', name = '', subName = '', md = '', score = 0, date = '0000-00-00'}: PageProps = $props();

    let isDarkMode = $state(false);
    

    onMount(() => {
        if (window.matchMedia) {
            isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
    });

    function updateHtml(md: string, mobileMode: boolean){

        const renderMarkdown = (markdown: string): string => marked(markdown);
        let updatedSource: string = renderMarkdown(md);

        updatedSource = updatedSource.replaceAll('<img', '<img class="w-full max-w-xs max-h-64 object-contain"');

        if (mobileMode) {
            const tagsToShrink = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'blockquote', 'code', 'pre', 'strong', 'em', 'ul', 'ol', 'table', 'th', 'td'];
            for (const tag of tagsToShrink) {
                updatedSource = updatedSource.replaceAll(`<${tag}`, `<${tag} class="text-xs"`);
            }
        }

        return updatedSource;
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


<div id="reviewContainer" class="flex-1 px-4">
    <p class="md:text-4xl text-xl drop-shadow-lg text-shadow-outline dark:text-white text-[#121212]"><b>{name}</b></p>

    <div class="flex flex-wrap flex-col gap-2">
        <div class="card w-full drop-shadow-lg preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 block divide-y overflow-hidden border-[1px]">
            <div class="p-2">
                {#if subName && type == 'tv'}
                    <div class="text-xl">
                        {#await Promise.resolve(subName.match(/\d+/g)) then numbers}
                            {#if numbers && numbers.length == 1}
                                <p class="text-sm md:text-xl">Season: {numbers[0]}</p>
                            {:else if numbers && numbers.length > 1}
                                <p class="text-sm md:text-xl">Season: {numbers[0]} - {numbers[numbers.length - 1]}</p>
                            {/if}
                        {:catch error}
                            <p>Error processing the string.</p>
                        {/await}
                    </div>
                {:else if subName && type == 'game'}
                    <p class="text-sm md:text-xl">{subName}</p>
                {/if}
                {#if score != -1 }
                    <div class="flex items-center">
                        {#if score == 0}
                            <ReviewBar value={0} limit={10}/>
                            <p class="text-md md:text-xl px-2"><b>💀/10</b></p>
                        {:else}
                            <ReviewBar value={score} limit={10}/>
                            <p class="text-md md:text-xl px-2"><b>{score}/10</b></p>
                        {/if}

                    </div>
                {/if}

                {#if md != undefined}
                    <hr class="mt-1 hr" />
                    <div class="mt-1 mb-1">

                {#if isDarkMode == true}
                    <div class="prose custom-prose-dark max-w-none">
                        <div class="md:block hidden">
                            {@html updateHtml(md, false)}
                        </div>
                        <div class="block md:hidden">
                            {@html updateHtml(md, true)}
                        </div>
                    </div>
                {:else}
                    <div class="prose max-w-none">
                        <div class="md:block hidden">
                            {@html updateHtml(md, false)}
                        </div>
                        <div class="block md:hidden">
                            {@html updateHtml(md, true)}
                        </div>
                    </div>
                {/if}
                    </div>

                {/if}

                <hr class="hr" />
                <div>
                    <p class="text-xs drop-shadow-lg text-shadow-outline dark:text-white text-[#121212]">From {date}</p>
                </div>
            </div>
        </div>
    </div>
</div>
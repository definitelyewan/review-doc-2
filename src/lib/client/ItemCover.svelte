<script lang="ts">
    import type { PageProps } from './$types';
    let { width="w-1/4", height="h-1/2", cover='', id=-1, scroll=true }: PageProps = $props();

    let scrollState = (scroll == true) ? "sticky top-4" : "";
</script>

<div
    class="rounded-lg outline-2 outline-gray-300 drop-shadow-lg preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 block {width} {height} border-[1px] overflow-visible {scrollState}"
>
    {#if id}
        <a href="/item/{id}">
            <header class="h-full w-full">
                <img src={cover} class="h-full w-full object-fill" alt="banner" />
            </header>
        </a>
    {:else}
        <header class="h-full w-full">
            <img src={cover} class="h-full w-full object-fill" alt="banner" />
        </header>
    {/if}
</div>
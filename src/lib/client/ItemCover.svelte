<script lang="ts">
    import type { PageProps } from './$types';
    import IconRotateCcw from '@lucide/svelte/icons/rotate-ccw';
    let { width="w-1/4", height="h-1/2", cover='', id=-1, scroll=true, rewatch=false }: PageProps = $props();

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

    {#if rewatch}
        <div class="absolute bottom-2 right-2">
            <div class="p-0.5 flex flex-col items-center justify-center card drop-shadow-lg preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 divide-y overflow-hidden border-[1px]">
                <IconRotateCcw class="md:size-6 size-2" />
            </div>
        </div>
    {/if}
</div>
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
        <a href="/item/{id}" class="relative h-full w-full">
            {#if rewatch == true}
                <div class="absolute top-2 left-2 z-10 flex flex-col items-center">
                    <IconRotateCcw class="size-8 p-1 rounded-full" />
                    <span class="text-xs text-white mt-1">Rewatch</span>
                </div>
            {/if}
            <header class="h-full w-full">
                <img src={cover} class="h-full w-full object-fill" alt="banner" />
            </header>
        </a>
    {:else}
        <header class="relative h-full w-full">
            <img src={cover} class="h-full w-full object-fill" alt="banner" />
        </header>
    {/if}
</div>
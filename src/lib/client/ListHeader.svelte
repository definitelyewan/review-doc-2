<script lang="ts">
    import type { PageProps } from './$types';
    import ItemCover from '$lib/client/ItemCover.svelte';
    import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

    let { width="w-full", height="h-full", name=undefined, desc=undefined, items=[], fullDesc=false}: PageProps = $props();

    let maxCovers = 3;
    let nCovers = $state((items.length > maxCovers) ? maxCovers : items.length );
    // const truncatedDesc = desc && desc.length > 100 ? desc.slice(0, 100) + '…' : desc;
</script>



<div
    id="displaycard"
    class="card rounded-lg outline-2 outline-gray-300 drop-shadow-lg relative w-full overflow-hidden flex flex-row items-stretch gap-2 h-full"
>
    {#each {length: nCovers} as _, i}
        <div
        class="flex-shrink-0 w-1/5 flex items-stretch justify-center{ i !== 0 ? ' -ml-[18%]' : '' }"
        style="z-index: {nCovers - i};"
        >
            <ItemCover
                cover={items[i].cover}
                width={width}
                height={height}
                scroll={false}
                class="w-full h-full object-contain block"
            />
        </div>
    {/each}
    <div class="p-2">
        <div class="flex">
            <p class="md:text-2xl text-xl drop-shadow-lg text-shadow-outline dark:text-white text-[#121212] break-words whitespace-normal"><b>{name}</b></p>
            <div class="ml-2 p-0.5 flex flex-col items-center justify-center card drop-shadow-lg preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 divide-y overflow-hidden border-[1px]">
                {items.length} Items
            </div>
            
            
        </div>
        {#if fullDesc == true}
            <p>{desc}</p>
        {:else}
            <div class="md:hidden block">
                <p>{desc.slice(0, 100) + (desc.length > 100 ? "..." : "")}</p>
            </div>
            <div class="md:block hidden">
                <p>{desc.slice(0, 300) + (desc.length > 300 ? "..." : "")}</p>
            </div>
        {/if}
        
    </div>
</div>

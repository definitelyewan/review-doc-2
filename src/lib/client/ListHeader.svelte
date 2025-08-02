<script lang="ts">
    import type { PageProps } from './$types';
    import ItemCover from '$lib/client/ItemCover.svelte';
    import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

    let { name=undefined, desc=undefined, items=[] }: PageProps = $props();

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
                width="w-full"
                height="h-full"
                id={items[i].id}
                scroll={false}
                class="w-full h-full object-contain block"
            />
        </div>
    {/each}
    <div class="p-2">
        <div class="flex">
            <p class="md:text-2xl text-xl drop-shadow-lg text-shadow-outline dark:text-white text-[#121212] break-words whitespace-normal"><b>{name}</b></p>
            <p>{items.length}</p>
            <ArrowUpRight size=18/>
            
            
        </div>
        <div class="md:hidden block">
            <p>{desc.slice(0, 100) + (desc.length > 100 ? "..." : "")}</p>
        </div>
        <div class="md:block hidden">
            <p>{desc.slice(0, 300) + (desc.length > 300 ? "..." : "")}</p>
        </div>
        
    </div>
</div>

<script lang="ts">
	import type { PageProps } from './$types';
	import ItemCover from '$lib/client/ItemCover.svelte';
    import IconArrowLeft from '@lucide/svelte/icons/arrow-left';
    import IconArrowRight from '@lucide/svelte/icons/arrow-right';
    import IconEllipsis from '@lucide/svelte/icons/ellipsis';
    import IconFirst from '@lucide/svelte/icons/chevrons-left';
    import IconLast from '@lucide/svelte/icons/chevron-right';
	import { Pagination } from '@skeletonlabs/skeleton-svelte';


	let { data }: PageProps = $props();
    let page = $state(1);
    let size = $state(20);
    const slicedSource = $derived((s: any []) => s.slice((page - 1) * size, page * size));
	let userInput = $state("");
	const blocks: any[] = data.blocks;

    let filteredBlocks = $derived(userInput.length > 0
        ? blocks.filter((item) => item.name.toLowerCase().includes(userInput.toLowerCase()))
        : blocks);
</script>

<title>Review Doc - Search</title>
<div id="top"></div>


<div class="md:mx-32 mx-2 my-2">
    <p class="text-center md:text-3xl text-xl dark:text-white text-[#121212] drop-shadow-lg text-shadow-outline">Search</p>
    <input
        type="text"
        bind:value={userInput}
        placeholder="Type something..."
        class="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
    />
</div>


<div class="flex w-full p-2 items-center justify-center overflow-x-auto max-w-screen">
    <a href="#top">
        <div class="md:block hidden">
            <Pagination
                data={blocks}
                {page}
                onPageChange={(e) => (page = e.page)}
                pageSize={size}
                onPageSizeChange={(e) => (size = e.pageSize)}
                siblingCount={4}
            >
                {#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
                {#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
                {#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
                {#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
                {#snippet labelLast()}<IconLast class="size-4" />{/snippet}
            </Pagination>
        </div>
        <div class="block md:hidden">
            <Pagination
                data={blocks}
                {page}
                onPageChange={(e) => (page = e.page)}
                pageSize={size}
                onPageSizeChange={(e) => (size = e.pageSize)}
                siblingCount={4}
                alternative
            >
                {#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
                {#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
                {#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
                {#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
                {#snippet labelLast()}<IconLast class="size-4" />{/snippet}
            </Pagination>
        </div>
    </a>

</div>

<div class="md:mx-32 mx-2 my-2">
    <div class="flex flex-wrap gap-4 justify-center">
        {#each slicedSource(filteredBlocks) as item}
            <div
                id="displaycard"
                class="card rounded-lg outline-2 outline-gray-300 drop-shadow-lg relative w-full sm:w-1/3 overflow-hidden"
                style="background-image: url({item.banner}); background-size: cover; background-position: center;"
            >
                <div class="absolute inset-0 bg-gradient-to-b dark:from-[#121212]/100 dark:to-transparent from-[#fcfcfc]/100 to-transparent z-0"></div>
                <div class="absolute inset-0 bg-gradient-to-t dark:from-[#121212]/100 dark:to-transparent from-[#fcfcfc]/100 to-transparent z-0"></div>
                <div class="relative z-10 flex flex-row items-stretch gap-2 h-full">
                    <div class="flex-shrink-0 w-1/3 h-full flex items-center justify-center">
                        <ItemCover cover={item.url} width="w-full" height="h-full" href={"/item/" + item.id} scroll={false}/>
                    </div>
                    <div class="flex flex-col justify-center flex-1 min-w-0">
                        <p class="md:text-2xl text-xl drop-shadow-lg text-shadow-outline dark:text-white text-[#121212] break-words whitespace-normal">{item.name}</p>
                        <p class="text-md drop-shadow-lg text-shadow-outline dark:text-white text-[#121212] truncate">Released: {item.date}</p>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<div class="flex w-full p-2 items-center justify-center overflow-x-auto max-w-screen">
    <a href="#top">
        <div class="md:block hidden">
            <Pagination
                data={blocks}
                {page}
                onPageChange={(e) => (page = e.page)}
                pageSize={size}
                onPageSizeChange={(e) => (size = e.pageSize)}
                siblingCount={4}
            >
                {#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
                {#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
                {#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
                {#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
                {#snippet labelLast()}<IconLast class="size-4" />{/snippet}
            </Pagination>
        </div>
        <div class="block md:hidden">
            <Pagination
                data={blocks}
                {page}
                onPageChange={(e) => (page = e.page)}
                pageSize={size}
                onPageSizeChange={(e) => (size = e.pageSize)}
                siblingCount={4}
                alternative
            >
                {#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
                {#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
                {#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
                {#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
                {#snippet labelLast()}<IconLast class="size-4" />{/snippet}
            </Pagination>
        </div>
    </a>
</div>




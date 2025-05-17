<script lang="ts">
	import type { PageProps } from './$types';
    import type { displayReview } from '$lib/types';
    import { Pagination } from '@skeletonlabs/skeleton-svelte';
    import ReviewBox from '$lib/client/ReviewBox.svelte';
    import ItemCover from '$lib/client/ItemCover.svelte';

    import IconArrowLeft from '@lucide/svelte/icons/arrow-left';
    import IconArrowRight from '@lucide/svelte/icons/arrow-right';
    import IconEllipsis from '@lucide/svelte/icons/ellipsis';
    import IconFirst from '@lucide/svelte/icons/chevrons-left';
    import IconLast from '@lucide/svelte/icons/chevron-right';

    let { data }: PageProps = $props();

    const blocks = data.blocks;
    let page = $state(1);
    let size = $state(20);
    let slicedSource = $derived((s: displayReview[]) => s.slice((page - 1) * size, page * size));

</script>

<title>Review Doc - Home</title>



<div class="flex w-full p-2 items-center justify-center overflow-x-auto max-w-screen">
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

</div>



{#each slicedSource(blocks) as block}
    <div id="reviewBox" class="w-screen relative" style="background-image: url({block.item.banner}); background-size: cover; background-position: center;">
        <!-- Gradient overlays -->
        <div class="absolute inset-0 bg-gradient-to-b dark:from-[#121212]/100 dark:to-transparent from-[#fcfcfc]/100 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t dark:from-[#121212]/100 dark:to-transparent from-[#fcfcfc]/100 to-transparent"></div>

        <div class="flex flex-row md:mx-32 mx-2 mt-4 relative">

            <!-- Card Section -->
            <ItemCover cover={block.item.cover} id={block.item.id} scroll={true}/>

            <!-- Review Container Section -->
            <ReviewBox type={block.item.type} name={block.item.name} subName={block.review.sub} md={block.review.md} score={block.review.score} date={block.review.date}/>

        </div>
    </div>

{/each}

<div class="flex w-full p-2 items-center justify-center overflow-x-auto max-w-screen">
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

</div>
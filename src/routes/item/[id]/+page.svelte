<script lang="ts">
	import type { PageProps } from './$types';
    import type { itemStructure, itemReview, listStructure } from '$lib/types';
    import ReviewBox from '$lib/client/ReviewBox.svelte';
	import ReviewBar from '$lib/client/ReviewBar.svelte';
    import ListHeader from '$lib/client/ListHeader.svelte';
    import ItemCover from '$lib/client/ItemCover.svelte';
    import Link from '@lucide/svelte/icons/link';
    import LayoutList from '@lucide/svelte/icons/layout-list';

	let { data }: PageProps = $props();


	const itemData: itemStructure = $derived(data.itemData);
    const reviewDatas: itemReview [] = $derived(data.reviewDatas);
    const links: itemStructure [] = $derived(data.links);
    const lists: listStructure [] = $derived(data.list);
    const avgScore = data.avgScore;
    let preDateString = $state('');

    $effect(() => {
        if (itemData.type == 'tv') {
            preDateString = 'First Aired';
        } else {
            preDateString = 'Released';
        }
    });


</script>

<title>Review Doc - {itemData.name}</title>

<header class="absolute top-0 left-0 w-screen h-screen z-[-1]">
    <img
        src={itemData?.banner}
        class="w-full h-full object-cover"
        alt="banner"
    />
    <div class="absolute inset-0 bg-gradient-to-b dark:from-[#121212]/100 dark:to-transparent from-[#fcfcfc]/100 to-transparent"></div>
    <div class="absolute inset-0 bg-gradient-to-t dark:from-[#121212]/100 dark:to-transparent from-[#fcfcfc]/100 to-transparent"></div>
</header>


<div class="flex flex-row md:mx-32 mx-2 mt-4 relative">
    <!-- Card Section -->
    <div
        class="rounded-lg outline-2 outline-gray-300 drop-shadow-lg preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 block h-1/2 w-1/4 border-[1px] overflow-visible sticky top-4"
    >
        <header>
            <img src={itemData?.cover} class="w-full" alt="banner" />
        </header>
    
        <article class="space-y-4 p-4">
            <div class="flex w-full flex-col items-start">
                <ReviewBar value={avgScore} limit={10}/>
                <p class="mt-2 md:text-start text-center">Average {avgScore}/10</p>
            </div>
        </article>
    </div>

    <!-- Review Container Section -->
    <div id="reviewContainer" class="flex-1">
        <p class="md:text-5xl text-2xl drop-shadow-lg text-shadow-outline dark:text-white text-[#121212] ml-5"><b>{itemData?.name}</b></p>
        
        <p class="md:text-2xl text-md drop-shadow-lg text-shadow-outline dark:text-white text-[#121212] ml-5"><b>{preDateString} : {itemData?.release}</b></p>
    
        <div class="flex flex-wrap flex-col">
            {#each reviewDatas as reviewData}
                <div class="my-2">
                    <ReviewBox type={itemData.type} subName={reviewData.sub} md={reviewData.md} score={reviewData.score} date={reviewData.date}/>
                </div>
                

            {/each}
        </div>
        
        {#if links.length > 0}
            <div id="linkContainer" class="mx-4 py-2">
                <div class="w-full">
                    <div class="flex flex-row">
                        <p class="md:text-3xl text-xl drop-shadow-lg text-shadow-outline dark:text-white text-[#121212]"><b>Related</b></p>
                        <Link class="ml-1 mt-2" size={18}/>
                    </div>
                    
                    <hr class="hr border-t-2 border-[#121212] dark:border-white shadow-lg" />
                    <div class="flex flex-wrap py-2">
                        {#each links as link}
                            <div class="p-2 md:w-1/4 w-1/3">
                                <ItemCover width="w-full", height="h-full" cover={link.cover} href="/item/{link.id}" sticky={false}/>
                            </div>
                            
                        {/each}
                    </div>

                </div>
            </div>
        {/if}

        {#if lists.length > 0}

            <div id="listContainer" class="mx-4 my-2">
                <div class="w-full">
                    <div class="flex flex-row">
                        <p class="md:text-3xl text-xl drop-shadow-lg text-shadow-outline dark:text-white text-[#121212]"><b>Lists</b></p>
                        <LayoutList class="ml-1 mt-2" size={18}/>
                    </div>

                    <hr class="hr border-t-2 border-[#121212] dark:border-white shadow-lg mb-2" />
                    <div class="flex flex-wrap gap-4 justify-center">
                        {#each lists as list}
                            <a
                                href="/list/{list.id.toString()}"
                                class="w-full flex-shrink-0"
                            >
                                <ListHeader name={list.name} desc={list.desc}/>
                            </a>
                        {/each}

                    </div>
                </div>
            </div>
        {/if}


        
    </div>
</div>


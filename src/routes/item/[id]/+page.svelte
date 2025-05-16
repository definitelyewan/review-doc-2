<script lang="ts">
	import type { PageProps } from './$types';
    import type { itemStructure, itemReview } from '$lib/types';
    import ReviewBox from '$lib/client/ReviewBox.svelte';
	import ReviewBar from '$lib/client/ReviewBar.svelte';

	let { data }: PageProps = $props();


	const itemData: itemStructure = data.itemData;
    const reviewDatas: itemReview [] = data.reviewDatas;
    const avgScore = data.avgScore;
    let preDateString = $state('');



    if (itemData.type == 'tv') {
        preDateString = 'First Aired';
    } else {
        preDateString = 'Released';
    }




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
            {#each reviewDatas as reviewData, i}
                <div class="my-2">
                    <ReviewBox type={itemData.type} subName={reviewData.sub} md={reviewData.md} score={reviewData.score} date={reviewData.date}/>
                </div>
                

            {/each}
        </div>
    </div>
</div>


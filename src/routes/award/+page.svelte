<script lang="ts">
	import type { PageProps } from './$types';
    import type { groupedAwards } from '$lib/types';
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import Trophy from '@lucide/svelte/icons/trophy';
    import Award from '@lucide/svelte/icons/medal';

	let { data }: PageProps = $props();

    const uniqueYearAwards = data.blocks;
	let maxYear: number = 0;
    
    
    if (uniqueYearAwards.length != 0) {
        maxYear = Math.max(...uniqueYearAwards.map((block) => block.year));
    }
    
    
    let yearValue = $state([String(maxYear)]);
    let openCatagories = $state(['']);

    

</script>

<title>Awards</title>

<div class="md:mx-32 mx-4 mt-2 mb-2">
    <Accordion value={yearValue} onValueChange={(e) => (yearValue = e.value)} multiple>
        {#each uniqueYearAwards as uniqueYear}
            <Accordion.Item value={String(uniqueYear.year)}>
                {#snippet lead()}<Trophy size={24} />{/snippet}
                {#snippet control()}
                    <p class="text-2xl">
                        {uniqueYear.year}
                    </p>
                {/snippet}
                {#snippet panel()}
                    <div class="w-full flex justify-center items-center p-2">
                        <p class="text-2xl">Winners</p>
                    </div>
                    <div class="w-full flex flex-wrap justify-center items-center">
                        {#each Object.entries(uniqueYear.awards) as [awardName, awards]}
                            {#each awards as award}
                                {#if award.award_granted == true}
                                    <a 
                                        href="/item/{award.item.item_id}" 
                                        class="flex flex-col items-center m-4 md:w-40"
                                    >
                                        <div class="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden outline-2 outline-gray-300">
                                            <img 
                                                src="{award.item.item_cover_overide_url}" 
                                                alt="{awardName}" 
                                                class="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p class="text-center mt-2 md:text-sm text-[0.625rem] break-words whitespace-nowrap overflow-hidden text-ellipsis">
                                            {awardName.split(' ')[0]}
                                        </p>
                                    </a>
                                {/if}
                            {/each}
                        {/each}
                    </div>

                    <div class="w-full flex justify-center items-center p-2">
                        <p class="text-2xl">Catagories</p>
                        
                    </div>
                    <hr class="hr" />
                    <Accordion value={openCatagories} onValueChange={(e) => (openCatagories = e.value)} multiple>
                        {#each Object.entries(uniqueYear.awards) as [awardName, awards]}
                            <Accordion.Item value={String(awardName + uniqueYear.year)}>
                                {#snippet lead()}<Award size={18} />{/snippet}
                                {#snippet control()}
                                    <p class="text-xl">
                                        {awardName}
                                    </p>
                                {/snippet}
                                {#snippet panel()}
                                    <div class="w-full flex flex-wrap justify-center items-center">
                                        {#each awards as award}
                                            <a 
                                                href="/item/{award.item.item_id}" 
                                                class="flex flex-col items-center m-4 md:w-40"
                                            >
                                                {#if award.award_granted == true}
                                                    <div class="md:w-30 md:h-50 w-20 h-30 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden outline-2 outline-gray-300">
                                                        <img 
                                                            src="{award.item.item_cover_overide_url}" 
                                                            alt="{awardName}" 
                                                            class="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <p class="text-center mt-2 md:text-sm text-[0.625rem] break-words whitespace-nowrap overflow-hidden text-ellipsis">
                                                        Winner
                                                    </p>
                                                {:else}
                                                    <div class="md:w-30 md:h-50 w-20 h-30 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden outline-2 outline-gray-300">
                                                        <img 
                                                            src="{award.item.item_cover_overide_url}" 
                                                            alt="{awardName}" 
                                                            class="w-full h-full object-cover brightness-25"
                                                        />
                                                    </div>
                                                    <p class="text-center mt-2 md:text-sm text-[0.625rem] break-words whitespace-nowrap overflow-hidden text-ellipsis">
                                                        Nominated
                                                    </p>
                                                {/if}
                                            </a>
                                        {/each}
                                    </div>
                                {/snippet}
                            </Accordion.Item>
                            <hr class="hr" />
                        {/each}
                    </Accordion>
                {/snippet}
            </Accordion.Item>
            <hr class="hr" />
        {/each}
    </Accordion>
</div>


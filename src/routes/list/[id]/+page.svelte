<script lang="ts">
    import type { PageProps } from './$types';
    import ListHeader from '$lib/client/ListHeader.svelte';
    import ReviewBar from '$lib/client/ReviewBar.svelte';
    import ItemCover from '$lib/client/ItemCover.svelte';

    let { data }: PageProps = $props();

    const listInfo = data.list;
    const avgScore = data.avg;

    let maxCovers = 3;
    let nCovers = $state((listInfo.items.length > maxCovers) ? maxCovers : listInfo.items.length );
</script>

<title>Review Doc - {listInfo.name}</title>


<div class=" flex flex-wrap flex-row md:mx-32 mx-2 mt-4 mb-4 relative">
    <div id="infoContainer" class="w-1/3 px-2">
        <div
            id="displaycard"
            class="card rounded-lg outline-2 outline-gray-300 drop-shadow-lg relative overflow-hidden flex flex-row items-stretch gap-2"
        >
            <div class="flex flex-col">
                <div class="mt-2 flex flex-row justify-center">
                    {#each {length: nCovers} as _, i}
                        <div
                            class="flex-shrink-0 w-1/3 flex items-stretch justify-center{ i !== 0 ? ' -ml-[18%]' : '' }"
                            style="z-index: {nCovers - i};"
                        >
                            <ItemCover
                                cover={listInfo.items[i].cover}
                                width="w-full"
                                height="h-full"
                                scroll={false}
                            />
                        </div>
                    {/each}
                </div>
                <div class="p-2 text-center">
                    <p class=" md:text-4xl text-xl drop-shadow-lg text-shadow-outline dark:text-white text-[#121212]"><b>{listInfo.name}</b></p>
                    <div class="flex flex-col justify-center items-center">
                        <ReviewBar value={avgScore} limit={10}/>
                        {#if avgScore == 0}
                            <p class="text-md md:text-xl px-2"><b>💀/10</b></p>
                        {:else}
                            <p class="text-md md:text-xl px-2"><b>{avgScore.toFixed(2)}/10</b></p>
                        {/if}

                    </div>
                    <p class="md:text-sm text-xs">{listInfo.desc}</p>
                </div>
            </div>
        </div>
    </div>
    <div id="itemContainer" class="px-2 flex flex-row flex-wrap content-start w-2/3">
        {#each listInfo.items as item}
            <div class="p-1 md:w-1/4 w-1/2 flex flex-col">
                <div class="flex-1 flex flex-col justify-stretch h-full">
                    <ItemCover
                        cover={item.cover}
                        height="h-full"
                        width="w-full"
                        href={"/item/" + item.id}
                        scroll={false}
                    />
                </div>
            </div>
        {/each}
    </div>
</div>

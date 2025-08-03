<script lang="ts">
    import type { PageProps } from './$types';
    import ListHeader from '$lib/client/ListHeader.svelte';
    import ReviewBar from '$lib/client/ReviewBar.svelte';
    import ItemCover from '$lib/client/ItemCover.svelte';

    let { data }: PageProps = $props();

    const listInfo = data.list;
    const avgScore = data.avg;

</script>

<title>Review Doc - {listInfo.name}</title>

<div class="md:mx-32 mx-2 my-2">
    <div class="card rounded-lg outline-2 outline-gray-300 drop-shadow-lg relative w-full overflow-hidden flex flex-col items-stretch gap-2">
        <ListHeader name={listInfo.name} desc={listInfo.desc} items={listInfo.items} fullDesc={true}/>
        <div class="flex mr-2 ml-2 flex-row justify-center items-center text-center">
            {#if avgScore == 0}
                <ReviewBar value={0} limit={10}/>
                <p class="text-md md:text-xl px-2"><b>💀/10</b></p>
            {:else}
                <ReviewBar value={avgScore} limit={10}/>
                <p class="text-md md:text-xl px-2"><b>{avgScore.toFixed(2)}/10</b></p>
            {/if}
        </div>
        <div class="text-center">
            Average Score
        </div>
        
    </div>
    <div class="py-2 grid gap-4 justify-center items-center md:grid-cols-6 grid-cols-4">
        
        {#each listInfo.items as item}
            <div class="flex flex-shrink-0 w-full items-stretch md:h-68 h-30">
                <ItemCover height="h-full" width="w-full" cover={item.cover} scroll={false} id={item.id}/>
            </div>
        {/each}
    </div>
</div>
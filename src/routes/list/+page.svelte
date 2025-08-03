<script lang="ts">
    import type { listStructure } from '$lib/types';
    import ListHeader from '$lib/client/ListHeader.svelte';

    let { data }: PageProps = $props();
    const blocks: listStructure [] = data.blocks;
</script>

<title>Review Doc - Lists</title>

<div class="md:mx-32 mx-2 my-2">
    <div class="flex flex-wrap gap-4 justify-center">
        
        {#each blocks as block}
            <a
                href="/list/{block.id.toString()}"
                class="w-full md:w-[48%] flex-shrink-0"
            >
                <ListHeader name={block.name} desc={block.desc} items={block.items}/>
            </a>
        {/each}
    </div>
</div>

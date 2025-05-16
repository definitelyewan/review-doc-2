<script lang="ts">
    import type { PageProps } from './$types';
    import { onMount } from 'svelte';
    import MarkDownRenderer from '$lib/client/MarkDownRenderer.svelte';
    import ReviewBar from '$lib/client/ReviewBar.svelte';
    let { type = 'other', name = '', subName = '', md='', score = 0, date='0000-00-00'}: PageProps = $props();

    let isDarkMode = $state(false);

    onMount(() => {
        if (window.matchMedia) {
            isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
    });

</script>


<div id="reviewContainer" class="flex-1 px-4">
    <p class="md:text-4xl text-xl drop-shadow-lg text-shadow-outline dark:text-white text-[#121212]"><b>{name}</b></p>

    <div class="flex flex-wrap flex-col gap-2">
        <div class="card w-full drop-shadow-lg preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 block divide-y overflow-hidden border-[1px]">
            <div class="p-2">
                {#if subName && type == 'tv'}
                    <div class="text-xl">
                        {#await Promise.resolve(subName.match(/\d+/g)) then numbers}
                            {#if numbers && numbers.length == 1}
                                <p class="text-sm md:text-xl">Season: {numbers[0]}</p>
                            {:else if numbers && numbers.length > 1}
                                <p class="text-sm md:text-xl">Season: {numbers[0]} - {numbers[numbers.length - 1]}</p>
                            {/if}
                        {:catch error}
                            <p>Error processing the string.</p>
                        {/await}
                    </div>
                {:else if subName && type == 'game'}
                    <p class="text-sm md:text-xl">{subName}</p>
                {/if}
                {#if score != -1 }
                    <div class="flex items-center">
                        {#if score == 0}
                            <ReviewBar value={0} limit={10}/>
                            <p class="text-md md:text-xl px-2"><b>💀/10</b></p>
                        {:else}
                            <ReviewBar value={score} limit={10}/>
                            <p class="text-md md:text-xl px-2"><b>{score}/10</b></p>
                        {/if}

                    </div>
                {/if}

                {#if md != undefined}
                    <hr class="mt-1 hr" />
                    <div class="mt-1 mb-1">
                        <div class="md:block hidden">
                            <MarkDownRenderer md={md} mobile={false} darkMode={isDarkMode}/>
                        </div>
                        <div class="block md:hidden">
                            <MarkDownRenderer md={md} mobile={true} darkMode={isDarkMode}/>
                        </div>
                        
                    </div>

                {/if}

                <hr class="hr" />
                <div>
                    <p class="text-xs drop-shadow-lg text-shadow-outline dark:text-white text-[#121212]">From {date}</p>
                </div>
            </div>
        </div>
    </div>
</div>
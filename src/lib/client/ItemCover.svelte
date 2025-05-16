<script lang="ts">
    import type { PageProps } from './$types';
    let { cover='', height='h-1/2', width='w-1/4', id=-1, scroll=true}: PageProps = $props();


    let scrollState = (scroll == true) ? "sticky top-4" : "";

</script>

<div
    class="rounded-lg outline-2 outline-gray-300 drop-shadow-lg preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 block {height} {width} border-[1px] overflow-visible {scrollState}"
>

    {#if id}
        <a href="/item/{id}">
            <header>
                <img src={cover} class="w-full" alt="banner" />
            </header>
        </a>
    {:else}
        <header>
            <img src={cover} class="w-full" alt="banner" />
        </header>
    {/if}


</div>
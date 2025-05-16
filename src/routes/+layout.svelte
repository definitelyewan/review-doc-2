<script lang="ts">
	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import Search from '@lucide/svelte/icons/search';
	import Trophy from '@lucide/svelte/icons/trophy';
	let { children } = $props();

	/**
	 * Handles mouse clicks for navbar buttons
	 * @param event
	 * @param url
	 */
    async function handleSearchClick(event: MouseEvent, url : string): Promise<void> {
        event.preventDefault();
		await invalidateAll();
        await goto(url);
    }

</script>



<AppBar>
	{#snippet headline()}
		<div class="flex justify-between items-center w-full">
			
			<a href="/">
				<h2 class="h2">REVIEW DOC</h2>
			</a>
			
			<div class="flex justify-end space-x-1">
				<button onclick={(event) => handleSearchClick(event, '/item')} type="button" class="btn preset-filled">
					<span class="hidden sm:inline">Search</span>
					<Search size={18} />
				</button>
				<button onclick={(event) => handleSearchClick(event, '/award')} type="button" class="btn preset-filled">
					<span class="hidden sm:inline">Awards</span>
					<Trophy size={18} />
				</button>
			</div>
		</div>
	{/snippet}
</AppBar>

{@render children()}

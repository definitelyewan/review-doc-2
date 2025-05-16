<script lang="ts">
    import type { PageProps } from './$types';
    import { Progress } from '@skeletonlabs/skeleton-svelte';
    let { value = 0.0, limit = 10}: PageProps = $props();

</script>

{#if value <= (limit * 0.2)}
    <Progress value={value} max={limit} meterBg="bg-error-900" />
{:else if value <= (limit * 0.5)}
    <Progress value={value} max={limit} meterBg="bg-warning-600" />
{:else if value <= (limit * 0.8)}
    <Progress value={value} max={limit} meterBg="bg-success-500" />
{:else if value <= limit }
    <Progress value={value} max={limit} meterBg="bg-primary-400" />
{/if}

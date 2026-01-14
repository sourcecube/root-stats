<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getGame, deleteGame as deleteGameFromDb } from '$lib/db';
	import { resolve } from '$app/paths';

	type GameWithDetails = NonNullable<Awaited<ReturnType<typeof getGame>>>;

	let game = $state<GameWithDetails | null>(null);
	let loading = $state(true);
	let sortedParticipants = $derived(
		game ? [...game.participants].sort((a, b) => b.score - a.score) : []
	);

	onMount(async () => {
		const id = $page.params.id;
		if (!id) {
			loading = false;
			return;
		}
		game = await getGame(id);
		loading = false;
	});

	async function handleDelete() {
		if (!game || !confirm('Are you sure you want to delete this game?')) return;

		try {
			await deleteGameFromDb(game.id);
			goto(resolve('/'));
		} catch {
			alert('Failed to delete game');
		}
	}
</script>

<svelte:head>
	<title>Game Details - Root Game Tracker</title>
</svelte:head>

<div class="page-background min-h-screen bg-amber-50">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<header class="mb-8">
			<a href="{resolve("/")}"  class="text-amber-600 hover:text-amber-800">← Back to Home</a>
			{#if game}
				<div class="mt-4 flex items-center justify-between">
					<h1 class="text-3xl font-bold text-amber-900">Game Details</h1>
					<button
						onclick={handleDelete}
						class="rounded bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
					>
						Delete Game
					</button>
				</div>
			{/if}
		</header>

		{#if loading}
			<div class="rounded-lg bg-white p-8 text-center shadow">
				<p class="text-gray-500">Loading...</p>
			</div>
		{:else if !game}
			<div class="rounded-lg bg-white p-8 text-center shadow">
				<p class="text-gray-500">Game not found</p>
			</div>
		{:else}

		<!-- Game Info -->
		<div class="mb-6 rounded-lg bg-white p-6 shadow">
			<div class="flex flex-wrap gap-4">
				<div>
					<span class="text-sm text-gray-500">Map</span>
					<p class="text-lg font-semibold text-amber-800">{game.map}</p>
				</div>
				<div>
					<span class="text-sm text-gray-500">Date</span>
					<p class="text-lg font-semibold text-amber-800">
						{new Date(game.playedAt).toLocaleDateString('en-US', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
				</div>
			</div>
		</div>

		<!-- Scores -->
		<section class="mb-6 rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-semibold text-amber-800">Results</h2>
			<div class="space-y-3">
				{#each sortedParticipants as participant, index}
					<div
						class="flex items-center justify-between rounded-lg p-4 {participant.isWinner
							? 'bg-yellow-50 ring-2 ring-yellow-400'
							: 'bg-gray-50'}"
					>
						<div class="flex items-center gap-4">
							<span class="text-2xl font-bold text-gray-400">#{index + 1}</span>
							<div>
								<div class="flex items-center gap-2">
									{#if participant.isWinner}
										<span class="text-xl">👑</span>
									{/if}
									<span class="text-lg font-semibold text-gray-800">{participant.playerName}</span>
								</div>
								<span class="text-sm text-gray-500">{participant.faction}</span>
							</div>
						</div>
						<span
							class="text-3xl font-bold {participant.isWinner
								? 'text-yellow-600'
								: 'text-gray-600'}"
						>
							{participant.score}
						</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- Landmarks & Hirelings -->
		{#if game.landmarks.length > 0 || game.hirelings.length > 0}
			<section class="mb-6 rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-amber-800">Game Setup</h2>

				{#if game.landmarks.length > 0}
					<div class="mb-4">
						<h3 class="mb-2 text-sm font-medium text-gray-500">Landmarks</h3>
						<div class="flex flex-wrap gap-2">
							{#each game.landmarks as landmark}
								<span class="rounded-full bg-emerald-100 px-4 py-2 text-emerald-700">
									🏔️ {landmark}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if game.hirelings.length > 0}
					<div>
						<h3 class="mb-2 text-sm font-medium text-gray-500">Hirelings</h3>
						<div class="flex flex-wrap gap-2">
							{#each game.hirelings as hireling}
								<span class="rounded-full bg-purple-100 px-4 py-2 text-purple-700">
									🐾 {hireling}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</section>
		{/if}

		<!-- Notes -->
		{#if game.notes}
			<section class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-amber-800">Notes</h2>
				<p class="whitespace-pre-wrap text-gray-700">{game.notes}</p>
			</section>
		{/if}
		{/if}
	</div>
</div>

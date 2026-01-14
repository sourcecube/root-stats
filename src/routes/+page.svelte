<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllGames, getAllPlayers } from '$lib/db';

	type GameWithDetails = Awaited<ReturnType<typeof getAllGames>>[number];
	type Player = Awaited<ReturnType<typeof getAllPlayers>>[number];

	let games = $state<GameWithDetails[]>([]);
	let players = $state<Player[]>([]);
	let loading = $state(true);

	function getMapClass(map: string): string {
		const mapName = map.toLowerCase();
		if (mapName.includes('autumn') || mapName.includes('fall')) return 'map-autumn';
		if (mapName.includes('mountain')) return 'map-mountain';
		if (mapName.includes('winter')) return 'map-winter';
		if (mapName.includes('lake')) return 'map-lake';
		return 'map-autumn';
	}

	onMount(async () => {
		games = await getAllGames();
		players = await getAllPlayers();
		loading = false;
	});
</script>

<svelte:head>
	<title>Root Game Tracker</title>
</svelte:head>

<div class="page-background min-h-screen bg-amber-50">
	<div class="mx-auto max-w-6xl px-4 py-8">
		<header class="mb-8 text-center">
			<h1 class="mb-2 text-4xl font-bold text-amber-900">🦊 Root Game Tracker</h1>
			<p class="text-amber-700">Track your woodland warfare adventures</p>
		</header>

		<div class="mb-8 flex justify-center gap-4">
			<a
				href="/games/new"
				class="rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-amber-700"
			>
				+ New Game
			</a>
			<a
				href="/stats"
				class="rounded-lg bg-amber-100 px-6 py-3 font-semibold text-amber-800 shadow-md transition hover:bg-amber-200"
			>
				📊 Stats
			</a>
		</div>

		{#if loading}
			<div class="rounded-lg bg-white p-8 text-center shadow">
				<p class="text-gray-500">Loading...</p>
			</div>
		{:else}
			<section>
				<h2 class="mb-4 text-2xl font-semibold text-amber-800">Recent Games</h2>

				{#if games.length === 0}
					<div class="rounded-lg bg-white p-8 text-center shadow">
						<p class="text-gray-500">No games recorded yet. Start tracking your first game!</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each games as game}
							<a href="/games/{game.id}" class="block">
							<div class="map-card-bg {getMapClass(game.map)} rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
									<div class="mb-4 flex items-center justify-between">
										<span class="font-medium text-amber-800">{game.map}</span>
										<span class="text-sm text-white">
											{new Date(game.playedAt).toLocaleDateString()}
										</span>
									</div>

									<div class="mb-3 flex flex-wrap gap-2">
										{#each game.participants as participant}
											<span
												class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm {participant.isWinner
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-gray-100 text-gray-700'}"
											>
												{#if participant.isWinner}
													<span>👑</span>
												{/if}
												<span class="font-medium">{participant.playerName}</span>
												<span class="text-xs opacity-75">({participant.faction})</span>
												<span class="font-semibold">{participant.score}</span>
											</span>
										{/each}
									</div>

									{#if game.landmarks.length > 0 || game.hirelings.length > 0}
										<div class="flex flex-wrap gap-2 text-xs">
											{#each game.landmarks as landmark}
												<span class="rounded bg-emerald-100 px-2 py-1 text-emerald-700"
													>🏔️ {landmark}</span
												>
											{/each}
											{#each game.hirelings as hireling}
												<span class="rounded bg-purple-100 px-2 py-1 text-purple-700"
													>🐾 {hireling}</span
												>
											{/each}
										</div>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</section>

			<section class="mt-8">
				<h2 class="mb-4 text-2xl font-semibold text-amber-800">Players</h2>
				<div class="rounded-lg bg-white p-6 shadow">
					{#if players.length === 0}
						<p class="text-gray-500">No players yet. They'll appear when you record a game.</p>
					{:else}
						<div class="flex flex-wrap gap-2">
							{#each players as player}
								<span class="rounded-full bg-amber-100 px-4 py-2 text-amber-800">
									{player.name}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</section>
		{/if}
	</div>
</div>

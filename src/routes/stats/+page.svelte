<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllGames, getAllPlayers, db } from '$lib/db';
    import { resolve } from '$app/paths';

	type GameWithDetails = Awaited<ReturnType<typeof getAllGames>>[number];
	type Player = Awaited<ReturnType<typeof getAllPlayers>>[number];

	let games = $state<GameWithDetails[]>([]);
	let players = $state<Player[]>([]);
	let loading = $state(true);

	// Computed stats
	let playerWins = $derived.by(() => {
		const wins: Record<string, { name: string; wins: number; games: number }> = {};
		for (const game of games) {
			for (const p of game.participants) {
				if (!wins[p.playerId]) {
					wins[p.playerId] = { name: p.playerName, wins: 0, games: 0 };
				}
				wins[p.playerId].games++;
				if (p.isWinner) {
					wins[p.playerId].wins++;
				}
			}
		}
		return Object.values(wins).sort((a, b) => b.wins - a.wins);
	});

	let playerFavoriteFactions = $derived.by(() => {
		const factionPicks: Record<string, Record<string, number>> = {};
		const playerNames: Record<string, string> = {};

		for (const game of games) {
			for (const p of game.participants) {
				if (!factionPicks[p.playerId]) {
					factionPicks[p.playerId] = {};
					playerNames[p.playerId] = p.playerName;
				}
				factionPicks[p.playerId][p.faction] = (factionPicks[p.playerId][p.faction] || 0) + 1;
			}
		}

		return Object.entries(factionPicks).map(([playerId, factions]) => {
			const sorted = Object.entries(factions)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 3);
			return {
				playerId,
				playerName: playerNames[playerId],
				topFactions: sorted.map(([faction, count]) => ({ faction, count }))
			};
		});
	});

	let factionWins = $derived.by(() => {
		const wins: Record<string, { wins: number; games: number }> = {};
		for (const game of games) {
			for (const p of game.participants) {
				if (!wins[p.faction]) {
					wins[p.faction] = { wins: 0, games: 0 };
				}
				wins[p.faction].games++;
				if (p.isWinner) {
					wins[p.faction].wins++;
				}
			}
		}
		return Object.entries(wins)
			.map(([faction, stats]) => ({
				faction,
				wins: stats.wins,
				games: stats.games,
				winRate: stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(1) : '0'
			}))
			.sort((a, b) => b.wins - a.wins);
	});

	let factionWinsByMap = $derived.by(() => {
		const mapStats: Record<string, Record<string, { wins: number; games: number }>> = {};

		for (const game of games) {
			if (!mapStats[game.map]) {
				mapStats[game.map] = {};
			}
			for (const p of game.participants) {
				if (!mapStats[game.map][p.faction]) {
					mapStats[game.map][p.faction] = { wins: 0, games: 0 };
				}
				mapStats[game.map][p.faction].games++;
				if (p.isWinner) {
					mapStats[game.map][p.faction].wins++;
				}
			}
		}

		return Object.entries(mapStats).map(([map, factions]) => ({
			map,
			topFactions: Object.entries(factions)
				.map(([faction, stats]) => ({
					faction,
					wins: stats.wins,
					games: stats.games
				}))
				.sort((a, b) => b.wins - a.wins)
				.slice(0, 5)
		}));
	});

	let averageScores = $derived.by(() => {
		const scores: Record<string, { total: number; count: number }> = {};
		for (const game of games) {
			for (const p of game.participants) {
				if (!scores[p.faction]) {
					scores[p.faction] = { total: 0, count: 0 };
				}
				scores[p.faction].total += p.score;
				scores[p.faction].count++;
			}
		}
		return Object.entries(scores)
			.map(([faction, stats]) => ({
				faction,
				avgScore: stats.count > 0 ? (stats.total / stats.count).toFixed(1) : '0',
				games: stats.count
			}))
			.sort((a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore));
	});

	let overallStats = $derived.by(() => {
		const totalGames = games.length;
		const totalPlayers = players.length;
		const allScores = games.flatMap((g) => g.participants.map((p) => p.score));
		const avgScore = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : '0';
		const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

		return { totalGames, totalPlayers, avgScore, highestScore };
	});

	onMount(async () => {
		games = await getAllGames();
		players = await getAllPlayers();
		loading = false;
	});
</script>

<svelte:head>
	<title>Stats - Root Game Tracker</title>
</svelte:head>

<div class="page-background min-h-screen bg-amber-50">
	<div class="mx-auto max-w-6xl px-4 py-8">
		<header class="mb-8">
			<a href="{resolve("/")}" class="mb-4 inline-block text-amber-600 hover:text-amber-700">← Back to Home</a>
			<h1 class="text-3xl font-bold text-amber-900">📊 Statistics</h1>
		</header>

		{#if loading}
			<div class="rounded-lg bg-white p-8 text-center shadow">
				<p class="text-gray-500">Loading statistics...</p>
			</div>
		{:else if games.length === 0}
			<div class="rounded-lg bg-white p-8 text-center shadow">
				<p class="text-gray-500">No games recorded yet. Start tracking games to see statistics!</p>
				<a
					href="{resolve("/games/new")}"
					class="mt-4 inline-block rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-amber-700"
				>
					+ Record First Game
				</a>
			</div>
		{:else}
			<!-- Overall Stats -->
			<section class="mb-8">
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div class="rounded-lg bg-white p-4 text-center shadow">
						<p class="text-3xl font-bold text-amber-600">{overallStats.totalGames}</p>
						<p class="text-sm text-gray-500">Games Played</p>
					</div>
					<div class="rounded-lg bg-white p-4 text-center shadow">
						<p class="text-3xl font-bold text-amber-600">{overallStats.totalPlayers}</p>
						<p class="text-sm text-gray-500">Players</p>
					</div>
					<div class="rounded-lg bg-white p-4 text-center shadow">
						<p class="text-3xl font-bold text-amber-600">{overallStats.avgScore}</p>
						<p class="text-sm text-gray-500">Avg Score</p>
					</div>
					<div class="rounded-lg bg-white p-4 text-center shadow">
						<p class="text-3xl font-bold text-amber-600">{overallStats.highestScore}</p>
						<p class="text-sm text-gray-500">Highest Score</p>
					</div>
				</div>
			</section>

			<!-- Player Wins -->
			<section class="mb-8">
				<h2 class="mb-4 text-2xl font-semibold text-amber-800">🏆 Most Wins by Player</h2>
				<div class="rounded-lg bg-white p-6 shadow">
					{#if playerWins.length === 0}
						<p class="text-gray-500">No player data yet.</p>
					{:else}
						<div class="space-y-3">
							{#each playerWins as player, i}
								<div class="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
									<div class="flex items-center gap-3">
										<span class="flex h-8 w-8 items-center justify-center rounded-full {i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'} text-sm font-bold">
											{i + 1}
										</span>
										<span class="font-medium text-gray-800">{player.name}</span>
									</div>
									<div class="text-right">
										<span class="font-bold text-amber-600">{player.wins}</span>
										<span class="text-sm text-gray-500"> wins / {player.games} games</span>
										<span class="ml-2 text-sm text-gray-400">
											({player.games > 0 ? ((player.wins / player.games) * 100).toFixed(0) : 0}%)
										</span>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</section>

			<!-- Player Favorite Factions -->
			<section class="mb-8">
				<h2 class="mb-4 text-2xl font-semibold text-amber-800">🦊 Favorite Factions by Player</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each playerFavoriteFactions as player}
						<div class="rounded-lg bg-white p-4 shadow">
							<h3 class="mb-3 font-semibold text-gray-800">{player.playerName}</h3>
							<div class="space-y-2">
								{#each player.topFactions as fav, i}
									<div class="flex items-center justify-between text-sm">
										<span class="flex items-center gap-2">
											<span class="{i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-400'}">
												{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
											</span>
											<span class="text-gray-700">{fav.faction}</span>
										</span>
										<span class="text-gray-500">{fav.count} games</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Faction Wins -->
			<section class="mb-8">
				<h2 class="mb-4 text-2xl font-semibold text-amber-800">⚔️ Factions with Most Wins</h2>
				<div class="rounded-lg bg-white p-6 shadow">
					<div class="space-y-3">
						{#each factionWins.slice(0, 10) as faction, i}
							<div class="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
								<div class="flex items-center gap-3">
									<span class="flex h-8 w-8 items-center justify-center rounded-full {i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'} text-sm font-bold">
										{i + 1}
									</span>
									<span class="font-medium text-gray-800">{faction.faction}</span>
								</div>
								<div class="text-right">
									<span class="font-bold text-amber-600">{faction.wins}</span>
									<span class="text-sm text-gray-500"> wins / {faction.games} games</span>
									<span class="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
										{faction.winRate}%
									</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<!-- Faction Wins by Map -->
			<section class="mb-8">
				<h2 class="mb-4 text-2xl font-semibold text-amber-800">🗺️ Top Factions by Map</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each factionWinsByMap as mapData}
						<div class="rounded-lg bg-white p-4 shadow">
							<h3 class="mb-3 font-semibold text-amber-700">{mapData.map}</h3>
							{#if mapData.topFactions.length === 0}
								<p class="text-sm text-gray-400">No games on this map yet.</p>
							{:else}
								<div class="space-y-2">
									{#each mapData.topFactions as faction, i}
										<div class="flex items-center justify-between text-sm">
											<span class="flex items-center gap-2">
												<span class="w-5 text-center font-bold text-gray-400">{i + 1}.</span>
												<span class="text-gray-700">{faction.faction}</span>
											</span>
											<span class="text-gray-500">{faction.wins}W / {faction.games}G</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<!-- Average Score by Faction -->
			<section class="mb-8">
				<h2 class="mb-4 text-2xl font-semibold text-amber-800">📈 Average Score by Faction</h2>
				<div class="rounded-lg bg-white p-6 shadow">
					<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{#each averageScores as faction}
							<div class="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
								<span class="text-sm text-gray-700">{faction.faction}</span>
								<div class="text-right">
									<span class="font-bold text-amber-600">{faction.avgScore}</span>
									<span class="ml-1 text-xs text-gray-400">({faction.games})</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { factions, maps, landmarks, hirelings } from '$lib/gameData';
	import { getAllPlayers, createGame } from '$lib/db';
	import { resolve } from '$app/paths';

	interface Participant {
		playerName: string;
		faction: string;
		score: number;
		isWinner: boolean;
	}

	let existingPlayerNames = $state<string[]>([]);
	let map = $state(maps[0]);
	let selectedLandmarks = $state<string[]>([]);
	let selectedHirelings = $state<string[]>([]);
	let participants = $state<Participant[]>([
		{ playerName: '', faction: '', score: 0, isWinner: false }
	]);
	let notes = $state('');
	let isSubmitting = $state(false);

	onMount(async () => {
		const players = await getAllPlayers();
		existingPlayerNames = players.map((p) => p.name);
	});

	function addParticipant() {
		participants = [...participants, { playerName: '', faction: '', score: 0, isWinner: false }];
	}

	function removeParticipant(index: number) {
		participants = participants.filter((_, i) => i !== index);
	}

	function toggleLandmark(landmark: string) {
		if (selectedLandmarks.includes(landmark)) {
			selectedLandmarks = selectedLandmarks.filter((l) => l !== landmark);
		} else {
			selectedLandmarks = [...selectedLandmarks, landmark];
		}
	}

	function toggleHireling(hireling: string) {
		if (selectedHirelings.includes(hireling)) {
			selectedHirelings = selectedHirelings.filter((h) => h !== hireling);
		} else {
			selectedHirelings = [...selectedHirelings, hireling];
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;

		try {
			await createGame({
				map,
				landmarks: selectedLandmarks,
				hirelings: selectedHirelings,
				participants,
				notes: notes || undefined
			});
			goto('/');
		} catch (error) {
			alert('Failed to save game');
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>New Game - Root Game Tracker</title>
</svelte:head>

<div class="page-background min-h-screen bg-amber-50">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<header class="mb-8">
			<a href="{resolve("/")}" class="text-amber-600 hover:text-amber-800">← Back to Home</a>
			<h1 class="mt-4 text-3xl font-bold text-amber-900">Record New Game</h1>
		</header>

		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Map Selection -->
			<section class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-amber-800">Map</h2>
				<select
					bind:value={map}
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-amber-500"
				>
					{#each maps as mapOption}
						<option value={mapOption}>{mapOption}</option>
					{/each}
				</select>
			</section>

			<!-- Players & Factions -->
			<section class="rounded-lg bg-white p-6 shadow">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-amber-800">Players & Factions</h2>
					<button
						type="button"
						onclick={addParticipant}
						class="rounded bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700"
					>
						+ Add Player
					</button>
				</div>

				<div class="space-y-4">
					{#each participants as participant, index}
						<div class="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-4">
							<div class="min-w-[200px] flex-1">
								<label class="mb-1 block text-sm font-medium text-gray-700">Player Name</label>
								<input
									type="text"
									bind:value={participant.playerName}
									list="existing-players"
									required
									class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
									placeholder="Enter player name"
								/>
							</div>

							<div class="min-w-[200px] flex-1">
								<label class="mb-1 block text-sm font-medium text-gray-700">Faction</label>
								<select
									bind:value={participant.faction}
									required
									class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
								>
									<option value="">Select faction...</option>
									{#each factions as faction}
										<option value={faction}>{faction}</option>
									{/each}
								</select>
							</div>

							<div class="w-24">
								<label class="mb-1 block text-sm font-medium text-gray-700">Score</label>
								<input
									type="number"
									bind:value={participant.score}
									min="0"
									max="99"
									required
									class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
								/>
							</div>

							<div class="flex items-center gap-2">
								<label class="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										bind:checked={participant.isWinner}
										class="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
									/>
									<span>👑 Winner</span>
								</label>
							</div>

							{#if participants.length > 1}
								<button
									type="button"
									onclick={() => removeParticipant(index)}
									class="rounded bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
								>
									Remove
								</button>
							{/if}
						</div>
					{/each}
				</div>

				<datalist id="existing-players">
					{#each existingPlayerNames as name}
						<option value={name}></option>
					{/each}
				</datalist>
			</section>

			<!-- Landmarks -->
			<section class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-amber-800">Landmarks (Optional)</h2>
				<div class="flex flex-wrap gap-2">
					{#each landmarks as landmark}
						<button
							type="button"
							onclick={() => toggleLandmark(landmark)}
							class="rounded-full px-4 py-2 text-sm transition {selectedLandmarks.includes(landmark)
								? 'bg-emerald-600 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						>
							🏔️ {landmark}
						</button>
					{/each}
				</div>
			</section>

			<!-- Hirelings -->
			<section class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-amber-800">Hirelings (Optional)</h2>
				<div class="flex flex-wrap gap-2">
					{#each hirelings as hireling}
						<button
							type="button"
							onclick={() => toggleHireling(hireling)}
							class="rounded-full px-4 py-2 text-sm transition {selectedHirelings.includes(hireling)
								? 'bg-purple-600 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						>
							🐾 {hireling}
						</button>
					{/each}
				</div>
			</section>

			<!-- Notes -->
			<section class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold text-amber-800">Notes (Optional)</h2>
				<textarea
					bind:value={notes}
					rows="3"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-amber-500"
					placeholder="Any notes about this game..."
				></textarea>
			</section>

			<!-- Submit -->
			<div class="flex gap-4">
				<button
					type="submit"
					disabled={isSubmitting}
					class="flex-1 rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-amber-700 disabled:opacity-50"
				>
					{isSubmitting ? 'Saving...' : 'Save Game'}
				</button>
				<a
					href="/"
					class="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-md transition hover:bg-gray-50"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>

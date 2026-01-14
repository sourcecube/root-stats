import Dexie, { type EntityTable } from 'dexie';

// Types
export interface Game {
	id: string;
	playedAt: string;
	map: string;
	notes?: string;
}

export interface Player {
	id: string;
	name: string;
}

export interface GameParticipant {
	id: string;
	gameId: string;
	playerId: string;
	faction: string;
	score: number;
	isWinner: boolean;
}

export interface GameLandmark {
	id: string;
	gameId: string;
	landmark: string;
}

export interface GameHireling {
	id: string;
	gameId: string;
	hireling: string;
}

// Database class
class RootGameDB extends Dexie {
	games!: EntityTable<Game, 'id'>;
	players!: EntityTable<Player, 'id'>;
	gameParticipants!: EntityTable<GameParticipant, 'id'>;
	gameLandmarks!: EntityTable<GameLandmark, 'id'>;
	gameHirelings!: EntityTable<GameHireling, 'id'>;

	constructor() {
		super('RootGameTracker');
		this.version(1).stores({
			games: 'id, playedAt, map',
			players: 'id, &name',
			gameParticipants: 'id, gameId, playerId',
			gameLandmarks: 'id, gameId',
			gameHirelings: 'id, gameId'
		});
	}
}

export const db = new RootGameDB();

// Helper functions
export async function getAllGames() {
	const games = await db.games.orderBy('playedAt').reverse().toArray();

	return Promise.all(
		games.map(async (game) => {
			const participants = await db.gameParticipants.where('gameId').equals(game.id).toArray();
			const participantsWithNames = await Promise.all(
				participants.map(async (p) => {
					const player = await db.players.get(p.playerId);
					return {
						...p,
						playerName: player?.name ?? 'Unknown'
					};
				})
			);

			const landmarks = await db.gameLandmarks.where('gameId').equals(game.id).toArray();
			const hirelings = await db.gameHirelings.where('gameId').equals(game.id).toArray();

			return {
				...game,
				participants: participantsWithNames,
				landmarks: landmarks.map((l) => l.landmark),
				hirelings: hirelings.map((h) => h.hireling)
			};
		})
	);
}

export async function getGame(id: string) {
	const game = await db.games.get(id);
	if (!game) return null;

	const participants = await db.gameParticipants.where('gameId').equals(game.id).toArray();
	const participantsWithNames = await Promise.all(
		participants.map(async (p) => {
			const player = await db.players.get(p.playerId);
			return {
				...p,
				playerName: player?.name ?? 'Unknown'
			};
		})
	);

	const landmarks = await db.gameLandmarks.where('gameId').equals(game.id).toArray();
	const hirelings = await db.gameHirelings.where('gameId').equals(game.id).toArray();

	return {
		...game,
		participants: participantsWithNames,
		landmarks: landmarks.map((l) => l.landmark),
		hirelings: hirelings.map((h) => h.hireling)
	};
}

export async function getAllPlayers() {
	return db.players.toArray();
}

export async function createGame(data: {
	map: string;
	notes?: string;
	landmarks: string[];
	hirelings: string[];
	participants: Array<{
		playerName: string;
		faction: string;
		score: number;
		isWinner: boolean;
	}>;
}) {
	const gameId = crypto.randomUUID();

	await db.games.add({
		id: gameId,
		playedAt: new Date().toISOString(),
		map: data.map,
		notes: data.notes
	});

	// Handle participants
	for (const participant of data.participants) {
		// Check if player exists, create if not
		let player = await db.players.where('name').equals(participant.playerName).first();

		if (!player) {
			const playerId = crypto.randomUUID();
			await db.players.add({
				id: playerId,
				name: participant.playerName
			});
			player = { id: playerId, name: participant.playerName };
		}

		await db.gameParticipants.add({
			id: crypto.randomUUID(),
			gameId,
			playerId: player.id,
			faction: participant.faction,
			score: participant.score,
			isWinner: participant.isWinner
		});
	}

	// Add landmarks
	for (const landmark of data.landmarks) {
		await db.gameLandmarks.add({
			id: crypto.randomUUID(),
			gameId,
			landmark
		});
	}

	// Add hirelings
	for (const hireling of data.hirelings) {
		await db.gameHirelings.add({
			id: crypto.randomUUID(),
			gameId,
			hireling
		});
	}

	return gameId;
}

export async function deleteGame(id: string) {
	await db.gameParticipants.where('gameId').equals(id).delete();
	await db.gameLandmarks.where('gameId').equals(id).delete();
	await db.gameHirelings.where('gameId').equals(id).delete();
	await db.games.delete(id);
}

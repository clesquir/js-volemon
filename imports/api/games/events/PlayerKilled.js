export default class PlayerKilled {
	constructor(gameId, playerKey, killedAt) {
		this.gameId = gameId;
		this.playerKey = playerKey;
		this.killedAt = killedAt;
	}
}

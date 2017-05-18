export default class PlayerLost {
	constructor(gameId, userId, winnerPoints, loserPoints) {
		this.gameId = gameId;
		this.userId = userId;
		this.winnerPoints = winnerPoints;
		this.loserPoints = loserPoints;
	}
}

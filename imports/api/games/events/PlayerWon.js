export default class PlayerWon {
	constructor(gameId, userId, winnerPoints, loserPoints) {
		this.gameId = gameId;
		this.userId = userId;
		this.winnerPoints = winnerPoints;
		this.loserPoints = loserPoints;
	}
}

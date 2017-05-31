export default class PointTaken {
	constructor(gameId, pointDuration, pointScoredByHost, hostPoints, clientPoints) {
		this.gameId = gameId;
		this.pointDuration = pointDuration;
		this.pointScoredByHost = pointScoredByHost;
		this.hostPoints = hostPoints;
		this.clientPoints = clientPoints;
	}
}

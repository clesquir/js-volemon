import Event from '../../../lib/events/Event';

export default class PointTaken implements Event {
	gameId: string;
	pointDuration: number;
	pointScoredByHost: boolean;
	hostPoints: number;
	clientPoints: number;

	constructor(gameId: string, pointDuration: number, pointScoredByHost: boolean, hostPoints: number, clientPoints: number) {
		this.gameId = gameId;
		this.pointDuration = pointDuration;
		this.pointScoredByHost = pointScoredByHost;
		this.hostPoints = hostPoints;
		this.clientPoints = clientPoints;
	}

	static getClassName(): string {
		return 'PointTaken';
	}

	getClassName(): string {
		return PointTaken.getClassName();
	}
}

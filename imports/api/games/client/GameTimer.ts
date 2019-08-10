import GameData from "../data/GameData";
import * as moment from 'moment';
import {EventPublisher} from "../../../lib/EventPublisher";
import LastPointUpdated from "../events/LastPointUpdated";

export default class GameTimer {
	private readonly gameData: GameData;
	private timerUpdater = null;

	constructor(
		gameData: GameData
	) {
		this.gameData = gameData;
	}

	init() {
		this.initTimer();

		EventPublisher.on(LastPointUpdated.prototype.constructor.name, this.updateTimer, this);
	}

	stop() {
		EventPublisher.off(LastPointUpdated.prototype.constructor.name, this.updateTimer, this);

		this.clearTimer();
	}

	private initTimer() {
		this.timerUpdater = Meteor.setInterval(() => {
			this.updateTimer();
		}, 1000);
	}

	private updateTimer() {
		if (this.gameData.isGameStatusStarted()) {
			let matchTimer = this.gameData.matchTimeElapsed();
			if (matchTimer < 0 || isNaN(matchTimer)) {
				matchTimer = 0;
			}

			let pointTimer = this.gameData.pointTimeElapsed();
			if (pointTimer < 0 || isNaN(pointTimer)) {
				pointTimer = 0;
			}

			Session.set('matchTimer', moment(matchTimer).format('mm:ss'));
			Session.set('pointTimer', moment(pointTimer).format('mm:ss'));
		}
	}

	private clearTimer() {
		Meteor.clearInterval(this.timerUpdater);
		Session.set('matchTimer', '00:00');
		Session.set('pointTimer', '00:00');
	}
}

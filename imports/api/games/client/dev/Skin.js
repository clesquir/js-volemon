import Dev from '/imports/api/games/client/dev/Dev.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import LevelConfiguration from '/imports/api/games/levelConfiguration/LevelConfiguration.js';
import SkinFactory from '/imports/api/skins/skins/SkinFactory.js';
import {Meteor} from 'meteor/meteor';
import {moment} from 'meteor/momentjs:moment';
import {Random} from 'meteor/random';
import {Session} from 'meteor/session';

export default class Skin extends Dev {
	constructor() {
		super();

		this.gameData.firstPlayerComputer = true;
		this.gameData.secondPlayerComputer = true;
	}

	beforeStart() {
		this.gameConfiguration.levelConfiguration = LevelConfiguration.fromMode(Session.get('dev.skin.currentMode'));
		this.gameSkin = new GameSkin(SkinFactory.fromId(Session.get('dev.skin.currentSkin')), []);
	}

	start() {
		super.start();

		this.initTimer();
	}

	stop() {
		super.stop();

		this.clearTimer();
	}

	initTimer() {
		this.startTime = Date.now();
		this.timerUpdater = Meteor.setInterval(() => {
			this.updateTimer();
		}, 1000);
	}

	updateTimer() {
		let matchTimer = Date.now() - this.startTime;
		if (matchTimer < 0 || isNaN(matchTimer)) {
			matchTimer = 0;
		}

		let pointTimer = Date.now() - this.gameData.lastPointAt;
		if (pointTimer < 0 || isNaN(pointTimer)) {
			pointTimer = 0;
		}

		Session.set('matchTimer', moment(matchTimer).format('mm:ss'));
		Session.set('pointTimer', moment(pointTimer).format('mm:ss'));
	}

	clearTimer() {
		Meteor.clearInterval(this.timerUpdater);
		Session.set('matchTimer', '00:00');
		Session.set('pointTimer', '00:00');
	}
}

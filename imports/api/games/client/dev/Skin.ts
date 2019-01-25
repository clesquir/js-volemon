import Dev from "./Dev";
import {Meteor} from 'meteor/meteor';
import * as moment from 'moment';
import {Session} from 'meteor/session';
import SkinManager from "../skin/SkinManager";
import SkinFactory from "../../../skins/skins/SkinFactory";
import WeatherPlugin from "../../../skins/plugins/WeatherPlugin";
import LevelConfiguration from "../../levelConfiguration/LevelConfiguration";

export default class Skin extends Dev {
	startTime: number = 0;
	timerUpdater: number;

	constructor() {
		super();

		this.gameData.firstPlayerComputer = true;
		this.gameData.secondPlayerComputer = true;
	}

	beforeStart() {
		this.gameConfiguration.levelConfiguration = LevelConfiguration.fromMode(Session.get('dev.skin.currentMode'));

		const weatherPlugin = new WeatherPlugin();
		weatherPlugin.init();
		weatherPlugin.weatherApi.timeOfDay = () => {
			return Session.get('dev.skin.timeOfDay');
		};
		weatherPlugin.weatherApi.condition = () => {
			return Session.get('dev.skin.condition');
		};

		this.skinManager = new SkinManager(
			this.gameConfiguration,
			SkinFactory.fromId(Session.get('dev.skin.currentSkin')),
			Session.get('dev.skin.pluginEnabled') ? [weatherPlugin] : []
		);
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

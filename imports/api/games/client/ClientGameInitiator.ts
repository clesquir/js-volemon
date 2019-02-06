import GameNotifier from './GameNotifier';
import GameStreamInitiator from './GameStreamInitiator';
import {CLIENT_POINTS_COLUMN, HOST_POINTS_COLUMN} from '../constants';
import {Games} from '../games';
import {Players} from '../players';
import {GAME_STATUS_STARTED} from '../statusConstants';
import DeviceController from "../deviceController/DeviceController";
import GameConfiguration from "../configuration/GameConfiguration";
import GameData from "../data/GameData";
import SkinManager from "./components/SkinManager";
import StreamBundler from "./streamBundler/StreamBundler";
import ServerNormalizedTime from "./ServerNormalizedTime";
import Stream from "../../../lib/stream/Stream";
import {GameBoot} from "./boot/GameBoot";
import MeteorServerAdapter from "./serverAdapter/MeteorServerAdapter";
import MainScene from "./scene/MainScene";
import {Meteor} from 'meteor/meteor';
import * as moment from 'moment';
import {Session} from 'meteor/session';

export default class ClientGameInitiator {
	gameId: string;
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	stream: Stream;
	gameNotifier: GameNotifier;

	private timerUpdater = null;
	private gameStreamInitiator: GameStreamInitiator;
	private gameCreated: boolean = false;
	private gameChangesTracker: Meteor.LiveQueryHandle;
	private gameBoot: GameBoot;
	mainScene: MainScene;

	constructor(
		gameId: string,
		deviceController: DeviceController,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager,
		streamBundler: StreamBundler,
		serverNormalizedTime: ServerNormalizedTime,
		stream: Stream,
		gameNotifier: GameNotifier
	) {
		this.gameId = gameId;
		this.deviceController = deviceController;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.stream = stream;
		this.gameNotifier = gameNotifier;

		this.gameStreamInitiator = new GameStreamInitiator(this, this.stream);
	}

	init() {
		this.gameStreamInitiator.init();

		if (this.gameData.isGameStatusOnGoing()) {
			this.createNewGameWhenReady();
		}

		this.initTimer();

		this.gameChangesTracker = Games.find({_id: this.gameId}).observeChanges({
			changed: (id: string, fields: any) => {
				if (fields.hasOwnProperty('status')) {
					this.gameData.updateStatus(fields.status);

					if (fields.status === GAME_STATUS_STARTED) {
						this.gameNotifier.onGameStart();
						Session.set('appLoadingMask', false);
						Session.set('appLoadingMask.text', undefined);
					}
				}

				if (fields.hasOwnProperty(HOST_POINTS_COLUMN)) {
					this.gameData.updateHostPoints(fields.hostPoints);
				}

				if (fields.hasOwnProperty(CLIENT_POINTS_COLUMN)) {
					this.gameData.updateClientPoints(fields.clientPoints);
				}

				if (fields.hasOwnProperty('activeBonuses')) {
					this.gameData.updateActiveBonuses(fields.activeBonuses);
				}

				if (fields.hasOwnProperty('lastPointTaken')) {
					this.gameData.updateLastPointTaken(fields.lastPointTaken);
				}

				if (fields.hasOwnProperty('lastPointAt')) {
					this.gameData.updateLastPointAt(fields.lastPointAt);

					this.updateTimer();
				}

				if (
					this.hasActiveGame() && (
						fields.hasOwnProperty(HOST_POINTS_COLUMN) ||
						fields.hasOwnProperty(CLIENT_POINTS_COLUMN)
					)
				) {
					this.mainScene.onPointTaken();
				}
			}
		});
	}

	stop() {
		if (this.hasActiveGame()) {
			this.gameBoot.stop();
			this.mainScene = null;
		}

		this.gameStreamInitiator.stop();

		this.clearTimer();

		if (this.gameChangesTracker) {
			this.gameChangesTracker.stop();
		}
	}

	createNewGameWhenReady() {
		const me = this;

		//Wait for gameContainer creation before starting game
		let loopUntilGameContainerIsCreated = () => {
			if (document.getElementById('game-container')) {
				if (this.gameCreated === false) {
					this.gameCreated = true;
					me.createNewGame();
				}
			} else {
				window.setTimeout(loopUntilGameContainerIsCreated, 1);
			}
		};

		loopUntilGameContainerIsCreated();
	}

	hasActiveGame() {
		return this.mainScene !== null;
	}

	private createNewGame() {
		this.gameData.init();

		this.gameBoot = new GameBoot(
			this.deviceController,
			this.gameData,
			this.gameConfiguration,
			this.skinManager,
			this.streamBundler,
			this.serverNormalizedTime,
			new MeteorServerAdapter()
		);
		this.gameBoot.init(
			{
				postBoot: (game: Phaser.Game) => {
					this.mainScene = <any>game.scene.getScene('MainScene');
				}
			}
		);

		let player = Players.findOne({gameId: this.gameId, userId: Meteor.userId()});
		if (!player) {
			Meteor.call('addGameViewer', this.gameId, Meteor.userId());
		}
	}

	private initTimer() {
		this.timerUpdater = Meteor.setInterval(() => {
			this.updateTimer();
		}, 1000);
	}

	private updateTimer() {
		if (this.gameData.isGameStatusStarted()) {
			let matchTimer = this.serverNormalizedTime.getServerTimestamp() - this.gameData.startedAt;
			if (matchTimer < 0 || isNaN(matchTimer)) {
				matchTimer = 0;
			}

			let pointTimer = this.serverNormalizedTime.getServerTimestamp() - this.gameData.lastPointAt;
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

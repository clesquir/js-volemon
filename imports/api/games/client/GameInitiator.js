import Game from '/imports/api/games/client/Game.js';
import GameNotifier from '/imports/api/games/client/GameNotifier.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import GameStreamInitiator from '/imports/api/games/client/GameStreamInitiator.js';
import {CLIENT_POINTS_COLUMN, HOST_POINTS_COLUMN} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {Meteor} from 'meteor/meteor';
import {moment} from 'meteor/momentjs:moment';
import {Session} from 'meteor/session';

export default class GameInitiator {
	/**
	 * @param {string} gameId
	 * @param {DeviceController} deviceController
	 * @param {Engine} engine
	 * @param {GameData} gameData
	 * @param {GameConfiguration} gameConfiguration
	 * @param {GameSkin} gameSkin
	 * @param {Stream} stream
	 * @param {ServerNormalizedTime} serverNormalizedTime
	 * @param {GameNotifier} gameNotifier
	 */
	constructor(
		gameId,
		deviceController,
		engine,
		gameData,
		gameConfiguration,
		gameSkin,
		stream,
		serverNormalizedTime,
		gameNotifier
	) {
		this.gameId = gameId;
		this.deviceController = deviceController;
		this.engine = engine;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.gameSkin = gameSkin;
		this.stream = stream;
		this.serverNormalizedTime = serverNormalizedTime;
		this.gameNotifier = gameNotifier;

		this.currentGame = null;
		this.timerUpdater = null;

		this.gameStreamBundler = new GameStreamBundler(this.stream);
		this.gameStreamInitiator = new GameStreamInitiator(this, this.stream);
	}

	init() {
		this.gameStreamInitiator.init();

		if (this.gameData.isGameStatusOnGoing()) {
			this.createNewGameWhenReady();
		}

		this.initTimer();

		this.gameChangesTracker = Games.find({_id: this.gameId}).observeChanges({
			changed: (id, fields) => {
				if (fields.hasOwnProperty('clientId')) {
					if (fields.clientId !== null) {
						this.gameNotifier.onClientJoined();
					} else {
						this.gameNotifier.onClientLeft();
					}
				}

				if (fields.hasOwnProperty('isReady') && fields.isReady) {
					this.gameNotifier.onClientReady();
				}

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
					this.currentGame.onPointTaken();
				}
			}
		});
	}

	stop() {
		if (this.hasActiveGame()) {
			const player = Players.findOne({gameId: this.gameId, userId: Meteor.userId()});
			if (!player) {
				Meteor.call('removeGameViewer', this.gameId);
			}

			this.currentGame.stop();
			this.currentGame = null;
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
			if (document.getElementById('gameContainer')) {
				me.createNewGame();
			} else {
				window.setTimeout(loopUntilGameContainerIsCreated, 1);
			}
		};

		loopUntilGameContainerIsCreated();
	}

	createNewGame() {
		this.gameData.init();
		this.currentGame = new Game(
			this.gameId,
			this.deviceController,
			this.engine,
			this.gameData,
			this.gameConfiguration,
			this.gameSkin,
			this.gameStreamBundler,
			this.serverNormalizedTime
		);
		this.currentGame.start();

		let player = Players.findOne({gameId: this.gameId, userId: Meteor.userId()});
		if (!player) {
			Meteor.call('addGameViewer', this.gameId);
		}
	}

	initTimer() {
		this.timerUpdater = Meteor.setInterval(() => {
			this.updateTimer();
		}, 1000);
	}

	updateTimer() {
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

	clearTimer() {
		Meteor.clearInterval(this.timerUpdater);
		Session.set('matchTimer', '00:00');
		Session.set('pointTimer', '00:00');
	}

	hasActiveGame() {
		return this.currentGame !== null;
	}
}

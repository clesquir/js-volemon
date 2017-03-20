import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {moment} from 'meteor/momentjs:moment';
import {Games} from '/collections/games.js';
import {Players} from '/collections/players.js';
import PhaserEngine from '/imports/game/engine/client/PhaserEngine.js';
import GameData from '/imports/game/client/GameData.js';
import GameStreamBundler from '/imports/game/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/game/client/ServerNormalizedTime.js';
import StreamInitiator from '/imports/game/client/StreamInitiator.js';
import Game from '/imports/game/client/Game.js';
import {Constants} from '/imports/lib/constants.js';
import ClientSocketIo from '/imports/lib/stream/client/ClientSocketIo.js';

export default class GameInitiator {

	constructor(gameId) {
		this.gameId = gameId;
		this.currentGame = null;
		this.timerUpdater = null;

		this.stream = new ClientSocketIo();
		this.engine = new PhaserEngine();
		this.gameData = new GameData(this.gameId);
		this.gameStreamBundler = new GameStreamBundler(this.stream);
		this.serverNormalizedTime = new ServerNormalizedTime();
		this.streamInitiator = new StreamInitiator(this, this.stream);
	}

	init() {
		this.gameData.init();
		this.streamInitiator.init();

		if (this.gameData.isGameStatusOnGoing()) {
			this.createNewGame();
		}

		this.initTimer();

		this.gamePointsTracker = Games.find({_id: this.gameId}).observeChanges({
			changed: (id, fields) => {
				if (fields.hasOwnProperty('status')) {
					this.gameData.updateStatus(fields.status);
				}

				if (fields.hasOwnProperty(Constants.HOST_POINTS_COLUMN)) {
					this.gameData.updateHostPoints(fields.hostPoints);
				}

				if (fields.hasOwnProperty(Constants.CLIENT_POINTS_COLUMN)) {
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

					if (this.hasActiveGame()) {
						this.currentGame.onPointTaken();
					}
				}
			}
		});
	}

	stop() {
		if (this.hasActiveGame()) {
			this.currentGame.stop();
			this.currentGame = null;
		}

		this.streamInitiator.stop();

		this.clearTimer();

		if (this.gamePointsTracker) {
			this.gamePointsTracker.stop();
		}

		let player = Players.findOne({gameId: this.gameId, userId: Meteor.userId()});
		if (!player) {
			Meteor.call('removeGameViewer', this.gameId);
		}
	}

	createNewGame() {
		this.gameData.init();
		this.currentGame = new Game(
			this.gameId,
			this.engine,
			this.gameData,
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
			let matchTimer = this.serverNormalizedTime.getServerNormalizedTimestamp() - this.gameData.startedAt;
			if (matchTimer < 0) {
				matchTimer = 0;
			}

			let pointTimer = this.serverNormalizedTime.getServerNormalizedTimestamp() - this.gameData.lastPointAt;
			if (pointTimer < 0) {
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
		return this.currentGame != null;
	}

}

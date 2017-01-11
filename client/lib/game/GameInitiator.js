import StreamInitiator from '/client/lib/game/StreamInitiator.js';
import { isGameStatusStarted, isGameStatusOnGoing } from '/client/lib/game/utils.js';
import Game from '/client/lib/Game.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';
import { getUTCTimeStamp } from '/lib/utils.js';

export default class GameInitiator {

	constructor(gameId) {
		this.gameId = gameId;
		this.streamInitiator = new StreamInitiator(this);
		this.currentGame = null;
		this.gameStartedAt = 0;
		this.gameLastPointAt = 0;
		this.gameStatus = null;
		this.timerUpdater = null;
		this.serverOffset = TimeSync.serverOffset();
	}

	init() {
		let player = Players.findOne({gameId: this.gameId, userId: Meteor.userId()});

		this.updateGameProperties();

		//Player is in game and this game is already started
		if (player && isGameStatusOnGoing(this.gameStatus)) {
			this.createNewGame();
		}

		this.initTimer();

		this.streamInitiator.init();

		this.gamePointsTracker = Games.find({_id: this.gameId}).observeChanges({
			changed: (id, fields) => {
				let needsToUpdateGameProperties = false;

				if (fields.hasOwnProperty('status')) {
					needsToUpdateGameProperties = true;
					if (this.hasActiveGame()) {
						this.currentGame.onStatusChange();
					}
				}

				if (fields.hasOwnProperty('activeBonuses')) {
					if (this.hasActiveGame()) {
						this.currentGame.onActiveBonusesChange();
					}
				}

				if (fields.hasOwnProperty('lastPointAt')) {
					needsToUpdateGameProperties = true;
				}

				if (needsToUpdateGameProperties) {
					this.updateGameProperties();
				}

				if (
					fields.hasOwnProperty(Constants.HOST_POINTS_COLUMN) ||
					fields.hasOwnProperty(Constants.CLIENT_POINTS_COLUMN)
				) {
					if (this.hasActiveGame()) {
						this.updateTimer();
						this.currentGame.onPointTaken();
					}
				}
			}
		});
	}

	fetchGame() {
		return Games.findOne({_id: this.gameId});
	}

	updateGameProperties() {
		let game = this.fetchGame();

		this.gameCreatedBy = game.createdBy;
		this.gameStartedAt = game.lastPointAt;
		this.gameLastPointAt = game.lastPointAt;
		this.gameStatus = game.status;
	}

	userIsGameCreator() {
		return this.gameCreatedBy === Meteor.userId();
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
	}

	createNewGame() {
		this.currentGame = new Game(this.gameId);
		this.currentGame.start();
	}

	initTimer() {
		this.timerUpdater = Meteor.setInterval(() => {
			this.updateTimer();
		}, 1000);
	}

	updateTimer() {
		if (isGameStatusStarted(this.gameStatus)) {
			let matchTimer = getUTCTimeStamp() + this.serverOffset - this.gameStartedAt;
			if (matchTimer < 0) {
				matchTimer = 0;
			}

			let pointTimer = getUTCTimeStamp() + this.serverOffset - this.gameLastPointAt;
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

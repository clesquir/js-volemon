import {Games} from '../games';
import GameData from "../data/GameData";
import {Router} from 'meteor/iron:router';

export default class GameRematch {
	gameId: string;
	gameData: GameData;

	private gameRematchTracker: Meteor.LiveQueryHandle;

	constructor(gameId: string, gameData: GameData) {
		this.gameId = gameId;
		this.gameData = gameData;
	}

	init() {
		this.gameRematchTracker = Games.find({_id: this.gameId}).observeChanges({
			changed: (id: string, fields: any) => {
				if (fields.hasOwnProperty('rematchGameId')) {
					Session.set('appLoadingMask', true);
					Session.set('appLoadingMask.text', 'Creating rematch...');

					if (this.gameData.hasTournament()) {
						Router.go('tournamentGame', {tournamentId: this.gameData.tournamentId, gameId: fields.rematchGameId});
					} else {
						Router.go('game', {_id: fields.rematchGameId});
					}
				}
			}
		});
	}

	stop() {
		if (this.gameRematchTracker) {
			this.gameRematchTracker.stop();
		}
	}
}

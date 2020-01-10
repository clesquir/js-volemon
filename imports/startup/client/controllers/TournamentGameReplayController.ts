import ReplayRouteInitiator from "../../../api/games/replay/ReplayRouteInitiator";
import {TournamentGameController} from "./TournamentGameController";
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {RouteController} from 'meteor/iron:router';

export const TournamentGameReplayController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('tournamentGame', this.params.tournamentId, this.params.gameId)
		];
	},
	data: function() {
		return TournamentGameController.prototype.data.call(this);
	},
	onBeforeAction: function() {
		TournamentGameController.prototype.onBeforeAction.call(this);
	},
	action: function() {
		this.render('tournamentGameReplay');

		Template.tournamentGameReplay.rendered = () => {
			Session.set('appLoadingMask', true);
			Session.set('appLoadingMask.text', 'Fetching replay...');

			Meteor.call('gameReplay', this.params.gameId, (error, replayData) => {
				ReplayRouteInitiator.get().onControllerRender(Session.get('game'), replayData);
				Session.set('appLoadingMask', false);
			});

			Template.tournamentGameReplay.rendered = null;
		};
	},
	onStop: function() {
		Session.set('tournament', null);

		ReplayRouteInitiator.get().onControllerStop();
	}
});

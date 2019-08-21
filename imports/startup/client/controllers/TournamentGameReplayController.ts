import ReplayRouteInitiator from "../../../api/games/replay/ReplayRouteInitiator";
import {TournamentGameController} from "./TournamentGameController";
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {RouteController} from 'meteor/iron:router';

export const TournamentGameReplayController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('tournamentGame', this.params.tournamentId, this.params.gameId),
			Meteor.subscribe('gameReplay', this.params.gameId)
		];
	},
	data: function() {
		return TournamentGameController.prototype.data.call(this);
	},
	onBeforeAction: function() {
		TournamentGameController.prototype.onBeforeAction.call(this);
	},
	action: function() {
		this.render('tournamentGame');

		Template.tournamentGame.rendered = function() {
			ReplayRouteInitiator.get().onControllerRender(Session.get('game'));

			Template.tournamentGame.rendered = null;
		};
	},
	onStop: function() {
		Session.set('tournament', null);

		ReplayRouteInitiator.get().onControllerStop();
	}
});

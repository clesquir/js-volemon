import ReplayRouteInitiator from "../../../api/games/replay/ReplayRouteInitiator";
import {GameController} from "./GameController";
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {RouteController} from 'meteor/iron:router';

export const GameReplayController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('game', this.params._id)
		];
	},
	data: function() {
		return GameController.prototype.data.call(this);
	},
	onBeforeAction: function() {
		GameController.prototype.onBeforeAction.call(this);
	},
	action: function() {
		this.render('gameReplay');

		Template.gameReplay.rendered = () => {
			Session.set('appLoadingMask', true);
			Session.set('appLoadingMask.text', 'Fetching replay...');

			Meteor.call('gameReplay', this.params._id, (error, replayData) => {
				ReplayRouteInitiator.get().onControllerRender(Session.get('game'), replayData);
				Session.set('appLoadingMask', false);
			});

			Template.gameReplay.rendered = null;
		};
	},
	onStop: function() {
		ReplayRouteInitiator.get().onControllerStop();
	}
});

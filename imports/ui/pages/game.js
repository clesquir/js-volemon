import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {isGameStatusOnGoing} from '/imports/api/games/utils.js';

import './game.html';

Template.game.helpers({
	isGameOnGoing: function() {
		return isGameStatusOnGoing(this.game.status);
	},

	isHost: function() {
		return this.game.createdBy === Meteor.userId();
	},

	isPracticeGame: function() {
		return !!this.game.isPracticeGame;
	},

	isPrivateGame: function() {
		return !!this.game.isPrivate;
	}
});

Template.game.events({
	'click [data-action="update-practice-game"]': function(e) {
		const game = Games.findOne(Session.get('game'));
		const isPracticeGame = !game.isPracticeGame;

		if (isUserHost(Session.get('game'))) {
			switchTargetButton(e, isPracticeGame);

			Meteor.call('updatePracticeGame', Session.get('game'), isPracticeGame ? 1 : 0);
		}
	},

	'click [data-action="update-privacy"]': function(e) {
		const game = Games.findOne(Session.get('game'));
		const isPrivate = !game.isPrivate;

		if (isUserHost(Session.get('game'))) {
			switchTargetButton(e, isPrivate);

			Meteor.call('updateGamePrivacy', Session.get('game'), isPrivate ? 1 : 0);
		}
	}
});

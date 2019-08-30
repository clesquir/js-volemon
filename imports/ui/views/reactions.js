import RouteInitiator from '/imports/api/games/client/RouteInitiator';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants.js';
import CurrentGame from '/imports/api/games/CurrentGame';
import {Games} from '/imports/api/games/games.js';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './reactions.html';

Template.reactions.helpers({
	gameIs2Vs2: function() {
		const game = Games.findOne(Session.get('game'));

		return (game && isTwoVersusTwoGameMode(game.gameMode));
	}
});

Template.reactions.events({
	'click [data-action="trigger-reaction-list"]': function() {
		if (!CurrentGame.getIsReplay()) {
			RouteInitiator.get().toggleReactionSelector();
		}
	},

	'click [data-action="send-reaction"]': function(e) {
		if (!CurrentGame.getIsReplay()) {
			RouteInitiator.get().onReactionSelection($(e.currentTarget));
		}
	},

	'click [data-action="cheer-host"]': function() {
		if (!CurrentGame.getIsReplay()) {
			RouteInitiator.get().cheerPlayer(true);
		}
	},

	'click [data-action="cheer-client"]': function() {
		if (!CurrentGame.getIsReplay()) {
			RouteInitiator.get().cheerPlayer(false);
		}
	}
});

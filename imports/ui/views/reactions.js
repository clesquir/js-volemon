import {gameCheer, gameReaction} from '/imports/api/games/client/routeInitiator.js';
import {TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './reactions.html';

Template.reactions.helpers({
	gameIs2Vs2: function() {
		const game = Games.findOne(Session.get('game'));

		return (game && game.gameMode === TWO_VS_TWO_GAME_MODE);
	}
});

Template.reactions.events({
	'click [data-action="trigger-reaction-list"]': function() {
		gameReaction.toggleSelectorDisplay();
	},

	'click [data-action="send-reaction"]': function(e) {
		gameReaction.onReactionSelection($(e.currentTarget));
	},

	'click [data-action="cheer-host"]': function() {
		gameCheer.cheerPlayer(true);
	},

	'click [data-action="cheer-client"]': function() {
		gameCheer.cheerPlayer(false);
	}
});

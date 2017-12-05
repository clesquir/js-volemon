import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {isUserHost} from '/imports/api/games/utils.js';
import {gameReaction, gameCheer} from '/imports/api/games/client/routeInitiator.js';

import './reactions.html';

Template.reactions.events({
	'click [data-action="trigger-reaction-list"]': function() {
		gameReaction.toggleSelectorDisplay();
	},

	'click [data-action="send-reaction"]': function(e) {
		gameReaction.onReactionSelection($(e.currentTarget), isUserHost(Session.get('game')));
	},

	'click [data-action="cheer-host"]': function() {
		gameCheer.cheerPlayer(true);
	},

	'click [data-action="cheer-client"]': function() {
		gameCheer.cheerPlayer(false);
	}
});

import '/imports/ui/components/reactions.html';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {isUserHost} from '/imports/api/games/utils.js';
import {gameReaction} from '/imports/startup/client/routes.js';

Template.reactions.events({
	'click [data-action="trigger-reaction-list"]': function() {
		gameReaction.toggleSelectorDisplay();
	},

	'click [data-action="send-reaction"]': function(e) {
		gameReaction.onReactionSelection($(e.currentTarget), isUserHost(Session.get('game')));
	},

	'click [data-action="cheer-host"]': function() {
		gameReaction.cheerPlayer(true);
	},

	'click [data-action="cheer-client"]': function() {
		gameReaction.cheerPlayer(false);
	}
});

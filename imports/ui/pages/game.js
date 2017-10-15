import {Template} from 'meteor/templating';
import {isGameStatusOnGoing} from '/imports/api/games/utils.js';

import './game.html';

Template.game.helpers({
	isGameOnGoing: function() {
		return isGameStatusOnGoing(this.game.status);
	},

	isHost: function() {
		return this.game.createdBy === Meteor.userId();
	}
});

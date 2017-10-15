import {Template} from 'meteor/templating';
import {isGameStatusOnGoing} from '/imports/api/games/utils.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';

import './tournamentGame.html';

Template.tournamentGame.helpers({
	isGameOnGoing: function() {
		return isGameStatusOnGoing(this.game.status);
	},

	tournamentDescription: function() {
		const tournament = Tournaments.findOne({_id: this.game.tournamentId});

		if (tournament.description) {
			return tournament.description;
		}

		return tournament.mode.description;
	}
});

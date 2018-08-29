import {tournamentName} from "/imports/api/tournaments/utils.js";
import {Template} from 'meteor/templating';

import './tournamentUserProfile.html';

Template.tournamentUserProfile.helpers({
	tournamentName: function() {
		return tournamentName(this.tournament);
	},

	tournamentDescription: function() {
		if (this.tournament.description) {
			return this.tournament.description;
		}

		return '';
	}
});

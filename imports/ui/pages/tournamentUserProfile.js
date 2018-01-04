import {Template} from 'meteor/templating';

import './tournamentUserProfile.html';

Template.tournamentUserProfile.helpers({
	tournamentName: function() {
		if (this.tournament.name) {
			return this.tournament.name;
		}

		return this.tournament.mode.name;
	},

	tournamentDescription: function() {
		if (this.tournament.description) {
			return this.tournament.description;
		}

		return this.tournament.mode.description;
	}
});

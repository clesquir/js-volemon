import {Template} from 'meteor/templating';

import './tournamentUserProfile.html';

Template.tournamentUserProfile.helpers({
	tournamentDescription: function() {
		if (this.tournament.description) {
			return this.tournament.description;
		}

		return this.tournament.mode.description;
	}
});

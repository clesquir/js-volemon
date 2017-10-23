import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {Router} from 'meteor/iron:router';
import {INITIAL_ELO_RATING} from '/imports/api/profiles/constants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {canPlayTournament, isTournamentActive} from '/imports/api/tournaments/utils.js';
import {getWinRate} from '/imports/lib/utils.js';

import './tournament.html';

Template.tournament.helpers({
	tournamentDescription: function() {
		if (this.tournament.description) {
			return this.tournament.description;
		}

		return this.tournament.mode.description;
	},

	isTournamentActive: function() {
		const tournament = Tournaments.findOne({_id: Session.get('tournament')});

		return isTournamentActive(tournament);
	},

	tournamentIsActiveAndHasRetries: function() {
		const tournament = Tournaments.findOne({_id: Session.get('tournament')});

		return isTournamentActive(tournament) && tournament.numberOfLostAllowed > 0;
	},

	retriesAvailables: function() {
		const tournament = Tournaments.findOne({_id: Session.get('tournament')});
		const retries = [];
		let numberOfLost = 0;

		if (this.tournamentProfile) {
			numberOfLost = this.tournamentProfile.numberOfLost;
		}

		for (let i = 0; i < tournament.numberOfLostAllowed; i++) {
			retries.push(
				{
					lost: (numberOfLost > i)
				}
			);
		}

		return retries;
	},

	numberOfGamesPlayed: function() {
		if (!this.tournamentProfile) {
			return 0;
		}

		return this.tournamentProfile.numberOfWin + this.tournamentProfile.numberOfLost;
	},

	winRate: function() {
		if (!this.tournamentProfile) {
			return '-';
		}

		return getWinRate(this.tournamentProfile);
	},

	eloRating: function() {
		if (!this.tournamentProfile) {
			return INITIAL_ELO_RATING;
		}

		return this.tournamentProfile.eloRating;
	},

	eloRatingLastChange: function() {
		if (!this.tournamentProfile) {
			return null;
		}

		return this.tournamentProfile.eloRatingLastChange;
	},

	canPlayTournament: function() {
		return canPlayTournament(Session.get('tournament'), Meteor.userId());
	}
});

Template.tournament.events({
	'click [data-action=view-tournament-statistics]': function() {
		const tournamentContents = document.getElementById('tournament-contents');

		if (!$(tournamentContents).is('.tournament-statistics-shown')) {
			removeShownClasses(tournamentContents);
			$(tournamentContents).addClass('tournament-statistics-shown');
		}
	},

	'click [data-action=view-games-tournament]': function() {
		const tournamentContents = document.getElementById('tournament-contents');

		if (!$(tournamentContents).is('.games-tournament-shown')) {
			removeShownClasses(tournamentContents);
			$(tournamentContents).addClass('games-tournament-shown');
		}
	},

	'click [data-action=view-rank-tournament]': function() {
		const tournamentContents = document.getElementById('tournament-contents');

		if (!$(tournamentContents).is('.rank-tournament-shown')) {
			removeShownClasses(tournamentContents);
			$(tournamentContents).addClass('rank-tournament-shown');
		}
	},

	'click [data-action=create-tournament-game]': function() {
		Tooltips.hide();
		Session.set('apploadingmask', true);

		Meteor.call('createTournamentGame', Session.get('tournament'), function(error, id) {
			Session.set('apploadingmask', false);
			if (error) {
				return alert(error);
			}

			Router.go('tournamentGame', {tournamentId: Session.get('tournament'), gameId: id});
		});
	}
});

const removeShownClasses = function(homeContents) {
	$(homeContents).removeClass('tournament-statistics-shown');
	$(homeContents).removeClass('games-tournament-shown');
	$(homeContents).removeClass('rank-tournament-shown');
};

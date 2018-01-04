import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {Router} from 'meteor/iron:router';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {canPlayTournament, isTournamentActive} from '/imports/api/tournaments/utils.js';
import {loadStatistics} from '/imports/ui/views/statistics.js';

import './tournament.html';

class TournamentRankingsCollection extends Mongo.Collection {}
const TournamentRankings = new TournamentRankingsCollection('tournamentrankings');

Template.tournament.onCreated(function() {
	this.autorun(() => {
		loadStatistics(Meteor.userId(), Session.get('tournament'));
	});
});

Template.tournament.helpers({
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

	canPlayTournament: function() {
		return canPlayTournament(Session.get('tournament'), Meteor.userId());
	},

	getRankings: function() {
		return TournamentRankings.find({}, {sort: [['eloRating', 'desc']]});
	}
});

Template.tournament.events({
	'click [data-action=view-tournament-statistics]': function() {
		const tournamentContents = document.getElementById('tournament-contents');

		if (!$(tournamentContents).is('.tournament-statistics-shown')) {
			removeShownClasses(tournamentContents);
			$(tournamentContents).addClass('tournament-statistics-shown');

			loadStatistics(Meteor.userId(), Session.get('tournament'));
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
		Session.set('appLoadingMask', true);

		Meteor.call('createTournamentGame', Session.get('tournament'), function(error, id) {
			Session.set('appLoadingMask', false);
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

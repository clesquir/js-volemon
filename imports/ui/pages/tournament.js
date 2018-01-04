import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {Router} from 'meteor/iron:router';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {canPlayTournament, isTournamentActive} from '/imports/api/tournaments/utils.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {loadStatistics} from '/imports/ui/views/statistics.js';

import './tournament.html';

class TournamentRankingsCollection extends Mongo.Collection {}
const TournamentRankings = new TournamentRankingsCollection('tournamentrankings');

Template.tournament.onCreated(function() {
	this.autorun(() => {
		loadStatistics(Meteor.userId(), Session.get('tournament'));
	});
});

let cardSwitcher;

Template.tournament.onRendered(function() {
	cardSwitcher = new CardSwitcher('.tournament-swiper-container', highlightSelectorContentMenuOnSwipe);
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
	'click [data-action=view-tournament-games]': function() {
		cardSwitcher.slideTo(0);
	},

	'click [data-action=view-tournament-statistics]': function() {
		const tournament = Tournaments.findOne({_id: Session.get('tournament')});

		if (isTournamentActive(tournament)) {
			cardSwitcher.slideTo(1);
		} else {
			cardSwitcher.slideTo(0);
		}
	},

	'click [data-action=view-tournament-rank]': function() {
		const tournament = Tournaments.findOne({_id: Session.get('tournament')});

		if (isTournamentActive(tournament)) {
			cardSwitcher.slideTo(2);
		} else {
			cardSwitcher.slideTo(1);
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

const highlightSelectorContentMenuOnSwipe = function() {
	switch ($(this.slides[this.activeIndex]).attr('data-slide')) {
		case 'tournament-games':
			viewTournamentGames();
			break;
		case 'tournament-statistics':
			viewTournamentStatistics();
			break;
		case 'tournament-rank':
			viewTournamentRank();
			break;
	}
};

const viewTournamentGames = function() {
	const tournamentContents = document.getElementById('tournament-contents');

	if (!$(tournamentContents).is('.tournament-games-shown')) {
		removeShownClasses(tournamentContents);
		$(tournamentContents).addClass('tournament-games-shown');
	}
};

const viewTournamentStatistics = function() {
	const tournamentContents = document.getElementById('tournament-contents');

	if (!$(tournamentContents).is('.tournament-statistics-shown')) {
		removeShownClasses(tournamentContents);
		$(tournamentContents).addClass('tournament-statistics-shown');

		loadStatistics(Meteor.userId(), Session.get('tournament'));
	}
};

const viewTournamentRank = function() {
	const tournamentContents = document.getElementById('tournament-contents');

	if (!$(tournamentContents).is('.tournament-rank-shown')) {
		removeShownClasses(tournamentContents);
		$(tournamentContents).addClass('tournament-rank-shown');
	}
};

const removeShownClasses = function(homeContents) {
	$(homeContents).removeClass('tournament-statistics-shown');
	$(homeContents).removeClass('tournament-games-shown');
	$(homeContents).removeClass('tournament-rank-shown');
};

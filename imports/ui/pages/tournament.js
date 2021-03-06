import {MatchMakers} from '/imports/api/games/matchMakers.js';
import RankChart from '/imports/api/ranks/client/RankChart.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {canPlayTournament, isTournamentActive, tournamentName} from '/imports/api/tournaments/utils.js';
import {hasEditTournamentAccess, isTournamentAdministrator} from '/imports/api/users/userConfigurations.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {timeElapsedSince} from '/imports/lib/utils.js';
import {loadStatistics} from '/imports/ui/views/statistics.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import {Mongo} from "meteor/mongo";
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import moment from 'moment';
import './tournament.html';

const he = require('he');

class TournamentRankingsCollection extends Mongo.Collection {}
const TournamentRankings = new TournamentRankingsCollection('tournamentrankings');

class RankChartCollection extends Mongo.Collection {}
const RankChartData = new RankChartCollection(null);

Template.tournament.onCreated(function() {
	loadStatistics(Meteor.userId(), Session.get('tournament'));
});

let cardSwitcher;

Template.tournament.onRendered(function() {
	cardSwitcher = new CardSwitcher(
		'.tournament-swiper-container',
		{
			'tournament-games': TournamentViews.viewTournamentGames,
			'tournament-statistics': TournamentViews.viewTournamentStatistics,
			'tournament-rank': TournamentViews.viewTournamentRank,
			'tournament-line-chart': TournamentViews.viewTournamentLineChart,
		}
	);
});

/** @type {RankChart}|null */
let rankChart = null;
let rankChartSubscriptionHandler = null;

Template.tournament.destroyed = function() {
	rankChart = null;
	if (rankChartSubscriptionHandler) {
		rankChartSubscriptionHandler.stop();
	}
};

Template.tournament.helpers({
	tournamentName: function() {
		return tournamentName(this.tournament);
	},

	tournamentDescription: function() {
		if (this.tournament.description) {
			return this.tournament.description;
		}

		return '';
	},

	canEditTournament: function() {
		return hasEditTournamentAccess();
	},

	isTournamentAdministrator: function() {
		return isTournamentAdministrator();
	},

	hasPlayersWaiting: function() {
		const match = MatchMakers.findOne({modeSelection: 'tournament', tournamentId: this.tournament._id});

		return match && match.usersToMatch && match.usersToMatch.length > 0;
	},

	playersWaiting: function() {
		const match = MatchMakers.findOne({modeSelection: 'tournament', tournamentId: this.tournament._id});

		if (match && match.usersToMatch) {
			const players = [];

			for (let userToMatch of match.usersToMatch) {
				players.push(he.encode(userToMatch.name));
			}

			return players.join('<br />');
		}

		return '';
	},

	numberOfPlayersWaiting: function() {
		const match = MatchMakers.findOne({modeSelection: 'tournament', tournamentId: this.tournament._id});

		if (match && match.usersToMatch) {
			return match.usersToMatch.length;
		}

		return 0;
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
	'click [data-action="edit-tournament"]': function() {
		Router.go(Router.routes['tournamentAdministration'].url({tournamentId: Session.get('tournament')}));
	},

	'click [data-action="duplicate-tournament"]': function() {
		Session.set('appLoadingMask', true);
		Session.set('appLoadingMask.text', 'Creating draft tournament...');

		Meteor.call(
			'duplicateTournament',
			Session.get('tournament'),
			function(error, tournament) {
				Session.set('appLoadingMask', false);
				if (error !== undefined) {
					alert(error);
				} else {
					Router.go(Router.routes['tournamentAdministration'].url({tournamentId: tournament}));
				}
			}
		);
	},

	'click [data-action="remove-tournament"]': function() {
		Meteor.call(
			'removeTournament',
			Session.get('tournament'),
			function(error) {
				if (error !== undefined) {
					alert(error);
				}
			}
		);
	},

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

	'click [data-action=view-tournament-line-chart]': function() {
		const tournament = Tournaments.findOne({_id: Session.get('tournament')});

		if (isTournamentActive(tournament)) {
			cardSwitcher.slideTo(3);
		} else {
			cardSwitcher.slideTo(2);
		}
	},

	'click [data-action=play-tournament-game]': function() {
		Tooltips.hide();

		if (!Meteor.userId()) {
			Session.set('lightbox', 'login');
		} else {
			Session.set('matchMaking.modeSelection', 'tournament');
			Session.set('matchMaking.tournamentId', Session.get('tournament'));
			Session.set('lightbox', 'matchMaking');
			Session.set('lightbox.closable', false);
		}
	}
});

class TournamentViews {
	static viewTournamentGames() {
		const tournamentContents = document.getElementById('tournament-contents');

		if (!$(tournamentContents).is('.tournament-games-shown')) {
			TournamentViews.removeShownClasses(tournamentContents);
			$(tournamentContents).addClass('tournament-games-shown');
		}
	}

	static viewTournamentStatistics() {
		const tournamentContents = document.getElementById('tournament-contents');

		if (!$(tournamentContents).is('.tournament-statistics-shown')) {
			TournamentViews.removeShownClasses(tournamentContents);
			$(tournamentContents).addClass('tournament-statistics-shown');

			loadStatistics(Meteor.userId(), Session.get('tournament'));
		}
	}

	static viewTournamentRank() {
		const tournamentContents = document.getElementById('tournament-contents');

		if (!$(tournamentContents).is('.tournament-rank-shown')) {
			TournamentViews.removeShownClasses(tournamentContents);
			$(tournamentContents).addClass('tournament-rank-shown');
		}
	}

	static viewTournamentLineChart() {
		const tournamentContents = document.getElementById('tournament-contents');

		if (!$(tournamentContents).is('.tournament-line-chart-shown')) {
			TournamentViews.removeShownClasses(tournamentContents);
			$(tournamentContents).addClass('tournament-line-chart-shown');
			updateRankChart();
		}
	}

	static removeShownClasses(tournamentContents) {
		$(tournamentContents).removeClass('tournament-statistics-shown');
		$(tournamentContents).removeClass('tournament-games-shown');
		$(tournamentContents).removeClass('tournament-rank-shown');
		$(tournamentContents).removeClass('tournament-line-chart-shown');
	}
}

const updateRankChart = function() {
	Session.set('lineChartDisplayLoadingMask', true);

	if (!rankChart) {
		rankChart = new RankChart(
			'rank-line-chart-canvas',
			RankChartData.find({}, {sort: ['timestamp']})
		);
	}

	Meteor.call(
		'tournamentRanksChart',
		Session.get('tournament'),
		(error, data) => {
			RankChartData.remove({});

			for (let datum of data) {
				RankChartData.insert(datum);
			}

			const tournament = Tournaments.findOne({_id: Session.get('tournament')});

			if (!tournament) {
				return;
			}

			const date = moment(tournament.startDate, 'YYYY-MM-DD ZZ');
			rankChart.update(timeElapsedSince(date.valueOf()));
			Session.set('lineChartDisplayLoadingMask', false);
		}
	);
};

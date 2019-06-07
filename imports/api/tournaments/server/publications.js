import {EloScores} from '/imports/api/games/eloscores';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {TeamEloScores} from '/imports/api/games/teameloscores';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {canPlayTournament} from '/imports/api/tournaments/utils.js';
import {Meteor} from 'meteor/meteor';
import moment from 'moment';

Meteor.publish('playableTournaments', function(userId) {
	const today = moment(new Date());

	const tournaments = Tournaments.find({
		'status.id': 'approved',
		'startDate': {'$lte': today.format('YYYY-MM-DD') + ' -04:00'},
		'endDate': {'$gt': today.format('YYYY-MM-DD') + ' -04:00'}
	});

	tournaments.forEach((tournament) => {
		if (canPlayTournament(tournament._id, userId)) {
			this.added('playableTournaments', tournament._id, tournament);
		}
	});

	this.playableTournamentsTracker = tournaments.observe({
		added: (tournament) => {
			if (canPlayTournament(tournament._id, userId)) {
				this.added('playableTournaments', tournament._id, tournament);
			}
		},
		changed: (tournament) => {
			if (canPlayTournament(tournament._id, userId)) {
				this.changed('playableTournaments', tournament._id, tournament);
			} else {
				this.removed('playableTournaments', tournament._id, tournament);
			}
		},
		removed: (tournament) => {
			this.removed('playableTournaments', tournament._id, tournament);
		}
	});

	this.ready();

	this.onStop(() => {
		this.playableTournamentsTracker.stop();
	});
});

Meteor.publish('activeTournaments', function() {
	const today = moment(new Date());

	const tournaments = Tournaments.find({
		'status.id': 'approved',
		'startDate': {'$lte': today.format('YYYY-MM-DD') + ' -04:00'},
		'endDate': {'$gt': today.format('YYYY-MM-DD') + ' -04:00'}
	});

	tournaments.forEach((tournament) => {
		this.added('activeTournaments', tournament._id, tournament);
	});

	this.activeTournamentsTracker = tournaments.observe({
		added: (tournament) => {
			this.added('activeTournaments', tournament._id, tournament);
		},
		changed: (tournament) => {
			this.changed('activeTournaments', tournament._id, tournament);
		},
		removed: (tournament) => {
			this.removed('activeTournaments', tournament._id, tournament);
		}
	});

	this.ready();

	this.onStop(() => {
		this.activeTournamentsTracker.stop();
	});
});

Meteor.publish('futureTournaments', function() {
	const today = moment(new Date());

	const tournaments = Tournaments.find({
		'status.id': 'approved',
		'startDate': {'$gt': today.format('YYYY-MM-DD') + ' -04:00'}
	});

	tournaments.forEach((tournament) => {
		this.added('futureTournaments', tournament._id, tournament);
	});

	this.futureTournamentsTracker = tournaments.observe({
		added: (tournament) => {
			this.added('futureTournaments', tournament._id, tournament);
		},
		changed: (tournament) => {
			this.changed('futureTournaments', tournament._id, tournament);
		},
		removed: (tournament) => {
			this.removed('futureTournaments', tournament._id, tournament);
		}
	});

	this.ready();

	this.onStop(() => {
		this.futureTournamentsTracker.stop();
	});
});

Meteor.publish('submittedTournaments', function() {
	const tournaments = Tournaments.find({'status.id': 'submitted'});

	tournaments.forEach((tournament) => {
		this.added('submittedTournaments', tournament._id, tournament);
	});

	this.submittedTournamentsTracker = tournaments.observe({
		added: (tournament) => {
			this.added('submittedTournaments', tournament._id, tournament);
		},
		changed: (tournament) => {
			this.changed('submittedTournaments', tournament._id, tournament);
		},
		removed: (tournament) => {
			this.removed('submittedTournaments', tournament._id, tournament);
		}
	});

	this.ready();

	this.onStop(() => {
		this.submittedTournamentsTracker.stop();
	});
});

Meteor.publish('draftTournaments', function() {
	const userId = Meteor.userId();
	const tournaments = Tournaments.find({'status.id': 'draft', 'editor.id': userId});

	tournaments.forEach((tournament) => {
		this.added('draftTournaments', tournament._id, tournament);
	});

	this.draftTournamentsTracker = tournaments.observe({
		added: (tournament) => {
			this.added('draftTournaments', tournament._id, tournament);
		},
		changed: (tournament) => {
			this.changed('draftTournaments', tournament._id, tournament);
		},
		removed: (tournament) => {
			this.removed('draftTournaments', tournament._id, tournament);
		}
	});

	this.ready();

	this.onStop(() => {
		this.draftTournamentsTracker.stop();
	});
});

Meteor.publish('tournament', function(tournamentId) {
	return [
		Tournaments.find({_id: tournamentId})
	];
});

Meteor.publish('tournamentProfile', function(tournamentId, userId) {
	return [
		TournamentProfiles.find({tournamentId: tournamentId, userId: userId})
	];
});

Meteor.publish('tournamentGames', function(tournamentId) {
	return [
		Games.find(
			{
				isPrivate: false,
				tournamentId: tournamentId,
				status: GAME_STATUS_STARTED
			},
			{
				sort: [['createdAt', 'asc']],
				fields: {tournamentId: 1, gameMode: 1, players: 1, createdAt: 1, status: 1}
			}
		)
	];
});

Meteor.publish('tournamentGame', function(tournamentId, gameId) {
	return [
		Games.find({_id: gameId}),
		Players.find({gameId: gameId}),
		EloScores.find({gameId: gameId}),
		TeamEloScores.find({gameId: gameId}),
		Tournaments.find({_id: tournamentId}),
		TournamentProfiles.find({tournamentId: tournamentId}),
		TournamentEloScores.find({gameId: gameId})
	];
});

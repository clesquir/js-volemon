import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {canPlayTournament} from '/imports/api/tournaments/utils.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {Meteor} from 'meteor/meteor';
import * as Moment from 'meteor/momentjs:moment';

Meteor.publish('playableTournaments', function(userId) {
	Tournaments.find({'status.id': 'approved'}).forEach((tournament) => {
		if (
			Moment.moment(tournament.startDate, "YYYY-MM-DD ZZ").diff(new Date()) <= 0 &&
			Moment.moment(tournament.endDate, "YYYY-MM-DD ZZ").diff(new Date()) >= 0 &&
			canPlayTournament(tournament._id, userId)
		) {
			this.added('playableTournaments', tournament._id, tournament);
		}
	});

	this.ready();
});

Meteor.publish('activeTournaments', function() {
	Tournaments.find({'status.id': 'approved'}).forEach((tournament) => {
		if (
			Moment.moment(tournament.startDate, "YYYY-MM-DD ZZ").diff(new Date()) <= 0 &&
			Moment.moment(tournament.endDate, "YYYY-MM-DD ZZ").diff(new Date()) >= 0
		) {
			this.added('activeTournaments', tournament._id, tournament);
		}
	});

	this.ready();
});

Meteor.publish('futureTournaments', function() {
	Tournaments.find({'status.id': 'approved'}).forEach((tournament) => {
		if (Moment.moment(tournament.startDate, "YYYY-MM-DD ZZ").diff(new Date()) > 0) {
			this.added('futureTournaments', tournament._id, tournament);
		}
	});

	this.ready();
});

Meteor.publish('draftTournaments', function() {
	Tournaments.find({'status.id': 'draft'}).forEach((tournament) => {
		this.added('draftTournaments', tournament._id, tournament);
	});

	this.draftTournamentsTracker = Tournaments.find({'status.id': 'draft'}).observe({
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
		Tournaments.find({_id: tournamentId}),
		TournamentProfiles.find({tournamentId: tournamentId}),
		Games.find({_id: gameId}),
		Players.find({gameId: gameId}),
		TournamentEloScores.find({gameId: gameId})
	];
});

Meteor.publish('tournamentRanksChart', function(tournamentId) {
	const usernameByUserId = {};

	UserConfigurations.find().forEach((userConfiguration) => {
		usernameByUserId[userConfiguration.userId] = userConfiguration.name;
	});

	TournamentEloScores.find({tournamentId: tournamentId}).forEach((eloScore) => {
		const key = eloScore.userId + '_' + eloScore.timestamp;
		this.added(
			'tournamentrankchartdata',
			key,
			Object.assign(
				eloScore,
				{
					username: usernameByUserId[eloScore.userId]
				}
			)
		);
	});

	this.ready();

	this.onStop(() => {
		this.removed('tournamentrankchartdata');
	});
});

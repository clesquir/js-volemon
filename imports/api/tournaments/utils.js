import * as Moment from 'meteor/momentjs:moment';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export const playersCanPlayTournament = function(tournamentId, players) {
	let allCanPlay = true;

	if (tournamentId) {
		players.forEach((player) => {
			if (!canPlayTournament(tournamentId, player.userId)) {
				allCanPlay = false;
			}
		});
	}

	return allCanPlay;
};

export const canPlayTournament = function(tournamentId, userId) {
	const tournament = Tournaments.findOne({_id: tournamentId});
	const tournamentProfile = TournamentProfiles.findOne({tournamentId: tournamentId, userId: userId});

	if (tournament && tournament.status.id === 'draft') {
		return true;
	}

	if (!isTournamentActive(tournament)) {
		return false;
	}

	if (!tournament.numberOfLostAllowed) {
		return true;
	}

	let numberOfLost = 0;
	if (tournamentProfile) {
		numberOfLost = tournamentProfile.numberOfLost;
	}

	return numberOfLost < tournament.numberOfLostAllowed;
};

export const isTournamentActive = function(tournament) {
	const now = Moment.moment.duration(getUTCTimeStamp()).valueOf();

	return (
		tournament &&
		now >= Moment.moment(tournament.startDate, "YYYY-MM-DD ZZ").valueOf() &&
		now <= Moment.moment(tournament.endDate, "YYYY-MM-DD ZZ").valueOf()
	);
};

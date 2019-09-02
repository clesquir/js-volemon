import {Meteor} from 'meteor/meteor';
import moment from 'moment';
import {Games} from '/imports/api/games/games.js';
import {
	GAME_STATUS_REGISTRATION,
	GAME_STATUS_STARTED,
	GAME_STATUS_TIMEOUT
} from '/imports/api/games/statusConstants.js';
import TournamentFinished from '/imports/api/tournaments/events/TournamentFinished';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import EventPublisher from '/imports/lib/EventPublisher.js';

//Every two hours
const CHECK_DELAY = 7200000;

export default class TournamentFinish {
	init() {
		Meteor.setInterval(() => {
			this.checkForFinishedTournaments();
		}, CHECK_DELAY);
	}

	checkForFinishedTournaments() {
		const tournaments = Tournaments.find({'status.id': 'approved', isPublished: false});

		tournaments.forEach((tournament) => {
			if (moment(tournament.endDate, "YYYY-MM-DD ZZ").diff(new Date()) < 0) {
				this.onFinish(tournament._id);
			}
		});
	}

	/**
	 * @private
	 * @param tournamentId
	 */
	onFinish(tournamentId) {
		EventPublisher.publish(new TournamentFinished(tournamentId));
		Tournaments.update({_id: tournamentId}, {$set: {isPublished: true}});
		Games.update(
			{tournamentId: tournamentId, status: {$in: [GAME_STATUS_REGISTRATION, GAME_STATUS_STARTED]}},
			{$set: {status: GAME_STATUS_TIMEOUT}}
		);
	}
}

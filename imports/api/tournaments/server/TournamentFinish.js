import {Meteor} from 'meteor/meteor';
import * as Moment from 'meteor/momentjs:moment';
import TournamentFinished from '/imports/api/tournaments/events/TournamentFinished.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';

//Every two hours
const CHECK_DELAY = 7200000;

export default class TournamentFinish {
	init() {
		Meteor.setInterval(() => {
			this.checkForFinishedTournaments();
		}, CHECK_DELAY);
	}

	checkForFinishedTournaments() {
		const tournaments = Tournaments.find({isPublished: false});

		tournaments.forEach((tournament) => {
			if (Moment.moment(tournament.endDate, "YYYY-MM-DD Z").diff(new Date()) < 0) {
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
	}
}

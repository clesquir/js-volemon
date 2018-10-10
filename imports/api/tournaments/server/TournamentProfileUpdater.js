import ProfileUpdater from '/imports/api/profiles/server/ProfileUpdater.js';
import {DEFAULT_PROFILE_DATA, INITIAL_ELO_RATING} from '/imports/api/profiles/constants.js';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class TournamentProfileUpdater extends ProfileUpdater {
	constructor(tournamentId) {
		super();
		this.tournamentId = tournamentId;
	}

	findOrCreate(userId) {
		if (userId === 'CPU') {
			return this.defaultProfileData(userId);
		}

		let profile = TournamentProfiles.findOne({
			userId: userId,
			tournamentId: this.tournamentId
		});

		if (!profile) {
			TournamentProfiles.insert(this.defaultProfileData(userId));

			profile = TournamentProfiles.findOne({
				userId: userId,
				tournamentId: this.tournamentId
			});

			TournamentEloScores.insert({
				timestamp: getUTCTimeStamp(),
				userId: userId,
				tournamentId: this.tournamentId,
				eloRating: INITIAL_ELO_RATING
			});
		}

		return profile;
	}

	update(userId, data) {
		const profile = this.findOrCreate(userId);

		if (data.userId !== 'CPU') {
			TournamentProfiles.update({_id: profile._id}, {$set: data});
		}
	}

	/**
	 * @private
	 * @param userId
	 * @returns mixed
	 */
	defaultProfileData(userId) {
		return Object.assign(
			{
				userId: userId,
				tournamentId: this.tournamentId
			},
			DEFAULT_PROFILE_DATA
		);
	}
}

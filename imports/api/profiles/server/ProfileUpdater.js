import {EloScores} from '/imports/api/games/eloscores.js';
import {DEFAULT_PROFILE_DATA, INITIAL_ELO_RATING} from '/imports/api/profiles/constants.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class ProfileUpdater {
	findOrCreate(userId) {
		if (userId === 'CPU') {
			return this.defaultProfileData(userId);
		}

		let profile = Profiles.findOne({userId: userId});

		if (!profile) {
			Profiles.insert(this.defaultProfileData(userId));
			profile = Profiles.findOne({userId: userId});

			EloScores.insert({
				timestamp: getUTCTimeStamp(),
				userId: userId,
				eloRating: INITIAL_ELO_RATING
			});
		}

		return profile;
	}

	update(userId, data) {
		const profile = this.findOrCreate(userId);

		if (userId !== 'CPU') {
			Profiles.update({_id: profile._id}, {$set: data});
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
				userId: userId
			},
			DEFAULT_PROFILE_DATA
		);
	}
}

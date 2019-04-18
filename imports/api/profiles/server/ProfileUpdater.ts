import {EloScores} from "../../games/eloscores";
import {Profiles} from "../profiles";
import {DEFAULT_PROFILE_DATA, INITIAL_ELO_RATING} from "../constants";
import {getUTCTimeStamp} from "../../../lib/utils";

export default class ProfileUpdater {
	findOrCreate(userId: string) {
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

	update(userId: string, data) {
		const profile = this.findOrCreate(userId);

		if (userId !== 'CPU') {
			Profiles.update({_id: profile._id}, {$set: data});
		}
	}

	protected defaultProfileData(userId: string) {
		return Object.assign(
			{
				userId: userId
			},
			DEFAULT_PROFILE_DATA
		);
	}
}

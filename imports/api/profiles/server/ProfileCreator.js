import {DEFAULT_PROFILE_DATA} from '/imports/api/profiles/constants.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

export default class ProfileCreator {
	static create(userId) {
		Profiles.insert(
			Object.assign(
				{
					userId: userId
				},
				DEFAULT_PROFILE_DATA
			)
		);
	}
}

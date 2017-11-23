import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

export default class UserConfigurationCreator {
	static create(userId, name) {
		if (name.trim() === '') {
			throw new Error('Name must be filled.');
		}

		UserConfigurations.insert({
			userId: userId,
			name: name,
			lastShapeUsed: PLAYER_DEFAULT_SHAPE
		});
	}
}

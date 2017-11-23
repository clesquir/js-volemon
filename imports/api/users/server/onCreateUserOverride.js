import {Accounts} from 'meteor/accounts-base';
import {Random} from 'meteor/random';
import TournamentListeners from '/imports/api/achievements/server/TournamentListeners.js';
import InitialEloScoreCreator from '/imports/api/games/server/InitialEloScoreCreator.js';
import ProfileCreator from '/imports/api/profiles/server/ProfileCreator.js';
import UserConfigurationCreator from '/imports/api/users/server/UserConfigurationCreator.js';

Accounts.onCreateUser((options, user) => {
	user._id = Random.id();

	//Validate presence of name
	if (options.configuration === undefined || options.configuration.name === undefined) {
		throw new Error('Must set options.configuration.name');
	}

	UserConfigurationCreator.create(user._id, options.configuration.name);
	ProfileCreator.create(user._id);
	InitialEloScoreCreator.create(user._id);
	const tournamentListeners = new TournamentListeners();
	tournamentListeners.init(user._id);

	return user;
});

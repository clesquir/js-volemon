import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {Random} from 'meteor/random';
import {createProfile} from '/imports/api/profiles/server/createProfile.js';

Accounts.onCreateUser((options, user) => {
	user._id = Random.id();

	//Validate presence of name
	if (options.profile === undefined || options.profile.name === undefined) {
		throw new Error('Must set options.profile.name');
	}

	user.profile = options.profile;

	createProfile(user);

	return user;
});

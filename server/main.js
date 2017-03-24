import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {Random} from 'meteor/random';
import '/imports/lib/rollbar/server/Init.js';
import {createProfile} from '/imports/lib/server/userProfileCreation.js';
import ServerSocketIo from '/imports/lib/stream/server/ServerSocketIo.js';

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

ServerStream = new ServerSocketIo();

Meteor.startup(() => {
	ServerStream.connect();

	//Setup SMTP url
	process.env.MAIL_URL = Meteor.settings.smtpUrl;
});

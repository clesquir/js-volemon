import '/imports/lib/rollbar/server/Init.js';
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

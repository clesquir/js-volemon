process.env.ROLLBAR_SERVER_ACCESS_TOKEN = Meteor.settings.public.ROLLBAR_SERVER_ACCESS_TOKEN;
process.env.ROLLBAR_ENVIRONMENT = Meteor.settings.public.ROLLBAR_ENVIRONMENT;

if (process.env.ROLLBAR_SERVER_ACCESS_TOKEN) {
	const rollbar = require("rollbar");
	rollbar.init(process.env.ROLLBAR_SERVER_ACCESS_TOKEN, {
		environment: process.env.ROLLBAR_ENVIRONMENT || 'production'
	});
	rollbar.handleUncaughtExceptions();
}

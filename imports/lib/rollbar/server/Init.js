process.env.ROLLBAR_SERVER_ACCESS_TOKEN = Meteor.settings.public.ROLLBAR_SERVER_ACCESS_TOKEN;
process.env.ROLLBAR_ENVIRONMENT = Meteor.settings.public.ROLLBAR_ENVIRONMENT;

if (process.env.ROLLBAR_SERVER_ACCESS_TOKEN) {
	const Rollbar = require("rollbar");
	const rollbar = new Rollbar({
		accessToken: process.env.ROLLBAR_SERVER_ACCESS_TOKEN,
		environment: process.env.ROLLBAR_ENVIRONMENT || 'production',
		captureUncaught: true,
		captureUnhandledRejections: true
	});
	const express = require('express');
	const app = express();

	app.use(rollbar.errorHandler());

	app.listen(6943);
}

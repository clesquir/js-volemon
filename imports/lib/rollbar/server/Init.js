const ROLLBAR_SERVER_ACCESS_TOKEN = Meteor.settings.public.ROLLBAR_SERVER_ACCESS_TOKEN;
const ROLLBAR_ENVIRONMENT = Meteor.settings.public.ROLLBAR_ENVIRONMENT;

if (ROLLBAR_SERVER_ACCESS_TOKEN) {
	const Rollbar = require("rollbar");
	const rollbar = new Rollbar({
		accessToken: ROLLBAR_SERVER_ACCESS_TOKEN,
		environment: ROLLBAR_ENVIRONMENT || 'production',
		captureUncaught: true,
		captureUnhandledRejections: true
	});
	const express = require('express');
	const app = express();

	app.use(rollbar.errorHandler());

	app.listen(6943);
}

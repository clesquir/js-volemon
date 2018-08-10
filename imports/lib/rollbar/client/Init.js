const ROLLBAR_CLIENT_ACCESS_TOKEN = Meteor.settings.public.ROLLBAR_CLIENT_ACCESS_TOKEN;
const ROLLBAR_ENVIRONMENT = Meteor.settings.public.ROLLBAR_ENVIRONMENT;

if (ROLLBAR_CLIENT_ACCESS_TOKEN) {
	const _rollbarConfig = {
		accessToken: ROLLBAR_CLIENT_ACCESS_TOKEN,
		captureUncaught: true,
		captureUnhandledRejections: false,
		payload: {
			environment: ROLLBAR_ENVIRONMENT || 'production'
		}
	};
	require(
		'rollbar/dist/rollbar.umd',
		function(Rollbar) {
			new Rollbar(_rollbarConfig);
		}
	);
}

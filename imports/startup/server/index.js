import {Meteor} from 'meteor/meteor';
import '/imports/lib/rollbar/server/Init.js';
import {ServerStreamInitiator} from '/imports/lib/stream/server/ServerStreamInitiator.js';
import '/imports/api/games/server/keepAlive.js';
import './migrations.js';
import './register-api.js';

Meteor.startup(() => {
	ServerStreamInitiator.init();

	//Setup SMTP url
	process.env.MAIL_URL = Meteor.settings.smtpUrl;
});


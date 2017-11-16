import {Meteor} from 'meteor/meteor';
import AchievementsStartup from '/imports/api/achievements/server/Startup.js';
import GamesStartup from '/imports/api/games/server/Startup.js';
import SkinsStartup from '/imports/api/skins/server/Startup.js';
import TournamentsStartup from '/imports/api/tournaments/server/Startup.js';
import '/imports/lib/rollbar/server/Init.js';
import {ServerStreamInitiator} from '/imports/lib/stream/server/ServerStreamInitiator.js';
import './migrations.js';
import './register-api.js';

Meteor.startup(() => {
	AchievementsStartup.start();
	GamesStartup.start();
	SkinsStartup.start();
	TournamentsStartup.start();
	ServerStreamInitiator.init();

	//Setup SMTP url
	process.env.MAIL_URL = Meteor.settings.smtpUrl;
});

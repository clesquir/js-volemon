import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import AchievementMonitor from '/imports/api/achievements/client/Monitor.js';

let achievementMonitor = null;
const createAchievementMonitor = function() {
	achievementMonitor = new AchievementMonitor(Meteor.userId());
	achievementMonitor.start();
};

Accounts.onLogin(function() {
	createAchievementMonitor();
});

Accounts.onLogout(function() {
	if (achievementMonitor) {
		achievementMonitor.stop();
		achievementMonitor = null;
	}
});

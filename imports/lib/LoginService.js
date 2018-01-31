import {Meteor} from "meteor/meteor";

export default class LoginService {
	static start() {
		ServiceConfiguration.configurations.remove({service: 'facebook'});
		ServiceConfiguration.configurations.insert({
			service: 'facebook',
			appId: Meteor.settings.facebookAppId,
			secret: Meteor.settings.facebookSecret
		});
		ServiceConfiguration.configurations.remove({service: 'google'});
		ServiceConfiguration.configurations.insert({
			service: 'google',
			clientId: Meteor.settings.googleClientId,
			secret: Meteor.settings.googleSecret
		});
	}
}

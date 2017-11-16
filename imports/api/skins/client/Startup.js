import {Meteor} from 'meteor/meteor';
import SkinFactory from '/imports/api/skins/skins/SkinFactory.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

export default class Startup {
	static start() {
		Meteor.subscribe('userConfiguration', Meteor.userId(), () => {
			this.initSkin();
		});
	}

	static initSkin() {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

		const skin = SkinFactory.fromId(userConfiguration ? userConfiguration.skinId : null);
		skin.start();
	}
}

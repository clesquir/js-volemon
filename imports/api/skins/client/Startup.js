import {Meteor} from 'meteor/meteor';
import PluginFactory from '/imports/api/skins/plugins/PluginFactory.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

export default class Startup {
	static start() {
		Meteor.subscribe('userConfiguration', Meteor.userId(), () => {
			this.initPlugin();
		});
	}

	static initPlugin() {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
		const plugins = PluginFactory.fromConfiguration(userConfiguration);

		for (let plugin of plugins) {
			plugin.start();
		}
	}
}

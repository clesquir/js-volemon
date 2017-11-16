import {Meteor} from 'meteor/meteor';
import SkinStartup from '/imports/api/skins/client/Startup.js';

export default class Startup {
	static start() {
		Tracker.autorun(function(){
			if (Meteor.userId()) {
				SkinStartup.start();
			}
		});
	}
}

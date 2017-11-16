import {Meteor} from 'meteor/meteor';
import {Skins} from '/imports/api/skins/skins.js';

Meteor.publish('skins', function() {
	return [
		Skins.find()
	];
});

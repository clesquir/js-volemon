import {Meteor} from 'meteor/meteor';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {UserKeymaps} from '/imports/api/users/userKeymaps.js';

Meteor.publish('userConfiguration', function() {
	return UserConfigurations.find({userId: this.userId});
});

Meteor.publish('userKeymaps', function() {
	return UserKeymaps.find({userId: this.userId});
});

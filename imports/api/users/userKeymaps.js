import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class UserKeymapsCollection extends Mongo.Collection {}

export const UserKeymaps = new UserKeymapsCollection('userkeymaps');

if (Meteor.isServer) {
	UserKeymaps._ensureIndex({userId: 1});
}

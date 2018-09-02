import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class ProfilesCollection extends Mongo.Collection {}

export const Profiles = new ProfilesCollection('profiles');

if (Meteor.isServer) {
	Profiles._ensureIndex({userId: 1});
}

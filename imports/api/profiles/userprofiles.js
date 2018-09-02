import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class UserProfilesCollection extends Mongo.Collection {}

export const UserProfiles = new UserProfilesCollection('userprofiles');

if (Meteor.isServer) {
	UserProfiles._ensureIndex({userId: 1});
}

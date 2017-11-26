import {Mongo} from 'meteor/mongo';

class UserProfilesCollection extends Mongo.Collection {}

export const UserProfiles = new UserProfilesCollection('userprofiles');

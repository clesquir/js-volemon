import {Mongo} from 'meteor/mongo';

class ProfilesCollection extends Mongo.Collection {}

export const Profiles = new ProfilesCollection('profiles');


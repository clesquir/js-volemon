import {Mongo} from 'meteor/mongo';

class UserKeymapsCollection extends Mongo.Collection {}

export const UserKeymaps = new UserKeymapsCollection('userkeymaps');

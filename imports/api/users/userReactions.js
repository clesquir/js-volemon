import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class UserReactionsCollection extends Mongo.Collection {}

export const UserReactions = new UserReactionsCollection('userreactions');

if (Meteor.isServer) {
	UserReactions._ensureIndex({userId: 1});
}

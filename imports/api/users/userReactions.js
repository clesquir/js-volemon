import {Mongo} from 'meteor/mongo';

class UserReactionsCollection extends Mongo.Collection {}

export const UserReactions = new UserReactionsCollection('userreactions');

import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class UserAchievementsCollection extends Mongo.Collection {}

export const UserAchievements = new UserAchievementsCollection('userachievements');

if (Meteor.isServer) {
	UserAchievements._ensureIndex({userId: 1});
}

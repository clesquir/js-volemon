import {Mongo} from 'meteor/mongo';

class UserAchievementsCollection extends Mongo.Collection {}

export const UserAchievements = new UserAchievementsCollection('userachievements');

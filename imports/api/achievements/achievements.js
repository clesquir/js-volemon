import {Mongo} from 'meteor/mongo';

class AchievementsCollection extends Mongo.Collection {}

export const Achievements = new AchievementsCollection('achievements');

import {Mongo} from 'meteor/mongo';

class EloScoresCollection extends Mongo.Collection {}

export const EloScores = new EloScoresCollection('eloscores');

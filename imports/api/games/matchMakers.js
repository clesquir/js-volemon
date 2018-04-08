import {Mongo} from 'meteor/mongo';

class MatchMakerCollection extends Mongo.Collection {}

export const MatchMakers = new MatchMakerCollection('matchmakers');

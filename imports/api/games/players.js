import {Mongo} from 'meteor/mongo';

class PlayersCollection extends Mongo.Collection {}

export const Players = new PlayersCollection('players');

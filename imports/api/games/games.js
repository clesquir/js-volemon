import {Mongo} from 'meteor/mongo';

class GamesCollection extends Mongo.Collection {}

export const Games = new GamesCollection('games');

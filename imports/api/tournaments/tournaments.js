import {Mongo} from 'meteor/mongo';

class TournamentsCollection extends Mongo.Collection {}

export const Tournaments = new TournamentsCollection('tournaments');

import {Mongo} from 'meteor/mongo';

class ReplaysCollection extends Mongo.Collection {}

export const Replays = new ReplaysCollection('replays');

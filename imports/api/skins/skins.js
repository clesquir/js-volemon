import {Mongo} from 'meteor/mongo';

class SkinsCollection extends Mongo.Collection {}

export const Skins = new SkinsCollection('skins');

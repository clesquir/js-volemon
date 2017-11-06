import {Mongo} from 'meteor/mongo';

class UserConfigurationsCollection extends Mongo.Collection {}

export const UserConfigurations = new UserConfigurationsCollection('userconfigurations');

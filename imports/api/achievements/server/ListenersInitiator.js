import {Meteor} from 'meteor/meteor';
import TournamentListeners from './TournamentListeners';

export default class ListenersInitiator {
	static init() {
		const tournamentListeners = new TournamentListeners();
		const users = Meteor.users.find();

		users.forEach(function(user) {
			tournamentListeners.init(user._id);
		});
	}
};

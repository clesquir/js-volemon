import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';

Meteor.methods({
	updateUserName: function(name) {
		check(this.userId, String);

		Meteor.users.update({_id: this.userId}, {$set: {'profile.name': name}});
		Players.update({userId: this.userId}, {$set: {name: name}}, {multi: true});
		Games.update({createdBy: this.userId}, {$set: {creatorName: name}}, {multi: true});
	}
});

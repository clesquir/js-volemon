import { Players } from '/collections/players.js';

Meteor.methods({
	updateUserName: function(name) {
		check(this.userId, String);

		Meteor.users.update({_id: this.userId}, {$set: {'profile.name': name}});

		let players = Players.find({userId: this.userId});
		if (players.count()) {
			Players.update({userId: this.userId}, {$set: {name: name}}, {multi: true});
		}
	}
});

import {Meteor} from 'meteor/meteor';
import {Replays} from "../replays";

Meteor.methods({
	gameReplay: function (gameId) {
		const replay = Replays.findOne({gameId: gameId});
		let rows = [];

		if (replay) {
			rows = rows.concat(replay.rows);
		}

		return {
			rows: rows
		};
	}
});

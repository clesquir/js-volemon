import {Meteor} from 'meteor/meteor';
import {Replays} from "../replays";
import Stream from "../../../lib/stream/Stream";

export default class ReplayPersister {
	private readonly gameId: string;
	private readonly stream: Stream;
	private replayRows: Object[];

	constructor(gameId: string, stream: Stream) {
		this.gameId = gameId;
		this.stream = stream;
	}

	init() {
		this.replayRows = [];
		this.collectEvent('showBallHitPoint');
		this.collectEvent('showBallHitCount');
		this.collectEvent('activateBonus');
		this.collectEvent('killPlayer');
		this.collectEvent('sendBundledData');
		this.collectEvent('reaction');
		this.collectEvent('cheer');
	}

	start() {
	}

	stop() {
		for (let replayRow of this.replayRows) {
			Replays.insert(replayRow);
		}

		this.replayRows = [];
	}

	private collectEvent(eventName: string) {
		this.stream.on(
			eventName + '-' + this.gameId,
			Meteor.bindEnvironment(
				(data) => {
					this.replayRows.push(
						{
							gameId: this.gameId,
							timestamp: data.timestamp,
							eventName: eventName + '-' + this.gameId,
							data: data
						}
					);
				}
			)
		);
	}
}

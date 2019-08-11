import {Meteor} from 'meteor/meteor';
import {Replays} from "../replays";
import Stream from "../../../lib/stream/Stream";
import {EventPublisher} from "../../../lib/EventPublisher";
import GameStatusChanged from "../events/GameStatusChanged";
import PointTaken from "../events/PointTaken";

export enum ReplayType {
	STREAM,
	EVENT_PUBLISHER,
}

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
		this.collectStreamEvent('showBallHitPoint');
		this.collectStreamEvent('showBallHitCount');
		this.collectStreamEvent('activateBonus');
		this.collectStreamEvent('killPlayer');
		this.collectStreamEvent('sendBundledData');
		this.collectStreamEvent('reaction');
		this.collectStreamEvent('cheer');
		EventPublisher.on(GameStatusChanged.prototype.constructor.name, this.collectEventPublisherEvent, this);
		EventPublisher.on(PointTaken.prototype.constructor.name, this.collectEventPublisherEvent, this);
	}

	start() {
	}

	stop() {
		Replays.insert(
			{
				gameId: this.gameId,
				rows: this.replayRows
			}
		);

		this.replayRows = [];
	}

	destroy() {
		this.stop();

		EventPublisher.off(PointTaken.prototype.constructor.name, this.collectEventPublisherEvent, this);
		EventPublisher.off(GameStatusChanged.prototype.constructor.name, this.collectEventPublisherEvent, this);
		this.stream.off('cheer-' + this.gameId);
		this.stream.off('reaction-' + this.gameId);
		this.stream.off('sendBundledData-' + this.gameId);
		this.stream.off('killPlayer-' + this.gameId);
		this.stream.off('activateBonus-' + this.gameId);
		this.stream.off('showBallHitCount-' + this.gameId);
		this.stream.off('showBallHitPoint-' + this.gameId);
	}

	private collectStreamEvent(eventName: string) {
		this.stream.on(
			eventName + '-' + this.gameId,
			Meteor.bindEnvironment(
				(data) => {
					this.replayRows.push(
						{
							timestamp: data.timestamp,
							type: ReplayType.STREAM,
							eventName: eventName + '-' + this.gameId,
							data: data
						}
					);
				}
			)
		);
	}

	private collectEventPublisherEvent(event) {
		this.replayRows.push(
			{
				timestamp: (new Date()).getTime(),
				type: ReplayType.EVENT_PUBLISHER,
				eventName: event.constructor.name,
				event: event
			}
		);
	}
}

import Stream from "../../../lib/stream/Stream";
import GameData from "../data/GameData";
import {Replays} from "../replays";
import {ReplayedEvent, ReplayedStream, ReplayType} from "./ReplayPersister";
import EventPublisher from "../../../lib/EventPublisher";
import GameStatusChanged from "../events/GameStatusChanged";
import PointTaken from "../events/PointTaken";
import {getUTCTimeStamp} from "../../../lib/utils";
import {CLIENT_SIDE, HOST_SIDE} from "../constants";
import GamePlayStateCreated from "../events/GamePlayStateCreated";
import {Games} from "../games";
import BonusCaught from "../events/BonusCaught";
import BonusRemoved from "../events/BonusRemoved";
import {GAME_STATUS_STARTED} from "../statusConstants";
import GameReplayStarted from "../events/GameReplayStarted";

enum ReplayReaderState {
	STOPPED,
	PLAYING
}

export default class ReplayReader {
	private readonly gameId: string;
	private stream: Stream;
	private gameData: GameData;

	private initialStartedAt: number = null;
	private state: ReplayReaderState = ReplayReaderState.STOPPED;
	private game;
	private rowIndex: number = 0;
	private rows: any[];
	private replayTimer: number = null;

	constructor(gameId: string) {
		this.gameId = gameId;
	}

	inject(
		stream: Stream,
		gameData: GameData
	) {
		this.stream = stream;
		this.gameData = gameData;
	}

	init() {
		this.state = ReplayReaderState.PLAYING;
		EventPublisher.on(GamePlayStateCreated.getClassName(), this.restart, this);
	}

	destroy() {
		this.state = ReplayReaderState.STOPPED;
		EventPublisher.off(GamePlayStateCreated.getClassName(), this.restart, this);
	}

	restart() {
		this.game = Games.findOne({_id: this.gameId});
		const replay = Replays.findOne({gameId: this.gameId});

		Meteor.clearTimeout(this.replayTimer);
		this.restartState();

		if (replay && replay.rows.length > 0) {
			this.rows = replay.rows;

			EventPublisher.publish(new GameReplayStarted(this.gameId));
			this.playReplayRow();
		}
	}

	currentTime() {
		return getUTCTimeStamp();
	}

	private playReplayRow() {
		if (this.state === ReplayReaderState.STOPPED) {
			return;
		}

		if (this.rowIndex >= this.rows.length) {
			this.state = ReplayReaderState.STOPPED;
			return;
		}

		const row = this.rows[this.rowIndex];
		const lastTimestamp = this.rows[this.rowIndex - 1] ? this.rows[this.rowIndex - 1].timestamp : this.initialStartedAt;
		const timeout = row.timestamp - lastTimestamp;

		this.replayTimer = Meteor.setTimeout(() => {
			this.updateTimeSpent(row);

			switch (row.type) {
				case ReplayType.STREAM:
					this.replayStream(row);
					break;
				case ReplayType.EVENT_PUBLISHER:
					this.replayEvent(row);
			}

			this.rowIndex++;
			this.playReplayRow();
		}, timeout);
	}

	private restartState() {
		if (this.initialStartedAt === null) {
			this.initialStartedAt = this.gameData.startedAt;
		}

		this.gameData.startedAt = this.currentTime();
		this.gameData.updateHostPoints(0);
		this.gameData.updateClientPoints(0);
		this.gameData.updateStatus(GAME_STATUS_STARTED);
		this.gameData.updateActiveBonuses([]);
		this.gameData.updateLastPointTaken(null);
		this.gameData.updateLastPointAt(this.gameData.startedAt);

		this.rowIndex = 0;
		this.state = ReplayReaderState.PLAYING;
	}

	private replayStream(row: ReplayedStream) {
		this.stream.emit(row.eventName, this.replaceDataTimestamps(row.data));
	}

	private replayEvent(row: ReplayedEvent) {
		switch (row.eventName) {
			case GameStatusChanged.getClassName():
				this.gameData.updateStatus(row.event.status);

				EventPublisher.publish(
					new GameStatusChanged(
						row.event.gameId,
						row.event.status
					)
				);
				break;
			case BonusCaught.getClassName():
				this.gameData.addToActiveBonuses(
					Object.assign(
						{
							initialBonusClass: row.event.initialBonusClass
						},
						row.event.activationData,
						{
							activatedAt: this.currentTime()
						}
					)
				);
				break;
			case BonusRemoved.getClassName():
				this.gameData.removeFromActiveBonuses(row.event.identifier);
				break;
			case PointTaken.getClassName():
				this.gameData.updateActiveBonuses([]);
				this.gameData.updateHostPoints(row.event.hostPoints);
				this.gameData.updateClientPoints(row.event.clientPoints);
				this.gameData.updateLastPointTaken(row.event.pointScoredByHost ? HOST_SIDE : CLIENT_SIDE);
				this.gameData.updateLastPointAt(this.currentTime());

				EventPublisher.publish(
					new PointTaken(
						row.event.gameId,
						row.event.pointDuration,
						row.event.pointScoredByHost,
						row.event.hostPoints,
						row.event.clientPoints
					)
				);
				break;
		}
	}

	private replaceDataTimestamps(rowData): any {
		const columns = [
			'timestamp',
			'activatedAt',
			'killedAt',
		];

		for (let column of columns) {
			if (rowData[column]) {
				rowData[column] = this.currentTime();
			}
		}

		return rowData;
	}

	private updateTimeSpent(row) {
		let progress = (row.timestamp - this.initialStartedAt) / this.gameData.gameDuration * 100;

		if (progress < 0) {
			progress = 0;
		} else if (progress > 100) {
			progress = 100;
		}

		$('#game-replay-slider-time-spent').width(`${progress.toFixed(4)}%`);
	}
}

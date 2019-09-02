import GameDataUpdater from "./GameDataUpdater";
import {Games} from "../../games";
import GameData from "../../data/GameData";
import EventPublisher from "../../../../lib/EventPublisher";
import GameStatusChanged from "../../events/GameStatusChanged";
import {CLIENT_POINTS_COLUMN, HOST_POINTS_COLUMN} from "../../constants";
import LastPointUpdated from "../../events/LastPointUpdated";
import PointTaken from "../../events/PointTaken";

export default class CollectionObserverGameDataUpdater implements GameDataUpdater {
	private readonly gameData: GameData;
	private gameChangesTracker: Meteor.LiveQueryHandle;

	constructor(gameData: GameData) {
		this.gameData = gameData;
	}

	init() {
		this.gameChangesTracker = Games.find({_id: this.gameData.gameId}).observeChanges({
			changed: (id: string, fields: any) => {
				if (fields.hasOwnProperty('status')) {
					this.gameData.updateStatus(fields.status);

					EventPublisher.publish(new GameStatusChanged(this.gameData.gameId, fields.status));
				}

				if (fields.hasOwnProperty(HOST_POINTS_COLUMN)) {
					this.gameData.updateHostPoints(fields.hostPoints);
				}

				if (fields.hasOwnProperty(CLIENT_POINTS_COLUMN)) {
					this.gameData.updateClientPoints(fields.clientPoints);
				}

				if (fields.hasOwnProperty('activeBonuses')) {
					this.gameData.updateActiveBonuses(fields.activeBonuses);
				}

				if (fields.hasOwnProperty('lastPointTaken')) {
					this.gameData.updateLastPointTaken(fields.lastPointTaken);
				}

				if (fields.hasOwnProperty('lastPointAt')) {
					this.gameData.updateLastPointAt(fields.lastPointAt);

					EventPublisher.publish(new LastPointUpdated(this.gameData.gameId, fields.lastPointAt));
				}

				if (fields.hasOwnProperty(HOST_POINTS_COLUMN) || fields.hasOwnProperty(CLIENT_POINTS_COLUMN)) {
					EventPublisher.publish(new PointTaken(this.gameData.gameId));
				}
			}
		});
	}

	stop() {
		if (this.gameChangesTracker) {
			this.gameChangesTracker.stop();
		}
	}
}

import {GAME_STATUS_REGISTRATION} from "./statusConstants";

declare type CurrentGameObject = {
	hostPoints: number;
	clientPoints: number;
	status: string;
}

export default class CurrentGame {
	private static isReplay = new ReactiveVar(false);
	private static hostPoints = new ReactiveVar(0);
	private static clientPoints = new ReactiveVar(0);
	private static status = new ReactiveVar(GAME_STATUS_REGISTRATION);

	static set(currentGameObject: CurrentGameObject, isReplay: boolean = false) {
		this.isReplay.set(isReplay);
		this.hostPoints.set(currentGameObject.hostPoints);
		this.clientPoints.set(currentGameObject.clientPoints);
		this.status.set(currentGameObject.status);
	}

	static getIsReplay(): boolean {
		return this.isReplay.get();
	}

	static getHostPoints(): number {
		return this.hostPoints.get();
	}

	static getClientPoints(): number {
		return this.clientPoints.get();
	}

	static getStatus(): string {
		return this.status.get();
	}

	static updateHostPoints(hostPoints: number) {
		this.hostPoints.set(hostPoints);
	}

	static updateClientPoints(clientPoints: number) {
		this.clientPoints.set(clientPoints);
	}

	static updateStatus(status: string) {
		this.status.set(status);
	}
}

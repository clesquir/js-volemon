import ServerAdapter from "./ServerAdapter";

export default class NullServerAdapter implements ServerAdapter {
	send(name: string, args: any[], options?: any, asyncCallback?: Function) {
	}
}

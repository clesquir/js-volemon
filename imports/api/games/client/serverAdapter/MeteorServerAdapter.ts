import ServerAdapter from "./ServerAdapter";

export default class MeteorServerAdapter implements ServerAdapter {
	send(name: string, args: any[], options?: any, asyncCallback?: Function) {
		Meteor.apply(
			name,
			args,
			options,
			asyncCallback
		);
	}
}

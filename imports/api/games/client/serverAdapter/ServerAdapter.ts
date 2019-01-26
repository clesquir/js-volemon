export default interface ServerAdapter {
	send(name: string, args: any[], options?: any, asyncCallback?: Function);
}

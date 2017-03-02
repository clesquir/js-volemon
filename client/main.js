import '/imports/lib/rollbar/client/Init.js';
import ClientSocketIo from '/imports/lib/stream/client/ClientSocketIo.js';

// Hack https://github.com/socketio/socket.io-client/issues/961
import Response from 'meteor-node-stubs/node_modules/http-browserify/lib/response';
if (!Response.prototype.setEncoding) {
	Response.prototype.setEncoding = function(encoding) {
		// do nothing
	}
}

ClientStream = new ClientSocketIo();

Meteor.startup(() => {
	ClientStream.connect();
});

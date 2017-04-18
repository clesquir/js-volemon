// Hack https://github.com/socketio/socket.io-client/issues/961
import Response from 'meteor-node-stubs/node_modules/http-browserify/lib/response';
if (!Response.prototype.setEncoding) {
	Response.prototype.setEncoding = function(encoding) {
		// do nothing
	}
}

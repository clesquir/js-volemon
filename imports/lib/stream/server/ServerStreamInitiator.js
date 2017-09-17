import ServerStreamFactory from '/imports/lib/stream/server/ServerStreamFactory.js';
import StreamConfiguration from '/imports/lib/stream/StreamConfiguration.js';

/** @type {Stream} */
export const ServerStreamInitiator = ServerStreamFactory.fromConfiguration(StreamConfiguration.alias());

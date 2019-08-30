import ServerStreamFactory from '/imports/lib/stream/server/ServerStreamFactory';
import StreamConfiguration from '/imports/lib/stream/StreamConfiguration';

/** @type {Stream} */
export const ServerStreamInitiator = ServerStreamFactory.fromConfiguration(StreamConfiguration.alias());

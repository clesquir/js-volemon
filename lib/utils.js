getUTCNow = function() {
	var now = new Date();

	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
};

getUTCTimeStamp = function() {
	return getUTCNow().getTime();
};
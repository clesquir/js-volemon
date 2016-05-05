Meteor.setInterval(function() {
	Meteor.call('removeTimeoutPlayersAndGames');
}, Config.keepAliveElapsedForTimeOut);

Accounts.onCreateUser((options, user) => {
	user._id = Random.id();

	//Validate presence of name
	if (options.profile === undefined || options.profile.name === undefined) {
		throw new Error('Must set options.profile.name');
	}
	
	user.profile = options.profile;

	Meteor.call('createProfile', user);

	return user;
});

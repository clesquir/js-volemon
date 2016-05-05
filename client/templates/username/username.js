Template.username.helpers({
	value: function() {
		var user = Meteor.user();

		return user ? user.profile.name : null;
	}
});

Template.username.events({
	'submit form[name=username]': function(e) {
		e.preventDefault();

		var name = $(e.target).find('[name=name]').val(),
			user = Meteor.user();

		if (name && user) {
			Meteor.call('updateUserName', name);
			Session.set('lightbox', null);
		}
	}
});

Template.username.rendered = function() {
	this.find('[name=name]').focus();
};

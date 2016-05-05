Template.app.events({
	'click [data-action]': function(e) {
		e.preventDefault();
	},

	'click [readonly]': function(e) {
		$(e.target).select();
	},

	'click': function(e) {
		var dropdownList = document.getElementById('username-dialog-dropdown-list'),
			menuOpen = $(e.target).parents('.username-header-menu-open');

		if (dropdownList && !$(e.target).is('#username-header-menu-open') && !menuOpen.length) {
			$(dropdownList).hide();
		}
	},

	'click [data-action=user-log-in]': function() {
		Session.set('lightbox', 'login');
	},

	'click #username-header-menu-open': function() {
		var dropdownList = document.getElementById('username-dialog-dropdown-list');

		if ($(dropdownList).is(":visible")) {
			$(dropdownList).hide();
		} else {
			$(dropdownList).show();
		}
	},

	'click [data-action=user-edit-name]': function(e) {
		Session.set('lightbox', 'username');
	},

	'click [data-action=user-logout]': function() {
		Meteor.logout(function() {});
	},

	'click [data-action=create-game]': function(e) {
		actionAfterLoginCreateUser = function() {
			Meteor.call('createGame', function(error, id) {
				if (error) {
					return alert(error);
				}

				Router.go('game', {_id: id});
			});
		};

		if (!Meteor.userId()) {
			return Session.set('lightbox', 'login');
		}

		actionAfterLoginCreateUser();
		actionAfterLoginCreateUser = null;
	}
});

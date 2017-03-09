Template.loading.helpers({
	visible: function(loadingMask) {
		return Session.get(loadingMask);
	}
});

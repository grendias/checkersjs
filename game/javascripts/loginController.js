"use strict";
angular.module('app').controller('LoginCtrl', function ($timeout, AuthFactory, $location) {
	const log = this;
	log.heading = "login";
	log.login = function () {
		AuthFactory.login(log.user.email, log.user.password);
		$timeout();
	};
	log.register = function () {
		AuthFactory.register(log.user.email, log.user.password);
		$timeout();
	};

	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			firebase.database().ref(`/users/${user.uid}`).set({
				email: user.email,
				name: user.displayName
			});
			$location.path(`/dashboard/${user.uid}`);
			$timeout();
		} else {
			$location.path('/');
			$timeout();
		}
	});

});

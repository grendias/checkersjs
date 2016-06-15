"use strict";
angular.module('app', [])
	.config(() => {
		var config = {
			apiKey: "AIzaSyBrbaIJrMqiL1Ho_rM35FgieqOyAjF-BiE",
			authDomain: "checkers-f4624.firebaseapp.com",
			databaseURL: "https://checkers-f4624.firebaseio.com",
			storageBucket: "checkers-f4624.appspot.com"
		};
		firebase.initializeApp(config);
	});



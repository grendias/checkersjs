"use strict";
app.config(($routeProvider) => ($routeProvider
	.when('/', {
		controller: 'LoginCtrl',
		controllerAs: 'log',
		templateUrl: 'javascripts/login.html'
	})
	.when('/dashboard/:uid', {
		controller: 'DashboardCtrl',
		controllerAs: 'dash',
		templateUrl: 'javascripts/dashboard.html'
	})
	.when('/checkers/:gameid', {
		controller: 'GameCtrl',
		controllerAs: 'game',
		templateUrl: 'javascripts/game.html'
	})
));

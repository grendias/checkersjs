"use strict";
angular.module('app', ['ngRoute', 'ngCookies'])
	.factory('BoardFact', () => {
		const row = 8;
		var squares = [];
		var index = 0;
		for (let x=0; x<row; x++) {
			for(let y=0; y<row; y++) {
				squares.push({
					'index': index,
					'x': x,
					'y': y
				});
				index ++;
			}
		}
		return {
			squares () {
				return squares;
			}
		};
	})
	.config(() => {
		var config = {
			apiKey: "AIzaSyBrbaIJrMqiL1Ho_rM35FgieqOyAjF-BiE",
			authDomain: "checkers-f4624.firebaseapp.com",
			databaseURL: "https://checkers-f4624.firebaseio.com",
			storageBucket: "checkers-f4624.appspot.com"
		};
		firebase.initializeApp(config);
	})
	.factory('AuthFactory', ($location, $timeout, $cookies) => {
		firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			firebase.database().ref(`/users/${user.uid}`).set({
				email: user.email,
			});
			$cookies.put('userid', user.uid);
			$cookies.put('email', user.email);
			$location.path(`/dashboard/${user.uid}`);
			$timeout();
		} else {
			$location.path('/');
			$timeout();
		}
	});
		return {
			login (email, password) {
				firebase.auth().signInWithEmailAndPassword(email, password);
			},
			logout () {
				firebase.auth().signOut();
			},
			register (email, password) {
				firebase.auth().createUserWithEmailAndPassword(email, password);
			}
		};
	})
	.factory('UsersFact', () => {
		const currentUser = firebase.auth().currentUser;
		return {
			user: currentUser
		};
	});

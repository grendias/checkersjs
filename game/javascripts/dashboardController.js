"use strict";
angular.module('app').controller('DashboardCtrl', function ($timeout, AuthFactory, $location, $routeParams) {
	const dash = this;
	var uid = $routeParams.uid;
	var userEmail;
	dash.heading = 'Dashboard';
	firebase.database().ref('games/').on('value', (snap) => {
		dash.games = snap.val();
		$timeout();
	});
	firebase.database().ref('users/').once('value').then(function(snap) {
		for(let key in snap.val()) {
			if (key === uid) {
				userEmail = snap.val()[key].email;
			}
		}
	});

	dash.newGame = () => {
		firebase.database().ref('games/').push({
			player1: uid,
			player1Email: userEmail,
			test: 'testgame',
			turn: uid,
			player1Death: 0,
			player2Death: 0
		});
		for (let key in dash.games) {
			if (dash.games[key].player1 === uid) {
				var pieceCount = 8;
				for(let i=0; i<pieceCount; i++) {
					let y = Math.floor(i / 4);
					let x = (i % 4) * 2 + (1 - y%2);
					firebase.database().ref(`/${key}/`).push({
						'gameId': key,
						'userid': uid,
						'color': 'red',
						'top':  (y * 70)+'px',
						'left': (x * 70)+'px',
						'x': x,
						'y': y,
						'king': false,
						'player1': true
					});
				}
				$location.path(`/checkers/${key}`);
			}
		}

	};

	dash.joinGame = (gameId) => {
		firebase.database().ref(`games/${gameId}`).update({
			player2: uid,
			player2Email: userEmail
		});
		var pieceCount = 8;
		for(let i=0; i<pieceCount; i++) {
			let y = Math.floor(i/4) + 6;
			let x = (i % 4) * 2 + (1-y%2);
			firebase.database().ref(`/${gameId}/`).push({
				'gameId': gameId,
				'userid': uid,
				'color': 'white',
				'top':  (y * 70)+'px',
				'left': (x * 70)+'px',
				'x': x,
				'y': y,
				'king': false,
				'player1': false
			});
		}
		$location.path(`checkers/${gameId}`);
	};

	dash.logOut = () => {
		firebase.auth().signOut();
	};
});

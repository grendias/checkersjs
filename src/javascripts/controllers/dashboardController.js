"use strict";
app.controller('DashboardCtrl', function ($timeout, AuthFactory, $location, $routeParams) {
	const dash = this;
	var uid = $routeParams.uid;
	var userEmail;
	dash.heading = 'Dashboard';
	firebase.database().ref('games/').on('value', (snap) => {
		dash.games = snap.val();
		$timeout();
	});

	//gets user email
	firebase.database().ref('users/').once('value').then(function (snap) {
		for (let key in snap.val()) {
			if (key === uid) {
				let fullEmail = snap.val()[key].email;
				let index = fullEmail.indexOf('@');
				userEmail = fullEmail.slice(0, index);
			}
		}
	});

	//when a player clicks 'create new game' they are added to the game as player 1
	dash.newGame = () => {
		firebase.database().ref('games/').push({
			player1: uid,
			player1Email: userEmail,
			test: 'testgame',
			turn: uid,
			player1Death: 0,
			player2Death: 0
		});
		//creates player 1 pieces
		for (let key in dash.games) {
			if (dash.games[key].player1 === uid) {
				var pieceCount = 8;
				for (let i = 0; i < pieceCount; i++) {
					let y = Math.floor(i / 4);
					let x = (i % 4) * 2 + (1 - y % 2);
					firebase.database().ref(`/${key}/`).push({
						'gameId': key,
						'userid': uid,
						'color': 'red',
						'top': (y * 70) + 'px',
						'left': (x * 70) + 'px',
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

	//when a player clicks 'Join Game' they are added to the game as player 2
	dash.joinGame = (gameId) => {
		firebase.database().ref(`games/${gameId}`).update({
			player2: uid,
			player2Email: userEmail
		});
		var pieceCount = 8;
		//creates player 2 pieces
		for (let i = 0; i < pieceCount; i++) {
			let y = Math.floor(i / 4) + 6;
			let x = (i % 4) * 2 + (1 - y % 2);
			firebase.database().ref(`/${gameId}/`).push({
				'gameId': gameId,
				'userid': uid,
				'color': 'white',
				'top': (y * 70) + 'px',
				'left': (x * 70) + 'px',
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

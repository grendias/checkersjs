"use strict";
app.controller('DashboardCtrl', function ($timeout, AuthFactory, $location, $routeParams, HelperFact) {
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
			turn: uid,
			player1Death: 0,
			player2Death: 0
		}).then((game) => {
			console.log("game", game.key);
			HelperFact.createPlayer1(game.key, uid);
			$location.path(`checkers/${game.key}`);
			$timeout();
		});

	};

	//when a player clicks 'Join Game' they are added to the game as player 2
	dash.joinGame = (gameId) => {
		firebase.database().ref(`games/${gameId}`).update({
			player2: uid,
			player2Email: userEmail
		});
		HelperFact.createPlayer2(gameId, uid);
		$location.path(`checkers/${gameId}`);
	};

	dash.logOut = () => {
		firebase.auth().signOut();
	};
});

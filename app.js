angular.module('app', [])
	.factory('BoardFact', ($timeout) => {
		var config = {
			apiKey: "AIzaSyBrbaIJrMqiL1Ho_rM35FgieqOyAjF-BiE",
			authDomain: "checkers-f4624.firebaseapp.com",
			databaseURL: "https://checkers-f4624.firebaseio.com",
			storageBucket: "checkers-f4624.appspot.com",
		};
		firebase.initializeApp(config);
		const row = 8;
		var pieceCount = row*2;
		var pieces = [];
		var squares;
		// firebase.database().ref('board/').on('value', (snap) => {
		// 	squares = snap.val();
		// 	$timeout();
		// })
		// for(var i=0; i<pieceCount; i++) {
		// 	if (i < pieceCount/2) {

		// 		// player 1
		// 		var y = Math.floor(i / 4);
		// 		var x = (i % 4) * 2 + (1 - y%2);
		// 		firebase.database().ref('pieces/').push({
		// 			'color': 'red',
		// 			'top':  (y * 70)+'px',
		// 			'left': (x * 70)+'px',
		// 			'x': x,
		// 			'y': y
		// 		});
		// 	}	else {
		// 		// player 2
		// 		var y = Math.floor(i/4) + 4;
		// 		var x = (i % 4) * 2 + (1-y%2)
		// 		firebase.database().ref('pieces/').push({
		// 			'color': 'white',
		// 			'top':  (y * 70)+'px',
		// 			'left': (x * 70)+'px',
		// 			'x': x,
		// 			'y': y
		// 		});
		// 	}
		// }
		return {
			squares () {
				console.log(squares);
				return squares;
			},
			pieces () {
				return pieces;
			}
		}
	})

	.controller('GameCtrl', function (BoardFact, $timeout) {
		const game = this;
		game.heading = "Checkers";
		firebase.database().ref('board/').on('value', (snap) => {
			game.board = snap.val();
			$timeout();
		})
		firebase.database().ref('pieces/').on('value', (snap) => {
			game.pieces = snap.val();
			$timeout();
		})
		// game.board = BoardFact.squares();
		// game.pieces = BoardFact.pieces();
		game.chckBrd = (x, y) => {
			var oddX = x % 2;
			var oddY = y % 2;
			return (oddX ^ oddY);
		}
		game.choosePiece = (x,y) => {

		}

	})



























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
				return squares;
			},
			pieces () {
				return pieces;
			}
		}
	})

	.controller('GameCtrl', function (BoardFact, $timeout, $animate) {
		const game = this;
		var currentPiece;
		var choice1;
		var choice2;
		game.heading = "Checkers";
		firebase.database().ref('board/').once('value').then((snap) => {
			game.board = snap.val();
			$timeout();
		})
		firebase.database().ref('pieces/').on('value', (snap) => {
			game.pieces = snap.val();
			$timeout();
		})
		game.chckBrd = (x, y) => {
			var oddX = x % 2;
			var oddY = y % 2;
			return (oddX ^ oddY);
		}

		function removeSelected () {
			currentPiece = null;
			choice1 = null;
			choice2 = null;
			$('.selected').removeClass('selected');
		}


		game.choosePiece = (e, piece, id) => {
			var currentElement = e.currentTarget;
			var currentSquare;
			var possibleSquare;
			currentPiece = piece;
			currentPiece.id = id;
			$(currentElement).addClass('selected');
			if(piece.color === 'red') {

				function Move1 (x,y, index) {
					this.index = index + 7;
					this.x = x + 1;
					this.y = y + 1;
				}
				function Move2 (x,y, index) {
					this.index = index + 9;
					this.x = x - 1;
					this.y = y + 1;
				}

				for (var key in game.board) {
					if(piece.x === game.board[key].y && piece.y === game.board[key].x) {
						currentSquare = game.board[key];
						var move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
						var move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
					}
				}
				for (var key in game.board) {
					if (move1.index === game.board[key].index) { //&& is empty
						$(`#${key}`).addClass('selected');
						choice1 = game.board[key];
					} else if (move2.index === game.board[key].index) { //&& is empty
						$(`#${key}`).addClass('selected');
						choice2 = game.board[key];
					}
				}


			} else {
				console.log('white')
			}

		}
		game.chooseSquare = (square) => {
			if(square === choice1 || square === choice2) {
				console.log(currentPiece);
				var newTop = (square.x * 70) + 'px';
				var newLeft = (square.y * 70) + 'px';
				firebase.database().ref(`/pieces/${currentPiece.id}`).update({
					top: newTop,
					left: newLeft,
					y: square.x,
					x: square.y
				});
				removeSelected();

			}
		}

		game.reset = () => {
			firebase.database().ref('/pieces/').remove();
			var pieceCount = 16;
			for(var i=0; i<pieceCount; i++) {
				if (i < pieceCount/2) {
					// player 1
					var y = Math.floor(i / 4);
					var x = (i % 4) * 2 + (1 - y%2);
					firebase.database().ref('/pieces/').push({
						'color': 'red',
						'top':  (y * 70)+'px',
						'left': (x * 70)+'px',
						'x': x,
						'y': y
					});
				}	else {
					// player 2
					var y = Math.floor(i/4) + 4;
					var x = (i % 4) * 2 + (1-y%2);
					firebase.database().ref('pieces/').push({
						'color': 'white',
						'top':  (y * 70)+'px',
						'left': (x * 70)+'px',
						'x': x,
						'y': y
					});
				}
			}
			removeSelected();
		}
	})



























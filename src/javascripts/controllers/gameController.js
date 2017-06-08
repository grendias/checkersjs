"use strict";
app.controller('GameCtrl', function (
	$timeout, BoardFact, $routeParams, $location, UsersFact, $cookies, $window, MoveFact, HelperFact) {
	const game = this;
	const gameId = $routeParams.gameid;
	const userId = $cookies.get('userid');
	const userEmail = $cookies.get('email');

	let player1Moves = MoveFact.player1Moves;
	let player2Moves = MoveFact.player2Moves;
	let currentPiece, choice1, choice2, choice3, choice4,
		jumpChoice1, jumpChoice2, jumpChoice3, jumpChoice4;

	game.heading = "Checkers";
	game.pieces = {};
	game.messages = {};
	game.board = BoardFact.squares();
	game.chckBrd = (x, y) => {
		//function to create checkerboard pattern
		var oddX = x % 2;
		var oddY = y % 2;
		return (oddX ^ oddY);
	};
	let usableSquares = game.board.filter((square) => {
		return game.chckBrd(square.x, square.y);
	});



	game.toggleTurn = () => {
		//determines who's turn it is
		if (game.turn === userId) {
			return true;
		}
	};

	firebase.database().ref(`games/${gameId}/`).on('value', (snap) => {
		game.turn = snap.val().turn;
		game.player1Id = snap.val().player1;
		game.player1Email = snap.val().player1Email;
		game.player2Id = snap.val().player2;
		game.player2Email = snap.val().player2Email;
		game.player1Death = snap.val().player1Death;
		game.player2Death = snap.val().player2Death;
		$timeout();
	});

	firebase.database().ref(`${gameId}/`).on('value', (snap) => {
		game.pieces = snap.val();
		$timeout();
	});

	firebase.database().ref('messages/').on('value', (snap) => {
		for (let key in snap.val()) {
			if (snap.val()[key].gameId === gameId) {
				game.messages[key] = snap.val()[key];
				$timeout();
			}
		}
	});

	if (game.player1Id === userId) {
		game.playerEmail = game.player1Email;
		game.playerColor = 'red';
		game.player = '1';
	} else if (game.player2Id === userId) {
		game.playerEmail = game.player2Email;
		game.playerColor = 'white';
		game.player = '2';
	}

	function removeSelected() {
		//function to reset player moves
		currentPiece = null;
		choice1 = null;
		choice2 = null;
		choice3 = null;
		choice4 = null;
		jumpChoice1 = null;
		jumpChoice2 = null;
		jumpChoice3 = null;
		jumpChoice4 = null;
		$('.selected').removeClass('selected');
	}

	game.chooseKing = (e, piece, id) => {
		//when a player chooses a king piece this function is called
		if (game.turn === piece.userid) {
			$(e.currentTarget).toggleClass('selected');
			currentPiece = piece;
			currentPiece.id = id;
			let currentSquare = HelperFact.getCurrentSquare(usableSquares, piece),
				takenSquares = HelperFact.getTakenSquares(currentPiece, game.pieces),
				move1 = new player1Moves.Move1(currentSquare.x, currentSquare.y, currentSquare.index),
				move2 = new player1Moves.Move2(currentSquare.x, currentSquare.y, currentSquare.index),
				move3 = new player2Moves.Move1(currentSquare.x, currentSquare.y, currentSquare.index),
				move4 = new player2Moves.Move2(currentSquare.x, currentSquare.y, currentSquare.index),
				jumpMove1 = new player1Moves.JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index),
				jumpMove2 = new player1Moves.JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index),
				jumpMove3 = new player2Moves.JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index),
				jumpMove4 = new player2Moves.JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);

			choice1 = HelperFact.getRegularMove({
				board: usableSquares,
				move: move1,
				takenSquares: takenSquares,
			});
			choice2 = HelperFact.getRegularMove({
				board: usableSquares,
				takenSquares: takenSquares,
				move: move2
			});
			choice3 = HelperFact.getRegularMove({
				board: usableSquares,
				move: move3,
				takenSquares: takenSquares,
			});
			choice4 = HelperFact.getRegularMove({
				board: usableSquares,
				takenSquares: takenSquares,
				move: move4
			});
			jumpChoice1 = HelperFact.getKingJumpMove({
				board: usableSquares,
				takenSquares: takenSquares,
				move: move1,
				jumpMove: jumpMove1,
				player: game.playerColor
			});
			jumpChoice2 = HelperFact.getKingJumpMove({
				board: usableSquares,
				takenSquares: takenSquares,
				move: move2,
				jumpMove: jumpMove2,
				player: game.playerColor
			});
			jumpChoice3 = HelperFact.getKingJumpMove({
				board: usableSquares,
				takenSquares: takenSquares,
				move: move3,
				jumpMove: jumpMove3,
				player: game.playerColor
			});
			jumpChoice4 = HelperFact.getKingJumpMove({
				board: usableSquares,
				takenSquares: takenSquares,
				move: move4,
				jumpMove: jumpMove4,
				player: game.playerColor
			});
		}
	};

	game.choosePiecePlayer1 = (e, piece, id) => {
		//when player 1 chooses a piece this function is called
		if (game.turn === piece.userid) {
			$(e.currentTarget).toggleClass('selected');
			currentPiece = piece;
			currentPiece.id = id;
			let currentSquare = HelperFact.getCurrentSquare(usableSquares, piece),
				takenSquares = HelperFact.getTakenSquares(currentPiece, game.pieces),
				move1 = new player1Moves.Move1(currentSquare.x, currentSquare.y, currentSquare.index),
				move2 = new player1Moves.Move2(currentSquare.x, currentSquare.y, currentSquare.index),
				jumpMove1 = new player1Moves.JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index),
				jumpMove2 = new player1Moves.JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);

			choice1 = HelperFact.getRegularMove({
				board: usableSquares,
				move: move1,
				takenSquares: takenSquares,
			});
			choice2 = HelperFact.getRegularMove({
				board: usableSquares,
				takenSquares: takenSquares,
				move: move2
			});
			jumpChoice1 = HelperFact.getJumpMove({
				board: usableSquares,
				jumpMove: jumpMove1,
				move: move1,
				takenSquares: takenSquares,
				oppositePlayer: 'white'
			});
			jumpChoice2 = HelperFact.getJumpMove({
				board: usableSquares,
				jumpMove: jumpMove2,
				move: move2,
				takenSquares: takenSquares,
				oppositePlayer: 'white'
			});
		}
	};

	game.choosePiecePlayer2 = (e, piece, id) => {
		//same function as choosePiecePlayer1 except math for moves and jump criteria are different
		if (game.turn === piece.userid) {
			$(e.currentTarget).toggleClass('selected');
			currentPiece = piece;
			currentPiece.id = id;
			let currentSquare = HelperFact.getCurrentSquare(usableSquares, piece),
				takenSquares = HelperFact.getTakenSquares(currentPiece, game.pieces),
				move1 = new player2Moves.Move1(currentSquare.x, currentSquare.y, currentSquare.index),
				move2 = new player2Moves.Move2(currentSquare.x, currentSquare.y, currentSquare.index),
				jumpMove1 = new player2Moves.JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index),
				jumpMove2 = new player2Moves.JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);

			choice1 = HelperFact.getRegularMove({
				board: usableSquares,
				move: move1,
				takenSquares: takenSquares,
			});
			choice2 = HelperFact.getRegularMove({
				board: usableSquares,
				takenSquares: takenSquares,
				move: move2
			});
			jumpChoice3 = HelperFact.getJumpMove({
				board: usableSquares,
				jumpMove: jumpMove1,
				move: move1,
				takenSquares: takenSquares,
				oppositePlayer: 'red'
			});
			jumpChoice4 = HelperFact.getJumpMove({
				board: usableSquares,
				jumpMove: jumpMove2,
				move: move2,
				takenSquares: takenSquares,
				oppositePlayer: 'red'
			});
		}
	};

	game.chooseSquare = (square) => {
		//if the square they choose matches any of the possible moves the player has
		if (square === choice1 || square === choice2 || square === choice3 || square === choice4 || square === jumpChoice1 || square === jumpChoice2 || square === jumpChoice3 || square === jumpChoice4) {
			let newTop = (square.x * 70) + 'px';
			let newLeft = (square.y * 70) + 'px';
			//updates new coordinates of the game piece
			firebase.database().ref(`/${gameId}/${currentPiece.id}`).update({
				top: newTop,
				left: newLeft,
				y: square.x,
				x: square.y
			});
			$timeout();
			$(`#${currentPiece.id}`).animate({
				top: newTop,
				left: newLeft
			}, "slide");

			HelperFact.getKingPiece({
				currentPiece: currentPiece,
				player: game.playerColor,
				number: 7,
				square: square,
				gameId: gameId
			});
			HelperFact.getKingPiece({
				currentPiece: currentPiece,
				player: game.playerColor,
				number: 0,
				square: square,
				gameId: gameId
			});

			if (square === jumpChoice1) {
				HelperFact.removePiece({
					pieces: game.pieces,
					squareX: jumpChoice1.x - 1,
					squareY: jumpChoice1.y - 1,
					currentPiece: currentPiece,
					gameId: gameId,
					player1: game.player1Death,
					player2: game.player2Death
				});
			} else if (square === jumpChoice2) {
				HelperFact.removePiece({
					pieces: game.pieces,
					squareX: jumpChoice2.x - 1,
					squareY: jumpChoice2.y + 1,
					currentPiece: currentPiece,
					gameId: gameId,
					player1: game.player1Death,
					player2: game.player2Death
				});
			} else if (square === jumpChoice3) {
				HelperFact.removePiece({
					pieces: game.pieces,
					squareX: jumpChoice3.x + 1,
					squareY: jumpChoice3.y + 1,
					currentPiece: currentPiece,
					gameId: gameId,
					player1: game.player1Death,
					player2: game.player2Death
				});
			} else if (square === jumpChoice4) {
				HelperFact.removePiece({
					pieces: game.pieces,
					squareX: jumpChoice4.x + 1,
					squareY: jumpChoice4.y - 1,
					currentPiece: currentPiece,
					gameId: gameId,
					player1: game.player1Death,
					player2: game.player2Death
				});
			}

			if (game.turn === game.player1Id) {
				firebase.database().ref(`games/${gameId}/`).update({
					turn: game.player2Id
				});
			} else if (game.turn === game.player2Id) {
				firebase.database().ref(`games/${gameId}/`).update({
					turn: game.player1Id
				});
			}
			removeSelected();
		}
	};

	game.reset = () => {
		//function to play again
		firebase.database().ref(`/${gameId}/`).remove();
		HelperFact.createPlayer1(gameId, game.player1Id);
		HelperFact.createPlayer2(gameId, game.player2Id);
		firebase.database().ref(`games/${gameId}/`).update({
			player1Death: 0,
			player2Death: 0
		});
		removeSelected();
	};

	game.leaveGame = () => {
		firebase.database().ref(`games/${gameId}`).remove();
		for (let key in game.pieces) {
			if (game.pieces[key].userid === firebase.auth().currentUser.uid) {
				firebase.database().ref(`/${gameId}/${key}`).remove();
			}
		}
		$location.path(`/dashboard/${userId}`);
	};

	game.logOut = () => {
		firebase.auth().signOut();
	};

	game.submitMessage = () => {
		firebase.database().ref('messages/').push({
			'gameId': gameId,
			'userEmail': userEmail,
			'userMessage': game.message
		});
		game.message = '';
	};
});

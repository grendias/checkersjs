"use strict";
angular.module('app')
	.controller('GameCtrl', function (
		$timeout, BoardFact, $routeParams, $location, UsersFact, $cookies, $window, MoveFact) {
		const game = this;

		$window.onbeforeunload = function (e) {
			e = e || $window.event;
			console.log(e);
			e.preventDefault = true;
			e.cancelBubble = true;
			e.returnValue = 'reload';
		};

		const gameId = $routeParams.gameid;
		var userId = $cookies.get('userid');
		var userEmail = $cookies.get('email');
		var currentPiece, choice1, choice2, choice3, choice4, jumpChoice1, jumpChoice2, jumpChoice3, jumpChoice4;
		game.heading = "Checkers";
		game.pieces = {};
		game.messages = {};
		game.board = BoardFact.squares();

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

		//function to create checkerboard pattern
		game.chckBrd = (x, y) => {
			var oddX = x % 2;
			var oddY = y % 2;
			return (oddX ^ oddY);
		};

		//function to reset player moves
		function removeSelected() {
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

		//determines who's turn it is
		game.toggleTurn = () => {
			if (game.turn === userId) {
				return true;
			}
		};

		//when a player chooses a king piece this function is called
		game.chooseKing = (e, piece, id) => {
			//functions for the possible moves a king could make
			function Move1(x, y, index) {
				this.index = index + 9;
				this.x = x + 1;
				this.y = y + 1;
			}

			function Move2(x, y, index) {
				this.index = index + 7;
				this.x = x + 1;
				this.y = y - 1;
			}

			function JumpMove2(x, y, index) {
				this.index = index + 14;
				this.x = x + 2;
				this.y = y - 2;
			}

			function JumpMove1(x, y, index) {
				this.index = index + 18;
				this.x = x + 2;
				this.y = y + 2;
			}

			function Move3(x, y, index) {
				this.index = index - 9;
				this.x = x - 1;
				this.y = y - 1;
			}

			function Move4(x, y, index) {
				this.index = index - 7;
				this.x = x - 1;
				this.y = y + 1;
			}

			function JumpMove3(x, y, index) {
				this.index = index - 18;
				this.x = x - 2;
				this.y = y - 2;
			}

			function JumpMove4(x, y, index) {
				this.index = index - 14;
				this.x = x - 2;
				this.y = y + 2;
			}

			if (game.turn === piece.userid) {
				var currentElement = e.currentTarget;
				var currentSquare;
				currentPiece = piece;
				currentPiece.id = id;
				$(currentElement).toggleClass('selected');
				var takenSquares = [];
				var move1;
				var move2;
				var move3;
				var move4;
				//finds where the other pieces are
				for (let id in game.pieces) {
					if (game.pieces[id].x === piece.x && game.pieces[id].y === piece.y) {} else {
						takenSquares.push({
							x: game.pieces[id].x,
							y: game.pieces[id].y,
							player: game.pieces[id].color
						});
					}
				}
				//finds which board square the piece is in
				for (let key in game.board) {
					if (piece.x === game.board[key].y && piece.y === game.board[key].x) {
						currentSquare = game.board[key];
					}
				}
				//looks for possible non-jump moves
				for (let key in game.board) {
					move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
					move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
					move3 = new Move3(currentSquare.x, currentSquare.y, currentSquare.index);
					move4 = new Move4(currentSquare.x, currentSquare.y, currentSquare.index);
					//checks to see if possible move is empty
					if (move1.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {} else {
								choice1 = game.board[key];
							}
						}
					} else if (move2.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {} else {
								choice2 = game.board[key];
							}
						}
					} else if (move3.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move3.x === takenSquares[i].y && move3.y === takenSquares[i].x) {} else {
								choice3 = game.board[key];
							}
						}
					} else if (move4.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move4.x === takenSquares[i].y && move4.y === takenSquares[i].x) {} else {
								choice4 = game.board[key];
							}
						}
					}
				}
				//checks for possible jump moves
				for (let key in game.board) {
					var jumpMove1 = new JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index);
					var jumpMove2 = new JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);
					var jumpMove3 = new JumpMove3(currentSquare.x, currentSquare.y, currentSquare.index);
					var jumpMove4 = new JumpMove4(currentSquare.x, currentSquare.y, currentSquare.index);
					// checks to see if a jump move is possible
					if (jumpMove1.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {
								if (takenSquares[i].player === 'white' && piece.color === 'red') {
									if (jumpMove1.x === takenSquares[i].y && jumpMove1.y === takenSquares[i].y) {} else {
										jumpChoice1 = game.board[key];
									}
								} else if (takenSquares[i].player === 'red' && piece.color === 'white') {
									if (jumpMove1.x === takenSquares[i].y && jumpMove1.y === takenSquares[i].y) {} else {
										jumpChoice1 = game.board[key];
									}
								}
							}
						}
					} else if (jumpMove2.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {
								if (takenSquares[i].player === 'white' && piece.color === 'red') {
									if (jumpMove2.x === takenSquares[i].y && jumpMove2.y === takenSquares[i].y) {} else {
										jumpChoice2 = game.board[key];
									}
								} else if (takenSquares[i].player === 'red' && piece.color === 'white') {
									if (jumpMove2.x === takenSquares[i].y && jumpMove2.y === takenSquares[i].y) {} else {
										jumpChoice2 = game.board[key];
									}
								}
							}
						}
					} else if (jumpMove3.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move3.x === takenSquares[i].y && move3.y === takenSquares[i].x) {
								if (takenSquares[i].player === 'white' && piece.color === 'red') {
									if (jumpMove3.x === takenSquares[i].y && jumpMove3.y === takenSquares[i].y) {} else {
										jumpChoice3 = game.board[key];
									}
								} else if (takenSquares[i].player === 'red' && piece.color === 'white') {
									if (jumpMove3.x === takenSquares[i].y && jumpMove3.y === takenSquares[i].y) {} else {
										jumpChoice3 = game.board[key];
									}
								}
							}
						}
					} else if (jumpMove4.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move4.x === takenSquares[i].y && move4.y === takenSquares[i].x) {
								if (takenSquares[i].player === 'white' && piece.color === 'red') {
									if (jumpMove4.x === takenSquares[i].y && jumpMove4.y === takenSquares[i].y) {} else {
										jumpChoice4 = game.board[key];
									}
								} else if (takenSquares[i].player === 'red' && piece.color === 'white') {
									if (jumpMove4.x === takenSquares[i].y && jumpMove4.y === takenSquares[i].y) {} else {
										jumpChoice4 = game.board[key];
									}
								}
							}
						}
					}
				}
			}
		};

		//when player 1 chooses a piece this function is called
		game.choosePiecePlayer1 = (e, piece, id) => {
			function Move1(x, y, index) {
				this.index = index + 9;
				this.x = x + 1;
				this.y = y + 1;
			}

			function Move2(x, y, index) {
				this.index = index + 7;
				this.x = x + 1;
				this.y = y - 1;
			}

			function JumpMove2(x, y, index) {
				this.index = index + 14;
				this.x = x + 2;
				this.y = y - 2;
			}

			function JumpMove1(x, y, index) {
				this.index = index + 18;
				this.x = x + 2;
				this.y = y + 2;
			}
			if (game.turn === piece.userid) {
				var currentElement = e.currentTarget;
				var currentSquare;
				currentPiece = piece;
				currentPiece.id = id;
				$(currentElement).toggleClass('selected');
				var takenSquares = [];
				var move1, move2;
				//finds the position of all the pieces
				for (let id in game.pieces) {
					if (game.pieces[id].x === piece.x && game.pieces[id].y === piece.y) {} else {
						takenSquares.push({
							x: game.pieces[id].x,
							y: game.pieces[id].y,
							player: game.pieces[id].color
						});
					}
				}
				//finds the position of the current piece
				for (let key in game.board) {
					if (piece.x === game.board[key].y && piece.y === game.board[key].x) {
						currentSquare = game.board[key];
					}
				}
				//looks for non-jump moves to see if they are empty
				for (let key in game.board) {
					move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
					move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
					if (move1.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {} else {
								choice1 = game.board[key];
							}
						}
					} else if (move2.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {} else {
								choice2 = game.board[key];
							}
						}
					}
				}
				//checks for jump moves over white pieces and checks if they are empty
				for (let key in game.board) {
					var jumpMove1 = new JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index);
					var jumpMove2 = new JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);
					if (jumpMove1.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {
								if (takenSquares[i].player === 'white') {
									if (jumpMove1.x === takenSquares[i].y && jumpMove1.y === takenSquares[i].y) {} else {
										jumpChoice1 = game.board[key];
									}
								}
							}
						}
					} else if (jumpMove2.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {
								if (takenSquares[i].player === 'white') {
									// console.log(jumpMove2);
									if (jumpMove2.x === takenSquares[i].y && jumpMove2.y === takenSquares[i].y) {} else {
										jumpChoice2 = game.board[key];
									}
								}
							}
						}
					}
				}
			}
		};

		//same function as choosePiecePlayer1 except math for moves and jump criteria are different
		game.choosePiecePlayer2 = (e, piece, id) => {
			function Move1(x, y, index) {
				this.index = index - 9;
				this.x = x - 1;
				this.y = y - 1;
			}

			function Move2(x, y, index) {
				this.index = index - 7;
				this.x = x - 1;
				this.y = y + 1;
			}

			function JumpMove1(x, y, index) {
				this.index = index - 18;
				this.x = x - 2;
				this.y = y - 2;
			}

			function JumpMove2(x, y, index) {
				this.index = index - 14;
				this.x = x - 2;
				this.y = y + 2;
			}
			if (game.turn === piece.userid) {
				var currentElement = e.currentTarget;
				var currentSquare;
				currentPiece = piece;
				currentPiece.id = id;
				$(currentElement).toggleClass('selected');
				var takenSquares = [];
				var move1;
				var move2;
				for (let id in game.pieces) {
					if (game.pieces[id].x === piece.x && game.pieces[id].y === piece.y) {} else {
						takenSquares.push({
							x: game.pieces[id].x,
							y: game.pieces[id].y,
							player: game.pieces[id].color
						});
					}
				}

				for (let key in game.board) {
					if (piece.x === game.board[key].y && piece.y === game.board[key].x) {
						currentSquare = game.board[key];
					}
				}
				for (let key in game.board) {
					move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
					move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
					if (move1.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {} else {
								choice1 = game.board[key];
							}
						}
					} else if (move2.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {} else {
								choice2 = game.board[key];
							}
						}
					}
				}
				for (let key in game.board) {
					var jumpMove1 = new JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index);
					var jumpMove2 = new JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);
					if (jumpMove1.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {
								if (takenSquares[i].player === 'red') {
									if (jumpMove1.x === takenSquares[i].y && jumpMove1.y === takenSquares[i].y) {} else {
										jumpChoice3 = game.board[key];
									}
								}
							}
						}
					} else if (jumpMove2.index === game.board[key].index) {
						for (let i = 0; i < takenSquares.length; i++) {
							if (move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {
								if (takenSquares[i].player === 'red') {
									if (jumpMove2.x === takenSquares[i].y && jumpMove2.y === takenSquares[i].y) {} else {
										jumpChoice4 = game.board[key];
									}
								}
							}
						}
					}
				}
			}
		};

		//when a player chooses a legal move
		game.chooseSquare = (square) => {
			//if the square they choose matches any of the possible moves the player has
			if (square === choice1 || square === choice2 || square === choice3 || square === choice4 || square === jumpChoice1 || square === jumpChoice2 || square === jumpChoice3 || square === jumpChoice4) {
				var newTop = (square.x * 70) + 'px';
				var newLeft = (square.y * 70) + 'px';
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

				//checks to see if a piece will be kinged
				if (currentPiece.color === 'red' && square.x === 7) {
					firebase.database().ref(`/${gameId}/${currentPiece.id}`).update({
						king: true
					});
					$timeout();
				}
				if (currentPiece.color === 'white' && square.x === 0) {
					firebase.database().ref(`/${gameId}/${currentPiece.id}`).update({
						king: true
					});
					$timeout();
				}
				//if player makes a jump move: the jumped pieced is removed and player death is updated
				if (square === jumpChoice1) {
					let jumpSquareX = jumpChoice1.x - 1;
					let jumpSquareY = jumpChoice1.y - 1;
					for (let key in game.pieces) {
						if (game.pieces[key].y === jumpSquareX && game.pieces[key].x === jumpSquareY) {
							firebase.database().ref(`/${gameId}/${key}`).remove();
							$timeout();
							if (currentPiece.color === 'red') {
								firebase.database().ref(`games/${gameId}/`).update({
									player2Death: game.player2Death + 1
								});
							} else {
								firebase.database().ref(`games/${gameId}/`).update({
									player1Death: game.player1Death + 1
								});
							}
						}
					}
				} else if (square === jumpChoice2) {
					let jumpSquareX = jumpChoice2.x - 1;
					let jumpSquareY = jumpChoice2.y + 1;
					for (let key in game.pieces) {
						if (game.pieces[key].y === jumpSquareX && game.pieces[key].x === jumpSquareY) {
							firebase.database().ref(`/${gameId}/${key}`).remove();
							$timeout();
							if (currentPiece.color === 'red') {
								firebase.database().ref(`games/${gameId}/`).update({
									player2Death: game.player2Death + 1
								});
							} else {
								firebase.database().ref(`games/${gameId}/`).update({
									player1Death: game.player1Death + 1
								});
							}
						}
					}
				} else if (square === jumpChoice3) {
					let jumpSquareX = jumpChoice3.x + 1;
					let jumpSquareY = jumpChoice3.y + 1;
					for (let key in game.pieces) {
						if (game.pieces[key].y === jumpSquareX && game.pieces[key].x === jumpSquareY) {
							firebase.database().ref(`/${gameId}/${key}`).remove();
							$timeout();
							if (currentPiece.color === 'red') {
								firebase.database().ref(`games/${gameId}/`).update({
									player2Death: game.player2Death + 1
								});
							} else {
								firebase.database().ref(`games/${gameId}/`).update({
									player1Death: game.player1Death + 1
								});
							}
						}
					}
				} else if (square === jumpChoice4) {
					let jumpSquareX = jumpChoice4.x + 1;
					let jumpSquareY = jumpChoice4.y - 1;
					for (let key in game.pieces) {
						if (game.pieces[key].y === jumpSquareX && game.pieces[key].x === jumpSquareY) {
							firebase.database().ref(`/${gameId}/${key}`).remove();
							$timeout();
							if (currentPiece.color === 'red') {
								firebase.database().ref(`games/${gameId}/`).update({
									player2Death: game.player2Death + 1
								});
							} else {
								firebase.database().ref(`games/${gameId}/`).update({
									player1Death: game.player1Death + 1
								});
							}
						}
					}
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

		//function to play again
		game.reset = () => {
			firebase.database().ref(`/${gameId}/`).remove();
			var pieceCount = 16;
			for (let i = 0; i < pieceCount; i++) {
				if (i < pieceCount / 2) {
					// player 1
					let y = Math.floor(i / 4);
					let x = (i % 4) * 2 + (1 - y % 2);
					firebase.database().ref(`/${gameId}/`).push({
						'gameId': gameId,
						'userid': game.player1Id,
						'color': 'red',
						'top': (y * 70) + 'px',
						'left': (x * 70) + 'px',
						'x': x,
						'y': y,
						'king': false,
						'player1': true
					});
				} else {
					// player 2
					let y = Math.floor(i / 4) + 4;
					let x = (i % 4) * 2 + (1 - y % 2);
					firebase.database().ref(`/${gameId}/`).push({
						'gameId': gameId,
						'userid': game.player2Id,
						'color': 'white',
						'top': (y * 70) + 'px',
						'left': (x * 70) + 'px',
						'x': x,
						'y': y,
						'king': false,
						'player1': false
					});
				}
			}
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

"use strict";
angular.module('app')
.controller('GameCtrl', function ($timeout, $animate) {
		const game = this;
		var currentPiece;
		var choice1;
		var choice2;
		var choice3;
		var choice4;
		var jumpChoice1;
		var jumpChoice2;
		var jumpChoice3;
		var jumpChoice4;
		var player1Death = 0;
		var player2Death = 0;
		game.heading = "Checkers";
		firebase.database().ref('board/').once('value').then((snap) => {
			game.board = snap.val();
			$timeout();
		});
		firebase.database().ref('pieces/').on('value', (snap) => {
			game.pieces = snap.val();
			$timeout();
		});
		game.chckBrd = (x, y) => {
			var oddX = x % 2;
			var oddY = y % 2;
			return (oddX ^ oddY);
		};

		function removeSelected () {
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
			for (let id in game.pieces) {
				if (game.pieces[id].x === piece.x && game.pieces[id].y === piece.y) {
				} else {
					takenSquares.push({
						x: game.pieces[id].x,
						y: game.pieces[id].y,
						player: game.pieces[id].color
					});
				}
			}
			function Move1 (x,y, index) {
				this.index = index + 9;
				this.x = x + 1;
				this.y = y + 1;
			}
			function Move2 (x,y, index) {
				this.index = index + 7;
				this.x = x + 1;
				this.y = y - 1;
			}
			function JumpMove2 (x,y,index) {
				this.index = index + 14;
				this.x = x + 2;
				this.y = y - 2;
			}
			function JumpMove1 (x, y, index) {
				this.index = index + 18;
				this.x = x + 2;
				this.y = y + 2;
			}
			function Move3 (x,y, index) {
				this.index = index - 9;
				this.x = x - 1;
				this.y = y - 1;
			}
			function Move4 (x,y, index) {
				this.index = index - 7;
				this.x = x - 1;
				this.y = y + 1;
			}
			function JumpMove3 (x,y,index) {
				this.index = index - 18;
				this.x = x - 2;
				this.y = y - 2;
			}
			function JumpMove4 (x,y,index) {
				this.index = index - 14;
				this.x = x - 2;
				this.y = y + 2;
			}
			for (let key in game.board) {
				if(piece.x === game.board[key].y && piece.y === game.board[key].x) {currentSquare = game.board[key];}
			}
			for (let key in game.board) {
				move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
				move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
				move3 = new Move3(currentSquare.x, currentSquare.y, currentSquare.index);
				move4 = new Move4(currentSquare.x, currentSquare.y, currentSquare.index);
				if (move1.index === game.board[key].index) {
					for (let i = 0; i<takenSquares.length; i++) {
						if(move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {
						} else {
							choice1 = game.board[key];
						}
					}
				} else if (move2.index === game.board[key].index) { //&& is empty
					for (let i = 0; i<takenSquares.length; i++) {
						if(move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {
						} else {
							choice2 = game.board[key];
						}
					}
				} else if (move3.index === game.board[key].index) {
					for (let i = 0; i<takenSquares.length; i++) {
						if (move3.x === takenSquares[i].y && move3.y === takenSquares[i].x) {
						} else {
							choice3 = game.board[key];
						}
					}
				} else if (move4.index === game.board[key].index) {
					for (let i = 0; i<takenSquares.length; i++) {
						if (move4.x === takenSquares[i].y && move4.y === takenSquares[i].x) {
						} else {
							choice4 = game.board[key];
						}
					}
				}
			}
			for (let key in game.board) {
				var jumpMove1 = new JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove2 = new JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove3 = new JumpMove3(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove4 = new JumpMove4(currentSquare.x, currentSquare.y, currentSquare.index);
				if (jumpMove1.index === game.board[key].index) {
					for(let i = 0; i<takenSquares.length; i++) {
						if(move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {
							if(takenSquares[i].player === 'white' && piece.color === 'red') {
								if (jumpMove1.x === takenSquares[i].y && jumpMove1.y === takenSquares[i].y) {
								} else {
									jumpChoice1 = game.board[key];
								}
							} else if (takenSquares[i].player === 'red' && piece.color === 'white') {
								if (jumpMove1.x === takenSquares[i].y && jumpMove1.y === takenSquares[i].y) {
								} else {
									jumpChoice1 = game.board[key];
								}
							}
						}
					}
				} else if (jumpMove2.index === game.board[key].index) {
					for(let i = 0; i<takenSquares.length; i++) {
						if(move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {
							if(takenSquares[i].player === 'white' && piece.color === 'red') {
								if (jumpMove2.x === takenSquares[i].y && jumpMove2.y === takenSquares[i].y) {
								} else {
									jumpChoice2 = game.board[key];
								}
							} else if (takenSquares[i].player === 'red' && piece.color === 'white') {
								if (jumpMove2.x === takenSquares[i].y && jumpMove2.y === takenSquares[i].y) {
								} else {
									jumpChoice2 = game.board[key];
								}
							}
						}
					}
				} else if (jumpMove3.index === game.board[key].index) {
					for(let i = 0; i<takenSquares.length; i++) {
						if(move3.x === takenSquares[i].y && move3.y === takenSquares[i].x) {
							if(takenSquares[i].player === 'white' && piece.color === 'red') {
								if (jumpMove3.x === takenSquares[i].y && jumpMove3.y === takenSquares[i].y) {
								} else {
									jumpChoice3 = game.board[key];
								}
							} else if (takenSquares[i].player === 'red' && piece.color === 'white') {
								if (jumpMove3.x === takenSquares[i].y && jumpMove3.y === takenSquares[i].y) {
								} else {
									jumpChoice3 = game.board[key];
								}
							}
						}
					}
				} else if (jumpMove4.index === game.board[key].index) {
					for(let i = 0; i<takenSquares.length; i++) {
						if(move4.x === takenSquares[i].y && move4.y === takenSquares[i].x) {
							if(takenSquares[i].player === 'white' && piece.color === 'red') {
								if (jumpMove4.x === takenSquares[i].y && jumpMove4.y === takenSquares[i].y) {
								} else {
									jumpChoice4 = game.board[key];
								}
							} else if (takenSquares[i].player === 'red' && piece.color === 'white') {
								if (jumpMove4.x === takenSquares[i].y && jumpMove4.y === takenSquares[i].y) {
								} else {
									jumpChoice4 = game.board[key];
								}
							}
						}
					}
				}
			}
		};
		game.choosePiecePlayer1 = (e, piece, id) => {
			var currentElement = e.currentTarget;
			var currentSquare;
			currentPiece = piece;
			currentPiece.id = id;
			$(currentElement).toggleClass('selected');
			var takenSquares = [];
			var move1;
			var move2;
			for (let id in game.pieces) {
				if (game.pieces[id].x === piece.x && game.pieces[id].y === piece.y) {
				} else {
					takenSquares.push({
						x: game.pieces[id].x,
						y: game.pieces[id].y,
						player: game.pieces[id].color
					});
				}
			}
			function Move1 (x,y, index) {
				this.index = index + 9;
				this.x = x + 1;
				this.y = y + 1;
			}
			function Move2 (x,y, index) {
				this.index = index + 7;
				this.x = x + 1;
				this.y = y - 1;
			}
			function JumpMove2 (x,y,index) {
				this.index = index + 14;
				this.x = x + 2;
				this.y = y - 2;
			}
			function JumpMove1 (x, y, index) {
				this.index = index + 18;
				this.x = x + 2;
				this.y = y + 2;
			}

			for (let key in game.board) {
				if(piece.x === game.board[key].y && piece.y === game.board[key].x) {currentSquare = game.board[key];}
			}
			for (let key in game.board) {
				move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
				move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
				if (move1.index === game.board[key].index) {
					for (let i = 0; i<takenSquares.length; i++) {
						if(move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {
						} else {
							choice1 = game.board[key];
						}
					}
				} else if (move2.index === game.board[key].index) { //&& is empty
					for (let i = 0; i<takenSquares.length; i++) {
						if(move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {
						} else {
							choice2 = game.board[key];
						}
					}
				}
			}
			for (let key in game.board) {
				var jumpMove1 = new JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove2 = new JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);
				if (jumpMove1.index === game.board[key].index) {
					for(let i = 0; i<takenSquares.length; i++) {
						if(move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {
							if(takenSquares[i].player === 'white') {
								if (jumpMove1.x === takenSquares[i].y && jumpMove1.y === takenSquares[i].y) {
								} else {
									jumpChoice1 = game.board[key];
								}
							}
						}
					}
				} else if (jumpMove2.index === game.board[key].index) {
					for(let i = 0; i<takenSquares.length; i++) {
						if(move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {
							if(takenSquares[i].player === 'white') {
								// console.log(jumpMove2);
								if (jumpMove2.x === takenSquares[i].y && jumpMove2.y === takenSquares[i].y) {
								} else {
									jumpChoice2 = game.board[key];
								}
							}
						}
					}
				}
			}
		};


		game.choosePiecePlayer2 = (e, piece, id) => {
			var currentElement = e.currentTarget;
			var currentSquare;
			currentPiece = piece;
			currentPiece.id = id;
			$(currentElement).toggleClass('selected');
			var takenSquares = [];
			var move1;
			var move2;
			for (let id in game.pieces) {
				if (game.pieces[id].x === piece.x && game.pieces[id].y === piece.y) {
				} else {
					takenSquares.push({
						x: game.pieces[id].x,
						y: game.pieces[id].y,
						player: game.pieces[id].color
					});
				}
			}
			function Move1 (x,y, index) {
				this.index = index - 9;
				this.x = x - 1;
				this.y = y - 1;
			}
			function Move2 (x,y, index) {
				this.index = index - 7;
				this.x = x - 1;
				this.y = y + 1;
			}
			function JumpMove1 (x,y,index) {
				this.index = index - 18;
				this.x = x - 2;
				this.y = y - 2;
			}
			function JumpMove2 (x,y,index) {
				this.index = index - 14;
				this.x = x - 2;
				this.y = y + 2;
			}
			for (let key in game.board) {
				if(piece.x === game.board[key].y && piece.y === game.board[key].x) {
					currentSquare = game.board[key];
				}
			}
			for (let key in game.board) {
				move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
				move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
				if (move1.index === game.board[key].index) {
					for (let i = 0; i<takenSquares.length; i++) {
						if(move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {
						} else {
							choice1 = game.board[key];
						}
					}
				} else if (move2.index === game.board[key].index) {
					for (let i = 0; i<takenSquares.length; i++) {
						if(move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {
						} else {
							choice2 = game.board[key];
						}
					}
				}
			}
			for (let key in game.board) {
				var jumpMove1 = new JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove2 = new JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);
				if (jumpMove1.index === game.board[key].index) {
					for(let i = 0; i<takenSquares.length; i++) {
						if(move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {
							if(takenSquares[i].player === 'red') {
								if (jumpMove1.x === takenSquares[i].y && jumpMove1.y === takenSquares[i].y) {
								} else {
									jumpChoice3 = game.board[key];
								}
							}
						}
					}
				} else if (jumpMove2.index === game.board[key].index) {
					for(let i = 0; i<takenSquares.length; i++) {
						if(move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {
							if(takenSquares[i].player === 'red') {
								if (jumpMove2.x === takenSquares[i].y && jumpMove2.y === takenSquares[i].y) {
								} else {
									jumpChoice4 = game.board[key];
								}
							}
						}
					}
				}
			}
		};
		game.chooseSquare = (square) => {
			if(square === choice1 || square === choice2 || square === choice3 || square === choice4 || square === jumpChoice1 || square === jumpChoice2 || square === jumpChoice3 || square === jumpChoice4) {
				var newTop = (square.x * 70) + 'px';
				var newLeft = (square.y * 70) + 'px';
				firebase.database().ref(`/pieces/${currentPiece.id}`).update({
					top: newTop,
					left: newLeft,
					y: square.x,
					x: square.y
				});
				if (currentPiece.color === 'red' && square.x === 7) {
					firebase.database().ref(`/pieces/${currentPiece.id}`).update({
						king: true
					});
				}
				if (currentPiece.color === 'white' && square.x === 0) {
					firebase.database().ref(`/pieces/${currentPiece.id}`).update({
						king: true
					});
				}
				if (square === jumpChoice1) {
					let jumpSquareX = jumpChoice1.x - 1;
					let jumpSquareY = jumpChoice1.y - 1;
					for (let key in game.pieces) {
						if (game.pieces[key].y === jumpSquareX && game.pieces[key].x === jumpSquareY) {
							firebase.database().ref(`/pieces/${key}`).remove();
							$timeout();
							if (currentPiece.color === 'red') {
								player2Death += 1;
							} else {
								player1Death +=1;
							}
						}
					}
				} else if (square === jumpChoice2) {
					let jumpSquareX = jumpChoice2.x - 1;
					let jumpSquareY = jumpChoice2.y + 1;
					for (let key in game.pieces) {
						if (game.pieces[key].y === jumpSquareX && game.pieces[key].x === jumpSquareY) {
							firebase.database().ref(`/pieces/${key}`).remove();
							$timeout();
							if (currentPiece.color === 'red') {
								player2Death += 1;
							} else {
								player1Death +=1;
							}
						}
					}
				} else if (square === jumpChoice3) {
					let jumpSquareX = jumpChoice3.x + 1;
					let jumpSquareY = jumpChoice3.y + 1;
					for (let key in game.pieces) {
						if (game.pieces[key].y === jumpSquareX && game.pieces[key].x === jumpSquareY) {
							firebase.database().ref(`/pieces/${key}`).remove();
							$timeout();
							if (currentPiece.color === 'red') {
								player2Death += 1;
							} else {
								player1Death +=1;
							}
						}
					}
				} else if (square === jumpChoice4) {
					let jumpSquareX = jumpChoice4.x + 1;
					let jumpSquareY = jumpChoice4.y - 1;
					for (let key in game.pieces) {
						if (game.pieces[key].y === jumpSquareX && game.pieces[key].x === jumpSquareY) {
							firebase.database().ref(`/pieces/${key}`).remove();
							$timeout();
							if (currentPiece.color === 'red') {
								player2Death += 1;
							} else {
								player1Death +=1;
							}
						}
					}
				}
				if (player1Death === 8) {
					console.log("player 2 wins");
				} else if (player2Death === 8) {
					console.log('player 1 wins');
				}
				removeSelected();
			}
		};

		game.reset = () => {
			firebase.database().ref('/pieces/').remove();
			var pieceCount = 16;
			for(let i=0; i<pieceCount; i++) {
				if (i < pieceCount/2) {
					// player 1
					let y = Math.floor(i / 4);
					let x = (i % 4) * 2 + (1 - y%2);
					firebase.database().ref('/pieces/').push({
						'color': 'red',
						'top':  (y * 70)+'px',
						'left': (x * 70)+'px',
						'x': x,
						'y': y,
						'king': false,
						'player1': true
					});
				}	else {
					// player 2
					let y = Math.floor(i/4) + 4;
					let x = (i % 4) * 2 + (1-y%2);
					firebase.database().ref('pieces/').push({
						'color': 'white',
						'top':  (y * 70)+'px',
						'left': (x * 70)+'px',
						'x': x,
						'y': y,
						'king': false,
						'player1': false
					});
				}
			}
			removeSelected();
			player2Death = 0;
			player1Death = 0;
		};
	});

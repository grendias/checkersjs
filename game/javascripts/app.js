"use strict";

angular.module('app', ['ngRoute', 'ngCookies']).factory('BoardFact', function () {
	var row = 8;
	var _squares = [];
	var index = 0;
	for (var x = 0; x < row; x++) {
		for (var y = 0; y < row; y++) {
			_squares.push({
				'index': index,
				'x': x,
				'y': y
			});
			index++;
		}
	}
	return {
		squares: function squares() {
			return _squares;
		}
	};
}).config(function () {
	var config = {
		apiKey: "AIzaSyBrbaIJrMqiL1Ho_rM35FgieqOyAjF-BiE",
		authDomain: "checkers-f4624.firebaseapp.com",
		databaseURL: "https://checkers-f4624.firebaseio.com",
		storageBucket: "checkers-f4624.appspot.com"
	};
	firebase.initializeApp(config);
}).factory('AuthFactory', function ($location, $timeout, $cookies) {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			firebase.database().ref('/users/' + user.uid).set({
				email: user.email
			});
			$cookies.put('userid', user.uid);
			$cookies.put('email', user.email);
			$location.path('/dashboard/' + user.uid);
			$timeout();
		} else {
			$location.path('/');
			$timeout();
		}
	});
	return {
		login: function login(email, password) {
			firebase.auth().signInWithEmailAndPassword(email, password);
		},
		logout: function logout() {
			firebase.auth().signOut();
		},
		register: function register(email, password) {
			firebase.auth().createUserWithEmailAndPassword(email, password);
		}
	};
}).factory('UsersFact', function () {
	var currentUser = firebase.auth().currentUser;
	return {
		user: currentUser
	};
});
"use strict";

angular.module('app').config(function ($routeProvider) {
	return $routeProvider.when('/', {
		controller: 'LoginCtrl',
		controllerAs: 'log',
		templateUrl: 'javascripts/login.html'
	}).when('/dashboard/:uid', {
		controller: 'DashboardCtrl',
		controllerAs: 'dash',
		templateUrl: 'javascripts/dashboard.html'
	}).when('/checkers/:gameid', {
		controller: 'GameCtrl',
		controllerAs: 'game',
		templateUrl: 'javascripts/game.html'
	});
});
"use strict";

angular.module('app').controller('DashboardCtrl', function ($timeout, AuthFactory, $location, $routeParams) {
	var dash = this;
	var uid = $routeParams.uid;
	var userEmail;
	dash.heading = 'Dashboard';
	firebase.database().ref('games/').on('value', function (snap) {
		dash.games = snap.val();
		$timeout();
	});

	//gets user email
	firebase.database().ref('users/').once('value').then(function (snap) {
		for (var key in snap.val()) {
			if (key === uid) {
				var fullEmail = snap.val()[key].email;
				var index = fullEmail.indexOf('@');
				userEmail = fullEmail.slice(0, index);
			}
		}
	});

	//when a player clicks 'create new game' they are added to the game as player 1
	dash.newGame = function () {
		firebase.database().ref('games/').push({
			player1: uid,
			player1Email: userEmail,
			test: 'testgame',
			turn: uid,
			player1Death: 0,
			player2Death: 0
		});
		//creates player 1 pieces
		for (var key in dash.games) {
			if (dash.games[key].player1 === uid) {
				var pieceCount = 8;
				for (var i = 0; i < pieceCount; i++) {
					var y = Math.floor(i / 4);
					var x = i % 4 * 2 + (1 - y % 2);
					firebase.database().ref('/' + key + '/').push({
						'gameId': key,
						'userid': uid,
						'color': 'red',
						'top': y * 70 + 'px',
						'left': x * 70 + 'px',
						'x': x,
						'y': y,
						'king': false,
						'player1': true
					});
				}
				$location.path('/checkers/' + key);
			}
		}
	};

	//when a player clicks 'Join Game' they are added to the game as player 2
	dash.joinGame = function (gameId) {
		firebase.database().ref('games/' + gameId).update({
			player2: uid,
			player2Email: userEmail
		});
		var pieceCount = 8;
		//creates player 2 pieces
		for (var i = 0; i < pieceCount; i++) {
			var y = Math.floor(i / 4) + 6;
			var x = i % 4 * 2 + (1 - y % 2);
			firebase.database().ref('/' + gameId + '/').push({
				'gameId': gameId,
				'userid': uid,
				'color': 'white',
				'top': y * 70 + 'px',
				'left': x * 70 + 'px',
				'x': x,
				'y': y,
				'king': false,
				'player1': false
			});
		}
		$location.path('checkers/' + gameId);
	};

	dash.logOut = function () {
		firebase.auth().signOut();
	};
});
"use strict";

angular.module('app').controller('GameCtrl', function ($timeout, BoardFact, $routeParams, $location, UsersFact, $cookies, $window) {
	var game = this;

	$window.onbeforeunload = function (e) {
		e = e || $window.event;
		console.log(e);
		e.preventDefault = true;
		e.cancelBubble = true;
		e.returnValue = 'reload';
	};

	var gameId = $routeParams.gameid;
	var userId = $cookies.get('userid');
	var userEmail = $cookies.get('email');
	var currentPiece, choice1, choice2, choice3, choice4, jumpChoice1, jumpChoice2, jumpChoice3, jumpChoice4;
	game.heading = "Checkers";
	game.pieces = {};
	game.messages = {};
	game.board = BoardFact.squares();

	firebase.database().ref('games/' + gameId + '/').on('value', function (snap) {
		game.turn = snap.val().turn;
		game.player1Id = snap.val().player1;
		game.player1Email = snap.val().player1Email;
		game.player2Id = snap.val().player2;
		game.player2Email = snap.val().player2Email;
		game.player1Death = snap.val().player1Death;
		game.player2Death = snap.val().player2Death;
		$timeout();
	});

	firebase.database().ref(gameId + '/').on('value', function (snap) {
		game.pieces = snap.val();
		$timeout();
	});

	firebase.database().ref('messages/').on('value', function (snap) {
		for (var key in snap.val()) {
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
	game.chckBrd = function (x, y) {
		var oddX = x % 2;
		var oddY = y % 2;
		return oddX ^ oddY;
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
	game.toggleTurn = function () {
		if (game.turn === userId) {
			return true;
		}
	};

	//when a player chooses a king piece this function is called
	game.chooseKing = function (e, piece, id) {
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
			for (var _id in game.pieces) {
				if (game.pieces[_id].x === piece.x && game.pieces[_id].y === piece.y) {} else {
					takenSquares.push({
						x: game.pieces[_id].x,
						y: game.pieces[_id].y,
						player: game.pieces[_id].color
					});
				}
			}
			//finds which board square the piece is in
			for (var key in game.board) {
				if (piece.x === game.board[key].y && piece.y === game.board[key].x) {
					currentSquare = game.board[key];
				}
			}
			//looks for possible non-jump moves
			for (var _key in game.board) {
				move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
				move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
				move3 = new Move3(currentSquare.x, currentSquare.y, currentSquare.index);
				move4 = new Move4(currentSquare.x, currentSquare.y, currentSquare.index);
				//checks to see if possible move is empty
				if (move1.index === game.board[_key].index) {
					for (var i = 0; i < takenSquares.length; i++) {
						if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {} else {
							choice1 = game.board[_key];
						}
					}
				} else if (move2.index === game.board[_key].index) {
					for (var _i = 0; _i < takenSquares.length; _i++) {
						if (move2.x === takenSquares[_i].y && move2.y === takenSquares[_i].x) {} else {
							choice2 = game.board[_key];
						}
					}
				} else if (move3.index === game.board[_key].index) {
					for (var _i2 = 0; _i2 < takenSquares.length; _i2++) {
						if (move3.x === takenSquares[_i2].y && move3.y === takenSquares[_i2].x) {} else {
							choice3 = game.board[_key];
						}
					}
				} else if (move4.index === game.board[_key].index) {
					for (var _i3 = 0; _i3 < takenSquares.length; _i3++) {
						if (move4.x === takenSquares[_i3].y && move4.y === takenSquares[_i3].x) {} else {
							choice4 = game.board[_key];
						}
					}
				}
			}
			//checks for possible jump moves
			for (var _key2 in game.board) {
				var jumpMove1 = new JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove2 = new JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove3 = new JumpMove3(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove4 = new JumpMove4(currentSquare.x, currentSquare.y, currentSquare.index);
				// checks to see if a jump move is possible
				if (jumpMove1.index === game.board[_key2].index) {
					for (var _i4 = 0; _i4 < takenSquares.length; _i4++) {
						if (move1.x === takenSquares[_i4].y && move1.y === takenSquares[_i4].x) {
							if (takenSquares[_i4].player === 'white' && piece.color === 'red') {
								if (jumpMove1.x === takenSquares[_i4].y && jumpMove1.y === takenSquares[_i4].y) {} else {
									jumpChoice1 = game.board[_key2];
								}
							} else if (takenSquares[_i4].player === 'red' && piece.color === 'white') {
								if (jumpMove1.x === takenSquares[_i4].y && jumpMove1.y === takenSquares[_i4].y) {} else {
									jumpChoice1 = game.board[_key2];
								}
							}
						}
					}
				} else if (jumpMove2.index === game.board[_key2].index) {
					for (var _i5 = 0; _i5 < takenSquares.length; _i5++) {
						if (move2.x === takenSquares[_i5].y && move2.y === takenSquares[_i5].x) {
							if (takenSquares[_i5].player === 'white' && piece.color === 'red') {
								if (jumpMove2.x === takenSquares[_i5].y && jumpMove2.y === takenSquares[_i5].y) {} else {
									jumpChoice2 = game.board[_key2];
								}
							} else if (takenSquares[_i5].player === 'red' && piece.color === 'white') {
								if (jumpMove2.x === takenSquares[_i5].y && jumpMove2.y === takenSquares[_i5].y) {} else {
									jumpChoice2 = game.board[_key2];
								}
							}
						}
					}
				} else if (jumpMove3.index === game.board[_key2].index) {
					for (var _i6 = 0; _i6 < takenSquares.length; _i6++) {
						if (move3.x === takenSquares[_i6].y && move3.y === takenSquares[_i6].x) {
							if (takenSquares[_i6].player === 'white' && piece.color === 'red') {
								if (jumpMove3.x === takenSquares[_i6].y && jumpMove3.y === takenSquares[_i6].y) {} else {
									jumpChoice3 = game.board[_key2];
								}
							} else if (takenSquares[_i6].player === 'red' && piece.color === 'white') {
								if (jumpMove3.x === takenSquares[_i6].y && jumpMove3.y === takenSquares[_i6].y) {} else {
									jumpChoice3 = game.board[_key2];
								}
							}
						}
					}
				} else if (jumpMove4.index === game.board[_key2].index) {
					for (var _i7 = 0; _i7 < takenSquares.length; _i7++) {
						if (move4.x === takenSquares[_i7].y && move4.y === takenSquares[_i7].x) {
							if (takenSquares[_i7].player === 'white' && piece.color === 'red') {
								if (jumpMove4.x === takenSquares[_i7].y && jumpMove4.y === takenSquares[_i7].y) {} else {
									jumpChoice4 = game.board[_key2];
								}
							} else if (takenSquares[_i7].player === 'red' && piece.color === 'white') {
								if (jumpMove4.x === takenSquares[_i7].y && jumpMove4.y === takenSquares[_i7].y) {} else {
									jumpChoice4 = game.board[_key2];
								}
							}
						}
					}
				}
			}
		}
	};

	//when player 1 chooses a piece this function is called
	game.choosePiecePlayer1 = function (e, piece, id) {
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
			for (var _id2 in game.pieces) {
				if (game.pieces[_id2].x === piece.x && game.pieces[_id2].y === piece.y) {} else {
					takenSquares.push({
						x: game.pieces[_id2].x,
						y: game.pieces[_id2].y,
						player: game.pieces[_id2].color
					});
				}
			}
			//finds the position of the current piece
			for (var key in game.board) {
				if (piece.x === game.board[key].y && piece.y === game.board[key].x) {
					currentSquare = game.board[key];
				}
			}
			//looks for non-jump moves to see if they are empty
			for (var _key3 in game.board) {
				move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
				move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
				if (move1.index === game.board[_key3].index) {
					for (var i = 0; i < takenSquares.length; i++) {
						if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {} else {
							choice1 = game.board[_key3];
						}
					}
				} else if (move2.index === game.board[_key3].index) {
					for (var _i8 = 0; _i8 < takenSquares.length; _i8++) {
						if (move2.x === takenSquares[_i8].y && move2.y === takenSquares[_i8].x) {} else {
							choice2 = game.board[_key3];
						}
					}
				}
			}
			//checks for jump moves over white pieces and checks if they are empty
			for (var _key4 in game.board) {
				var jumpMove1 = new JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove2 = new JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);
				if (jumpMove1.index === game.board[_key4].index) {
					for (var _i9 = 0; _i9 < takenSquares.length; _i9++) {
						if (move1.x === takenSquares[_i9].y && move1.y === takenSquares[_i9].x) {
							if (takenSquares[_i9].player === 'white') {
								if (jumpMove1.x === takenSquares[_i9].y && jumpMove1.y === takenSquares[_i9].y) {} else {
									jumpChoice1 = game.board[_key4];
								}
							}
						}
					}
				} else if (jumpMove2.index === game.board[_key4].index) {
					for (var _i10 = 0; _i10 < takenSquares.length; _i10++) {
						if (move2.x === takenSquares[_i10].y && move2.y === takenSquares[_i10].x) {
							if (takenSquares[_i10].player === 'white') {
								// console.log(jumpMove2);
								if (jumpMove2.x === takenSquares[_i10].y && jumpMove2.y === takenSquares[_i10].y) {} else {
									jumpChoice2 = game.board[_key4];
								}
							}
						}
					}
				}
			}
		}
	};

	//same function as choosePiecePlayer1 except math for moves and jump criteria are different
	game.choosePiecePlayer2 = function (e, piece, id) {
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
			for (var _id3 in game.pieces) {
				if (game.pieces[_id3].x === piece.x && game.pieces[_id3].y === piece.y) {} else {
					takenSquares.push({
						x: game.pieces[_id3].x,
						y: game.pieces[_id3].y,
						player: game.pieces[_id3].color
					});
				}
			}

			for (var key in game.board) {
				if (piece.x === game.board[key].y && piece.y === game.board[key].x) {
					currentSquare = game.board[key];
				}
			}
			for (var _key5 in game.board) {
				move1 = new Move1(currentSquare.x, currentSquare.y, currentSquare.index);
				move2 = new Move2(currentSquare.x, currentSquare.y, currentSquare.index);
				if (move1.index === game.board[_key5].index) {
					for (var i = 0; i < takenSquares.length; i++) {
						if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {} else {
							choice1 = game.board[_key5];
						}
					}
				} else if (move2.index === game.board[_key5].index) {
					for (var _i11 = 0; _i11 < takenSquares.length; _i11++) {
						if (move2.x === takenSquares[_i11].y && move2.y === takenSquares[_i11].x) {} else {
							choice2 = game.board[_key5];
						}
					}
				}
			}
			for (var _key6 in game.board) {
				var jumpMove1 = new JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index);
				var jumpMove2 = new JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);
				if (jumpMove1.index === game.board[_key6].index) {
					for (var _i12 = 0; _i12 < takenSquares.length; _i12++) {
						if (move1.x === takenSquares[_i12].y && move1.y === takenSquares[_i12].x) {
							if (takenSquares[_i12].player === 'red') {
								if (jumpMove1.x === takenSquares[_i12].y && jumpMove1.y === takenSquares[_i12].y) {} else {
									jumpChoice3 = game.board[_key6];
								}
							}
						}
					}
				} else if (jumpMove2.index === game.board[_key6].index) {
					for (var _i13 = 0; _i13 < takenSquares.length; _i13++) {
						if (move2.x === takenSquares[_i13].y && move2.y === takenSquares[_i13].x) {
							if (takenSquares[_i13].player === 'red') {
								if (jumpMove2.x === takenSquares[_i13].y && jumpMove2.y === takenSquares[_i13].y) {} else {
									jumpChoice4 = game.board[_key6];
								}
							}
						}
					}
				}
			}
		}
	};

	//when a player chooses a legal move
	game.chooseSquare = function (square) {
		//if the square they choose matches any of the possible moves the player has
		if (square === choice1 || square === choice2 || square === choice3 || square === choice4 || square === jumpChoice1 || square === jumpChoice2 || square === jumpChoice3 || square === jumpChoice4) {
			var newTop = square.x * 70 + 'px';
			var newLeft = square.y * 70 + 'px';
			//updates new coordinates of the game piece
			firebase.database().ref('/' + gameId + '/' + currentPiece.id).update({
				top: newTop,
				left: newLeft,
				y: square.x,
				x: square.y
			});
			$timeout();
			$('#' + currentPiece.id).animate({ top: newTop, left: newLeft }, "slide");

			//checks to see if a piece will be kinged
			if (currentPiece.color === 'red' && square.x === 7) {
				firebase.database().ref('/' + gameId + '/' + currentPiece.id).update({
					king: true
				});
				$timeout();
			}
			if (currentPiece.color === 'white' && square.x === 0) {
				firebase.database().ref('/' + gameId + '/' + currentPiece.id).update({
					king: true
				});
				$timeout();
			}
			//if player makes a jump move: the jumped pieced is removed and player death is updated
			if (square === jumpChoice1) {
				var jumpSquareX = jumpChoice1.x - 1;
				var jumpSquareY = jumpChoice1.y - 1;
				for (var key in game.pieces) {
					if (game.pieces[key].y === jumpSquareX && game.pieces[key].x === jumpSquareY) {
						firebase.database().ref('/' + gameId + '/' + key).remove();
						$timeout();
						if (currentPiece.color === 'red') {
							firebase.database().ref('games/' + gameId + '/').update({
								player2Death: game.player2Death + 1
							});
						} else {
							firebase.database().ref('games/' + gameId + '/').update({
								player1Death: game.player1Death + 1
							});
						}
					}
				}
			} else if (square === jumpChoice2) {
				var _jumpSquareX = jumpChoice2.x - 1;
				var _jumpSquareY = jumpChoice2.y + 1;
				for (var _key7 in game.pieces) {
					if (game.pieces[_key7].y === _jumpSquareX && game.pieces[_key7].x === _jumpSquareY) {
						firebase.database().ref('/' + gameId + '/' + _key7).remove();
						$timeout();
						if (currentPiece.color === 'red') {
							firebase.database().ref('games/' + gameId + '/').update({
								player2Death: game.player2Death + 1
							});
						} else {
							firebase.database().ref('games/' + gameId + '/').update({
								player1Death: game.player1Death + 1
							});
						}
					}
				}
			} else if (square === jumpChoice3) {
				var _jumpSquareX2 = jumpChoice3.x + 1;
				var _jumpSquareY2 = jumpChoice3.y + 1;
				for (var _key8 in game.pieces) {
					if (game.pieces[_key8].y === _jumpSquareX2 && game.pieces[_key8].x === _jumpSquareY2) {
						firebase.database().ref('/' + gameId + '/' + _key8).remove();
						$timeout();
						if (currentPiece.color === 'red') {
							firebase.database().ref('games/' + gameId + '/').update({
								player2Death: game.player2Death + 1
							});
						} else {
							firebase.database().ref('games/' + gameId + '/').update({
								player1Death: game.player1Death + 1
							});
						}
					}
				}
			} else if (square === jumpChoice4) {
				var _jumpSquareX3 = jumpChoice4.x + 1;
				var _jumpSquareY3 = jumpChoice4.y - 1;
				for (var _key9 in game.pieces) {
					if (game.pieces[_key9].y === _jumpSquareX3 && game.pieces[_key9].x === _jumpSquareY3) {
						firebase.database().ref('/' + gameId + '/' + _key9).remove();
						$timeout();
						if (currentPiece.color === 'red') {
							firebase.database().ref('games/' + gameId + '/').update({
								player2Death: game.player2Death + 1
							});
						} else {
							firebase.database().ref('games/' + gameId + '/').update({
								player1Death: game.player1Death + 1
							});
						}
					}
				}
			}

			if (game.turn === game.player1Id) {
				firebase.database().ref('games/' + gameId + '/').update({
					turn: game.player2Id
				});
			} else if (game.turn === game.player2Id) {
				firebase.database().ref('games/' + gameId + '/').update({
					turn: game.player1Id
				});
			}
			removeSelected();
		}
	};

	//function to play again
	game.reset = function () {
		firebase.database().ref('/' + gameId + '/').remove();
		var pieceCount = 16;
		for (var i = 0; i < pieceCount; i++) {
			if (i < pieceCount / 2) {
				// player 1
				var y = Math.floor(i / 4);
				var x = i % 4 * 2 + (1 - y % 2);
				firebase.database().ref('/' + gameId + '/').push({
					'gameId': gameId,
					'userid': game.player1Id,
					'color': 'red',
					'top': y * 70 + 'px',
					'left': x * 70 + 'px',
					'x': x,
					'y': y,
					'king': false,
					'player1': true
				});
			} else {
				// player 2
				var _y = Math.floor(i / 4) + 4;
				var _x = i % 4 * 2 + (1 - _y % 2);
				firebase.database().ref('/' + gameId + '/').push({
					'gameId': gameId,
					'userid': game.player2Id,
					'color': 'white',
					'top': _y * 70 + 'px',
					'left': _x * 70 + 'px',
					'x': _x,
					'y': _y,
					'king': false,
					'player1': false
				});
			}
		}
		firebase.database().ref('games/' + gameId + '/').update({
			player1Death: 0,
			player2Death: 0
		});
		removeSelected();
	};

	game.leaveGame = function () {
		firebase.database().ref('games/' + gameId).remove();
		for (var key in game.pieces) {
			if (game.pieces[key].userid === firebase.auth().currentUser.uid) {
				firebase.database().ref('/' + gameId + '/' + key).remove();
			}
		}
		$location.path('/dashboard/' + userId);
	};

	game.logOut = function () {
		firebase.auth().signOut();
	};

	game.submitMessage = function () {
		firebase.database().ref('messages/').push({
			'gameId': gameId,
			'userEmail': userEmail,
			'userMessage': game.message
		});
		game.message = '';
	};
});
"use strict";

angular.module('app').controller('LoginCtrl', function ($timeout, AuthFactory, $location, $cookies) {
	var log = this;
	log.heading = "login";
	log.login = function () {
		AuthFactory.login(log.user.email, log.user.password);
		$timeout();
	};
	log.register = function () {
		AuthFactory.register(log.user.email, log.user.password);
		$timeout();
	};

	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			firebase.database().ref('/users/' + user.uid).set({
				email: user.email,
				name: user.displayName
			});
			$cookies.put('userid', user.uid);
			$cookies.put('email', user.email);
			$location.path('/dashboard/' + user.uid);
			$timeout();
		} else {
			$location.path('/');
			$timeout();
		}
	});
});
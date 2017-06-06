"use strict";

var app = angular.module('app', ['ngRoute', 'ngCookies']);

app.config(function () {
	var config = {
		apiKey: "AIzaSyBrbaIJrMqiL1Ho_rM35FgieqOyAjF-BiE",
		authDomain: "checkers-f4624.firebaseapp.com",
		databaseURL: "https://checkers-f4624.firebaseio.com",
		storageBucket: "checkers-f4624.appspot.com"
	};
	firebase.initializeApp(config);
});
"use strict";

app.controller('DashboardCtrl', function ($timeout, AuthFactory, $location, $routeParams) {
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

app.controller('GameCtrl', function ($timeout, BoardFact, $routeParams, $location, UsersFact, $cookies, $window, MoveFact, HelperFact) {
	var game = this;
	var gameId = $routeParams.gameid;
	var userId = $cookies.get('userid');
	var userEmail = $cookies.get('email');

	var player1Moves = MoveFact.player1Moves;
	var player2Moves = MoveFact.player2Moves;
	var currentPiece = void 0,
	    choice1 = void 0,
	    choice2 = void 0,
	    choice3 = void 0,
	    choice4 = void 0,
	    jumpChoice1 = void 0,
	    jumpChoice2 = void 0,
	    jumpChoice3 = void 0,
	    jumpChoice4 = void 0;

	game.heading = "Checkers";
	game.pieces = {};
	game.messages = {};
	game.board = BoardFact.squares();
	game.chckBrd = function (x, y) {
		//function to create checkerboard pattern
		var oddX = x % 2;
		var oddY = y % 2;
		return oddX ^ oddY;
	};

	if (game.player1Id === userId) {
		game.playerEmail = game.player1Email;
		game.playerColor = 'red';
		game.player = '1';
	} else if (game.player2Id === userId) {
		game.playerEmail = game.player2Email;
		game.playerColor = 'white';
		game.player = '2';
	}

	game.toggleTurn = function () {
		//determines who's turn it is
		if (game.turn === userId) {
			return true;
		}
	};

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

	game.chooseKing = function (e, piece, id) {
		//when a player chooses a king piece this function is called
		if (game.turn === piece.userid) {
			$(e.currentTarget).toggleClass('selected');
			currentPiece = piece;
			currentPiece.id = id;
			var currentSquare = HelperFact.getCurrentSquare(game.board, piece),
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
				board: game.board,
				move: move1,
				takenSquares: takenSquares
			});
			choice2 = HelperFact.getRegularMove({
				board: game.board,
				takenSquares: takenSquares,
				move: move2
			});
			choice3 = HelperFact.getRegularMove({
				board: game.board,
				move: move3,
				takenSquares: takenSquares
			});
			choice4 = HelperFact.getRegularMove({
				board: game.board,
				takenSquares: takenSquares,
				move: move4
			});
			jumpChoice1 = HelperFact.getKingJumpMove({
				board: game.board,
				takenSquares: takenSquares,
				move: move1,
				jumpMove: jumpMove1,
				player: game.playerColor
			});
			jumpChoice2 = HelperFact.getKingJumpMove({
				board: game.board,
				takenSquares: takenSquares,
				move: move2,
				jumpMove: jumpMove2,
				player: game.playerColor
			});
			jumpChoice3 = HelperFact.getKingJumpMove({
				board: game.board,
				takenSquares: takenSquares,
				move: move3,
				jumpMove: jumpMove3,
				player: game.playerColor
			});
			jumpChoice4 = HelperFact.getKingJumpMove({
				board: game.board,
				takenSquares: takenSquares,
				move: move4,
				jumpMove: jumpMove4,
				player: game.playerColor
			});
		}
	};

	game.choosePiecePlayer1 = function (e, piece, id) {
		//when player 1 chooses a piece this function is called
		if (game.turn === piece.userid) {
			$(e.currentTarget).toggleClass('selected');
			currentPiece = piece;
			currentPiece.id = id;
			var currentSquare = HelperFact.getCurrentSquare(game.board, piece),
			    takenSquares = HelperFact.getTakenSquares(currentPiece, game.pieces),
			    move1 = new player1Moves.Move1(currentSquare.x, currentSquare.y, currentSquare.index),
			    move2 = new player1Moves.Move2(currentSquare.x, currentSquare.y, currentSquare.index),
			    jumpMove1 = new player1Moves.JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index),
			    jumpMove2 = new player1Moves.JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);

			choice1 = HelperFact.getRegularMove({
				board: game.board,
				move: move1,
				takenSquares: takenSquares
			});
			choice2 = HelperFact.getRegularMove({
				board: game.board,
				takenSquares: takenSquares,
				move: move2
			});
			jumpChoice1 = HelperFact.getJumpMove({
				board: game.board,
				jumpMove: jumpMove1,
				move: move1,
				takenSquares: takenSquares,
				oppositePlayer: 'white'
			});
			jumpChoice2 = HelperFact.getJumpMove({
				board: game.board,
				jumpMove: jumpMove2,
				move: move2,
				takenSquares: takenSquares,
				oppositePlayer: 'white'
			});
		}
	};

	game.choosePiecePlayer2 = function (e, piece, id) {
		//same function as choosePiecePlayer1 except math for moves and jump criteria are different
		if (game.turn === piece.userid) {
			$(e.currentTarget).toggleClass('selected');
			currentPiece = piece;
			currentPiece.id = id;
			var currentSquare = HelperFact.getCurrentSquare(game.board, piece),
			    takenSquares = HelperFact.getTakenSquares(currentPiece, game.pieces),
			    move1 = new player2Moves.Move1(currentSquare.x, currentSquare.y, currentSquare.index),
			    move2 = new player2Moves.Move2(currentSquare.x, currentSquare.y, currentSquare.index),
			    jumpMove1 = new player2Moves.JumpMove1(currentSquare.x, currentSquare.y, currentSquare.index),
			    jumpMove2 = new player2Moves.JumpMove2(currentSquare.x, currentSquare.y, currentSquare.index);

			choice1 = HelperFact.getRegularMove({
				board: game.board,
				move: move1,
				takenSquares: takenSquares
			});
			choice2 = HelperFact.getRegularMove({
				board: game.board,
				takenSquares: takenSquares,
				move: move2
			});
			jumpChoice3 = HelperFact.getJumpMove({
				board: game.board,
				jumpMove: jumpMove1,
				move: move1,
				takenSquares: takenSquares,
				oppositePlayer: 'red'
			});
			jumpChoice4 = HelperFact.getJumpMove({
				board: game.board,
				jumpMove: jumpMove2,
				move: move2,
				takenSquares: takenSquares,
				oppositePlayer: 'red'
			});
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
			$('#' + currentPiece.id).animate({
				top: newTop,
				left: newLeft
			}, "slide");

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
				for (var _key in game.pieces) {
					if (game.pieces[_key].y === _jumpSquareX && game.pieces[_key].x === _jumpSquareY) {
						firebase.database().ref('/' + gameId + '/' + _key).remove();
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
				for (var _key2 in game.pieces) {
					if (game.pieces[_key2].y === _jumpSquareX2 && game.pieces[_key2].x === _jumpSquareY2) {
						firebase.database().ref('/' + gameId + '/' + _key2).remove();
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
				for (var _key3 in game.pieces) {
					if (game.pieces[_key3].y === _jumpSquareX3 && game.pieces[_key3].x === _jumpSquareY3) {
						firebase.database().ref('/' + gameId + '/' + _key3).remove();
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

app.controller('LoginCtrl', function ($timeout, AuthFactory, $location, $cookies) {
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
			firebase.database().ref("/users/" + user.uid).set({
				email: user.email,
				name: user.displayName
			});
			$cookies.put('userid', user.uid);
			$cookies.put('email', user.email);
			$location.path("/dashboard/" + user.uid);
			$timeout();
		} else {
			$location.path('/');
			$timeout();
		}
	});
});
'use strict';

app.factory('AuthFactory', function ($location, $timeout, $cookies) {
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
});
app.factory('UsersFact', function () {
  var currentUser = firebase.auth().currentUser;
  return {
    user: currentUser
  };
});
'use strict';

app.factory('BoardFact', function () {
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
});
"use strict";

app.factory('HelperFact', function () {
  var getTakenSquares = function getTakenSquares(currentPiece, allPieces) {
    var takenSquares = [];
    for (var id in allPieces) {
      if (allPieces[id].x === currentPiece.x && allPieces[id].y === currentPiece.y) {} else {
        takenSquares.push({
          x: allPieces[id].x,
          y: allPieces[id].y,
          player: allPieces[id].color
        });
      }
    }
    return takenSquares;
  };

  var getCurrentSquare = function getCurrentSquare(board, currentPiece) {
    var currentSquare = void 0;
    for (var key in board) {
      if (currentPiece.x === board[key].y && currentPiece.y === board[key].x) {
        currentSquare = board[key];
      }
    }
    return currentSquare;
  };

  var getRegularMove = function getRegularMove(_ref) {
    var board = _ref.board,
        move = _ref.move,
        takenSquares = _ref.takenSquares;

    for (var key in board) {
      if (move.index === board[key].index) {
        for (var i = 0; i < takenSquares.length; i++) {
          if (move.x === takenSquares[i].y && move.y === takenSquares[i].x) {} else {
            return board[key];
          }
        }
      }
    }
  };

  var getJumpMove = function getJumpMove(_ref2) {
    var board = _ref2.board,
        jumpMove = _ref2.jumpMove,
        move = _ref2.move,
        takenSquares = _ref2.takenSquares,
        oppositePlayer = _ref2.oppositePlayer;

    for (var key in board) {
      if (jumpMove.index === board[key].index) {
        for (var i = 0; i < takenSquares.length; i++) {
          if (move.x === takenSquares[i].y && move.y === takenSquares[i].x) {
            if (takenSquares[i].player === oppositePlayer) {
              if (jumpMove.x === takenSquares[i].y && jumpMove.y === takenSquares[i].y) {} else {
                var jumpChoice = board[key];
                return jumpChoice;
              }
            }
          }
        }
      }
    }
  };

  var getKingJumpMove = function getKingJumpMove(_ref3) {
    var board = _ref3.board,
        takenSquares = _ref3.takenSquares,
        move = _ref3.move,
        jumpMove = _ref3.jumpMove,
        player = _ref3.player;

    for (var key in board) {
      if (jumpMove.index === board[key].index) {
        for (var i = 0; i < takenSquares.length; i++) {
          if (move.x === takenSquares[i].y && move.y === takenSquares[i].x) {
            if (takenSquares[i].player !== player) {
              if (jumpMove.x === takenSquares[i].y && jumpMove.y === takenSquares[i].y) {} else {
                var jumpChoice = board[key];
                return jumpChoice;
              }
            }
          }
        }
      }
    }
  };

  return {
    getTakenSquares: getTakenSquares,
    getCurrentSquare: getCurrentSquare,
    getRegularMove: getRegularMove,
    getJumpMove: getJumpMove,
    getKingJumpMove: getKingJumpMove
  };
});
'use strict';

app.factory('MoveFact', function () {

  var player1Moves = {
    Move1: function Move1(x, y, index) {
      this.index = index + 9;
      this.x = x + 1;
      this.y = y + 1;
    },
    Move2: function Move2(x, y, index) {
      this.index = index + 7;
      this.x = x + 1;
      this.y = y - 1;
    },
    JumpMove2: function JumpMove2(x, y, index) {
      this.index = index + 14;
      this.x = x + 2;
      this.y = y - 2;
    },
    JumpMove1: function JumpMove1(x, y, index) {
      this.index = index + 18;
      this.x = x + 2;
      this.y = y + 2;
    }
  };

  var player2Moves = {
    Move1: function Move1(x, y, index) {
      this.index = index - 9;
      this.x = x - 1;
      this.y = y - 1;
    },
    Move2: function Move2(x, y, index) {
      this.index = index - 7;
      this.x = x - 1;
      this.y = y + 1;
    },
    JumpMove1: function JumpMove1(x, y, index) {
      this.index = index - 18;
      this.x = x - 2;
      this.y = y - 2;
    },
    JumpMove2: function JumpMove2(x, y, index) {
      this.index = index - 14;
      this.x = x - 2;
      this.y = y + 2;
    }
  };

  return {
    player1Moves: player1Moves,
    player2Moves: player2Moves
  };
});
"use strict";

app.config(function ($routeProvider) {
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
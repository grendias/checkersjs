angular.module('app', [])
	.factory('BoardFact', () => {
		const row = 8;
		var pieceCount = row*2;
		var pieces = [];
		var squares = [];
		for (var x=0; x<row; x++) {
			for(var y=0; y<row; y++) {
				squares.push({
					'x': x,
					'y': y
				});
			}
		}
		for(var i=0; i<pieceCount; i++) {


			if (i < pieceCount/2) {
				var y = Math.floor(i / 4);
      	var x = (i % 4) * 2 + (1 - y%2);
				pieces.push({
					'number': i,
					'color': 'red',
        	'top':  (y * 70)+'px',
        	'left': (x * 70)+'px'
				});
			}	else {
				var y = Math.floor(i/4) + 4;
        var x = (i % 4) * 2 + (1-y%2)
				pieces.push({
					'number': i,
					'color': 'white',
					'top':  (y * 70)+'px',
        	'left': (x * 70)+'px'
				});
			}
		}
		return {
			squares () {
				return squares;
			},
			pieces () {
				return pieces;
			}
		}
	})

	.controller('GameCtrl', function (BoardFact) {
		const game = this;
		game.heading = "Checkers";
		game.board = BoardFact.squares();
		game.pieces = BoardFact.pieces();
		game.chckBrd = (x, y) => {
			var oddX = x % 2;
			var oddY = y % 2;
			return (oddX ^ oddY);
		}
		game.position

	})

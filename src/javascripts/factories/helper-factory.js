"use strict";
app.factory('HelperFact', ($timeout) => {
  let getTakenSquares = (currentPiece, allPieces) => {
    let takenSquares = [];
    for (let id in allPieces) {
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

  let getCurrentSquare = (board, currentPiece) => {
    let currentSquare;
    for (let key in board) {
      if (currentPiece.x === board[key].y && currentPiece.y === board[key].x) {
        currentSquare = board[key];
      }
    }
    return currentSquare;
  };

  let getRegularMove = ({
    board, move, takenSquares
  }) => {
    for (let key in board) {
      if (move.index === board[key].index) {
        for (let i = 0; i < takenSquares.length; i++) {
          if (move.x === takenSquares[i].y && move.y === takenSquares[i].x) {} else {
            return board[key];
          }
        }
      }
    }
  };

  let getJumpMove = ({
    board, jumpMove, move, takenSquares, oppositePlayer
  }) => {
    for (let key in board) {
      if (jumpMove.index === board[key].index) {
        for (let i = 0; i < takenSquares.length; i++) {
          if (move.x === takenSquares[i].y && move.y === takenSquares[i].x) {
            if (takenSquares[i].player === oppositePlayer) {
              if (jumpMove.x === takenSquares[i].y && jumpMove.y === takenSquares[i].y) {} else {
                let jumpChoice = board[key];
                return jumpChoice;
              }
            }
          }
        }
      }
    }
  };

  let getKingJumpMove = ({
    board, takenSquares, move, jumpMove, player
  }) => {
    for (let key in board) {
      if (jumpMove.index === board[key].index) {
        for (let i = 0; i < takenSquares.length; i++) {
          if (move.x === takenSquares[i].y && move.y === takenSquares[i].x) {
            if (takenSquares[i].player !== player) {
              if (jumpMove.x === takenSquares[i].y && jumpMove.y === takenSquares[i].y) {} else {
                let jumpChoice = board[key];
                return jumpChoice;
              }
            }
          }
        }
      }
    }
  };

  let getKingPiece = ({
    currentPiece, player, number, square, gameId
  }) => {
    if (currentPiece.color === player && square.x === number) {
      firebase.database().ref(`/${gameId}/${currentPiece.id}`).update({
        king: true
      });
      $timeout();
    }
  };

  let removePiece = ({
    pieces, squareX, squareY, currentPiece, gameId, player1, player2
  }) => {

    for (let key in pieces) {
      if (pieces[key].y === squareX && pieces[key].x === squareY) {
        firebase.database().ref(`/${gameId}/${key}`).remove();
        $timeout();
        if (currentPiece.color === 'red') {
          firebase.database().ref(`games/${gameId}/`).update({
            player2Death: player2 + 1
          });
        } else {
          firebase.database().ref(`games/${gameId}/`).update({
            player1Death: player1 + 1
          });
        }
      }
    }
  };

  let createPlayer1 = (gameId, userId) => {
    let pieceCount = 8;
    for (let i = 0; i < pieceCount; i++) {
      let y = Math.floor(i / 4);
      let x = (i % 4) * 2 + (1 - y % 2);
      firebase.database().ref(`/${key}/`).push({
        'gameId': gameId,
        'userid': userId,
        'color': 'red',
        'top': (y * 70) + 'px',
        'left': (x * 70) + 'px',
        'x': x,
        'y': y,
        'king': false,
        'player1': true
      });
    }
  };

  let createPlayer2 = (gameId, uid) => {
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
  }

  return {
    getTakenSquares,
    getCurrentSquare,
    getRegularMove,
    getJumpMove,
    getKingJumpMove,
    getKingPiece,
    removePiece,
    createPlayer1,
    createPlayer2
  };
});

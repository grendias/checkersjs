"use strict";
app.factory('HelperFact', () => {
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

  let getRegularMoves = ({
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

  return {
    getTakenSquares,
    getCurrentSquare,
    getRegularMoves
  };
});

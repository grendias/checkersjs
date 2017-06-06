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

  // let getCurrentSquare = (board, currentPiece) => {
  //   console.log("board, currentPiece", board, currentPiece);
  //   let currentSquare;
  //   for (let key in board) {
  //     if (currentPiece.x === board[key].y && currentPiece.y === board[key].x) {
  //       currentSquare = board[key];
  //     }
  //   }
  //   return currentSquare;
  // };
  //
  // let getRegularMoves = ({
  //   board, move1, move2, takenSquares
  // }) => {
  //   console.log("board, move1, move2, takenSquares", board, move1, move2, takenSquares);
  //   let choices = [];
  //   for (let key in board) {
  //     if (move1.index === board[key].index) {
  //       for (let i = 0; i < takenSquares.length; i++) {
  //         if (move1.x === takenSquares[i].y && move1.y === takenSquares[i].x) {} else {
  //           choices.push(board[key]);
  //         }
  //       }
  //     } else if (move2.index === board[key].index) {
  //       for (let i = 0; i < takenSquares.length; i++) {
  //         if (move2.x === takenSquares[i].y && move2.y === takenSquares[i].x) {} else {
  //           choices.push(board[key]);
  //         }
  //       }
  //     }
  //   }
  //   return choices;
  // };

  return {
    getTakenSquares
    // getCurrentSquare,
    // getRegularMoves
  };
});

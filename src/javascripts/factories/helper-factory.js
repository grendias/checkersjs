"use strict";
app.factory('HelperFact', () => {
  let getTakenSquares = (currentPiece, allPieces) => {
    let takenSquares = []
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

  return {
    getTakenSquares
  }
});

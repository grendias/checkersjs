'use strict';
app.factory('BoardFact', () => {
  const row = 8;
  var squares = [];
  var index = 0;
  for (let x = 0; x < row; x++) {
    for (let y = 0; y < row; y++) {
      squares.push({
        'index': index,
        'x': x,
        'y': y
      });
      index++;
    }
  }
  return {
    squares() {
      return squares;
    }
  };
});

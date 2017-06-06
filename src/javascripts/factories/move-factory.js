'use strict';
app.factory('MoveFact', () => {

  let player1Moves = {
    Move1: function (x, y, index) {
      this.index = index + 9;
      this.x = x + 1;
      this.y = y + 1;
    },
    Move2: function (x, y, index) {
      this.index = index + 7;
      this.x = x + 1;
      this.y = y - 1;
    },
    JumpMove2: function (x, y, index) {
      this.index = index + 14;
      this.x = x + 2;
      this.y = y - 2;
    },
    JumpMove1: function (x, y, index) {
      this.index = index + 18;
      this.x = x + 2;
      this.y = y + 2;
    }
  };

  let player2Moves = {
    Move1: function (x, y, index) {
      this.index = index - 9;
      this.x = x - 1;
      this.y = y - 1;
    },
    Move2: function (x, y, index) {
      this.index = index - 7;
      this.x = x - 1;
      this.y = y + 1;
    },
    JumpMove1: function (x, y, index) {
      this.index = index - 18;
      this.x = x - 2;
      this.y = y - 2;
    },
    JumpMove2: function (x, y, index) {
      this.index = index - 14;
      this.x = x - 2;
      this.y = y + 2;
    },
  };

  return {
    player1Moves,
    player2Moves
  };
});

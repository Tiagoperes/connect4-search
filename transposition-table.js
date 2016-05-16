(function () {
  'use strict';

  function TranspositionTable() {
    const COLUMNS = 7;

    var table = {};

    function getHash(line, column, player) {
      var exp = line * COLUMNS + column,
          multiplier = player === connect4.AI_MARK ? 1 : 2;
      return multiplier * Math.pow(3, exp);
    }

    this.set = function (hash, value) {
      table[hash] = value;
    };

    this.get = function (state, hash) {
      return table[hash];
    };

    this.applyMoveToHash = function (hash, line, column, player) {
      return hash + getHash(Number(line), Number(column), player);
    };

    this.getInitialBoard = function () {
      return 0;
    };

    this.restart = function () {
      table = {};
    }
  }

  window.connect4 = {TranspositionTable: TranspositionTable};
}());

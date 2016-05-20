(function () {
  'use strict';

  var conf = connect4.config;

  /* The hash here represents the board (state) in the following format:
   * The board is seen as a base 3 number with the most significant
   * "digit" at the right. Each position in the board assumes 0 when null,
   * 1 when AI mark and 2 otherwise.*/
  function getHash(line, column, player) {
    var exp = line * conf.BOARD_COLUMNS + column,
        multiplier = player === conf.AI_MARK ? 1 : 2;

    return multiplier * Math.pow(3, exp);
  }

  function applyMoveToHash(hash, line, column, player) {
    return hash + getHash(Number(line), Number(column), player);
  }

  function getInitialStateHash() {
    return 0;
  }

  function TranspositionTable() {
    var table = {};

    this.set = function (hash, value) {
      table[hash] = value;
    };

    this.get = function (state, hash) {
      return table[hash];
    };
  }

  TranspositionTable.applyMoveToHash = applyMoveToHash;
  TranspositionTable.getInitialStateHash = getInitialStateHash;

  connect4.TranspositionTable = TranspositionTable;
}());

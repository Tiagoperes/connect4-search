(function () {
  'use strict';

  function Evaluator() {
    var conf = connect4.config,
        verifier = new connect4.VerifierAutomaton();

    function evaluateLine(state, lineNumber, player, endGameData) {
      var sequence = state[lineNumber];
      return verifier.evaluate(player, sequence, endGameData);
    }

    function evaluateColumn(state, columnNumber, player, endGameData) {
      var sequence = _.reduce(state, function (column, line) {
        column.push(line[columnNumber]);
        return column;
      }, []);
      return verifier.evaluate(player, sequence, endGameData);
    }

    function evaluateDiagonalRight(state, lineNumber, columnNumber, player, endGameData) {
      var i = lineNumber, j = columnNumber, sequence = [];
      while (i < conf.BOARD_LINES && j < conf.BOARD_COLUMNS) {
        sequence.push(state[i++][j++]);
      }
      return verifier.evaluate(player, sequence, endGameData);
    }

    function evaluateDiagonalLeft(state, lineNumber, columnNumber, player, endGameData) {
      var i = lineNumber, j = columnNumber, sequence = [];
      while (i < conf.BOARD_LINES && j < conf.BOARD_COLUMNS) {
        sequence.push(state[i++][j--]);
      }
      return verifier.evaluate(player, sequence, endGameData);
    }

    function evaluateLines(state, player, endGameData) {
      var i = 0, evaluation = 0;
      while(i < conf.BOARD_LINES && evaluation < Infinity) {
        evaluation += evaluateLine(state, i, player, endGameData);
        i++;
      }
      if (evaluation === Infinity && endGameData) endGameData.line = i - 1;
      return evaluation;
    }

    function evaluateColumns(state, player, endGameData) {
      var i = 0, evaluation = 0;
      while(i < conf.BOARD_COLUMNS && evaluation < Infinity) {
        evaluation += evaluateColumn(state, i, player, endGameData);
        i++;
      }
      if (evaluation === Infinity && endGameData) endGameData.column = i - 1;
      return evaluation;
    }

    function evaluateRightDiagonals(state, player, endGameData) {
      const DIAGONALS_RIGHT = [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [2, 0]];
      var evaluation = 0;

      _.forEach(DIAGONALS_RIGHT, function (coordinates) {
        evaluation += evaluateDiagonalRight(state, coordinates[0], coordinates[1], player, endGameData);
        if (evaluation === Infinity) {
          _.set(endGameData, 'diagonalRight', [coordinates[0], coordinates[1]]);
          return false;
        }
      });

      return evaluation;
    }

    function evaluateLeftDiagonals(state, player, endGameData) {
      const DIAGONALS_LEFT = [[0, 6], [0, 5], [0, 4], [0, 3], [1, 6], [2, 6]];
      var evaluation = 0;

      _.forEach(DIAGONALS_LEFT, function (coordinates) {
        evaluation += evaluateDiagonalLeft(state, coordinates[0], coordinates[1], player, endGameData);
        if (evaluation === Infinity) {
          _.set(endGameData, 'diagonalLeft', [coordinates[0], coordinates[1]]);
          return false;
        }
      });

      return evaluation;
    }

    function evaluateStateAccordingToPlayer(state, player, endGameData) {
      var evaluation = evaluateLines(state, player, endGameData);
      if (evaluation < Infinity) evaluation += evaluateColumns(state, player, endGameData);
      if (evaluation < Infinity) evaluation += evaluateRightDiagonals(state, player, endGameData);
      if (evaluation < Infinity) evaluation += evaluateLeftDiagonals(state, player, endGameData);
      return evaluation;
    }

    this.getEndGameData = function (node) {
      var isBoardFull = !_.filter(_.flatten(node.state), _.isNull).length,
          endGameData = {};

      evaluateStateAccordingToPlayer(node.state, node.move.player, endGameData);

      if (_.has(endGameData, 'winner') || isBoardFull) return endGameData;
      return null;
    };

    this.evaluate = function (node) {
      return evaluateStateAccordingToPlayer(node.state, conf.AI_MARK)
        - evaluateStateAccordingToPlayer(node.state, !conf.AI_MARK);
    };
  }

  connect4.Evaluator = Evaluator;
}());

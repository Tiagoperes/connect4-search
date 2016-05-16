(function () {
  'use strict';

  const AI_MARK = false,
        LOOK_AHEAD = 6,
        ACTIONS = [0, 1, 2, 3, 4, 5, 6],
        BOARD_LINES = 6,
        BOARD_COLUMNS = 7,
        OBJECTIVE = 4,
        USE_TRANSPOSITION = true;

  var transpositionTable = new connect4.TranspositionTable(),
      verifier;

  function Node(parent, action, player) {
    this.parent = parent;
    this.depth = parent ? parent.depth + 1 : 0;

    function getFirstLineAvailableOnColumn(state, column) {
      var i = 0;
      while (i < BOARD_LINES && state[i][column] === null) i++;
      return i - 1;
    }

    function getStateFromMove() {
      var state = _.cloneDeep(parent.state),
          line = getFirstLineAvailableOnColumn(state, action);
      if (line < 0) return null;
      state[line][action] = player;
      return state;
    }

    if (parent) {
      this.move = {action: action, player: player};
      this.hash = transpositionTable.applyMoveToHash(parent.hash, getFirstLineAvailableOnColumn(parent.state, action), action, player);
      this.state = getStateFromMove();
    } else {
      this.state = [];
      this.hash = transpositionTable.getInitialBoard();
      for (let i = 0; i < 6; i++) {
        this.state[i] = [];
        for (let j = 0; j < 7; j++) {
          this.state[i][j] = null;
        }
      }
    }
  }

  function VerifierAutomaton() {
    const FINAL_STATE= 4,
          STATES = [
            {player: 1, null: 1, enemy: 0},
            {player: 2, null: 2, enemy: 0},
            {player: 3, null: 3, enemy: 0},
            {player: 4, null: 4, enemy: 0},
            {player: 4, null: 4, enemy: 0}
          ];

    var queue, state, evaluation;

    function getSymbolName(player, symbol) {
      if (symbol === null) {
        return 'null';
      }
      return symbol === player ? 'player' : 'enemy';
    }

    function restart() {
      queue = [];
      state = 0;
      evaluation = 0;
    }

    function execute(player, sequence, endGameData) {
      _.forEach(sequence, function (symbol, index) {
        state = STATES[state][getSymbolName(player, symbol)];
        if (state === 0) queue = [];
        else queue.push(symbol);
        if (state === FINAL_STATE) {
          let pointsAcquired = _.filter(queue, _.negate(_.isNull)).length;

          if (pointsAcquired === OBJECTIVE) {
            evaluation = Infinity;
            _.set(endGameData, 'winner', player);
            _.set(endGameData, 'startsAt', index - OBJECTIVE + 1);
            return false;
          }

          evaluation += pointsAcquired;
          queue.shift();
        }
      });
    }

    this.evaluate = function (player, sequence, endGameData) {
      restart();
      execute(player, sequence, endGameData);
      return evaluation;
    }
  }

  function getChildren(node) {
    if (getEndOfGameData(node)) return [];
    return _.filter(_.map(ACTIONS, function (action) {
      var child = new Node(node, action, !node.move.player);
      return child.state ?  child : null;
    }), _.negate(_.isNull));
  }

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
    while (i < BOARD_LINES && j < BOARD_COLUMNS) {
      sequence.push(state[i++][j++]);
    }
    return verifier.evaluate(player, sequence, endGameData);
  }

  function evaluateDiagonalLeft(state, lineNumber, columnNumber, player, endGameData) {
    var i = lineNumber, j = columnNumber, sequence = [];
    while (i < BOARD_LINES && j < BOARD_COLUMNS) {
      sequence.push(state[i++][j--]);
    }
    return verifier.evaluate(player, sequence, endGameData);
  }

  function evaluateLines(state, player, endGameData) {
    var i = 0, evaluation = 0;
    while(i < BOARD_LINES && evaluation < Infinity) {
      evaluation += evaluateLine(state, i, player, endGameData);
      i++;
    }
    if (evaluation === Infinity && endGameData) endGameData.line = i - 1;
    return evaluation;
  }

  function evaluateColumns(state, player, endGameData) {
    var i = 0, evaluation = 0;
    while(i < BOARD_COLUMNS && evaluation < Infinity) {
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
    var evaluation;
    verifier = verifier || new VerifierAutomaton();
    evaluation = evaluateLines(state, player, endGameData);
    if (evaluation < Infinity) evaluation += evaluateColumns(state, player, endGameData);
    if (evaluation < Infinity) evaluation += evaluateRightDiagonals(state, player, endGameData);
    if (evaluation < Infinity) evaluation += evaluateLeftDiagonals(state, player, endGameData);
    return evaluation;
  }

  function getEndOfGameData(node) {
    var isBoardFull = !_.filter(_.flatten(node.state), _.isNull).length,
        endGameData = {};

    evaluateStateAccordingToPlayer(node.state, node.move.player, endGameData);

    if (_.has(endGameData, 'winner') || isBoardFull) return endGameData;
    return null;
  }

  function evaluate(node) {
    return evaluateStateAccordingToPlayer(node.state, AI_MARK) - evaluateStateAccordingToPlayer(node.state, !AI_MARK);
  }

  _.merge(window.connect4, {
    searchAgents: {
      minimax: new search.Minimax(evaluate, getChildren, LOOK_AHEAD, USE_TRANSPOSITION ? transpositionTable : undefined),
      alphaBeta: new search.AlphaBetaHardSoft(evaluate, getChildren, LOOK_AHEAD)
    },
    getEndOfGameData: getEndOfGameData,
    Node: Node,
    AI_MARK: AI_MARK,
    OBJECTIVE: OBJECTIVE
  });

}());

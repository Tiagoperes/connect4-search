(function () {
  'use strict';

  var conf = connect4.config;

  function getFirstLineAvailableOnColumn(state, column) {
    var i = 0;
    while (i < conf.BOARD_LINES && state[i][column] === null) i++;
    return i - 1;
  }

  function getNextState(previousState, action, player) {
    var state = _.cloneDeep(previousState),
        line = getFirstLineAvailableOnColumn(state, action);

    if (line < 0) return null;

    state[line][action] = player;
    return state;
  }

  function getInitialState() {
    var state = [];

    for (let i = 0; i < conf.BOARD_LINES; i++) {
      state[i] = [];
      for (let j = 0; j < conf.BOARD_COLUMNS; j++) {
        state[i][j] = null;
      }
    }

    return state;
  }

  function getStartingNode() {
    return {
      state: getInitialState(),
      hash: connect4.TranspositionTable.getInitialStateHash(),
      depth: 0
    }
  }

  function getChildNode(parent, action, player) {
    var line = getFirstLineAvailableOnColumn(parent.state, action);

    return {
      move: {action: action, player: player},
      hash: connect4.TranspositionTable.applyMoveToHash(parent.hash, line, action, player),
      state: getNextState(parent.state, action, player),
      parent: parent,
      depth: parent.depth + 1
    };
  }

  function Node(parent, action, player) {
    _.merge(this, parent ? getChildNode(parent, action, player) : getStartingNode());
  }

  connect4.Node = Node;
}());

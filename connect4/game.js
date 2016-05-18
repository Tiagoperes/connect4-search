(function () {
  'use strict';

  var conf = connect4.config;

  var searchAgents = {
    minimax: function (evaluator, transpositionTable) {
      return new search.Minimax(
        evaluator.evaluate,
        _.partial(getChildren, evaluator),
        conf.LOOK_AHEAD,
        transpositionTable
      );
    },
    alphaBetaHardSoft: function (evaluator) {
      return new search.AlphaBetaHardSoft(
        evaluator.evaluate,
        _.partial(getChildren, evaluator),
        conf.LOOK_AHEAD
      );
    }
  };

  function getChildren(evaluator, node) {
    if (evaluator.getEndGameData(node)) return [];
    return _.filter(_.map(conf.ACTIONS, function (action) {
      var child = new connect4.Node(node, action, !node.move.player);
      return child.state ? child : null;
    }), _.negate(_.isNull));
  }

  function getSearchAgent(evaluator) {
    var transpositionTable = conf.useTransposition ? new connect4.TranspositionTable() : undefined;
    return searchAgents[conf.searchAgent](evaluator, transpositionTable);
  }

  function isActionAllowed(state, action) {
    return state[0][action] === null;
  }

  function Game() {
    var evaluator = new connect4.Evaluator(),
        search = getSearchAgent(evaluator).search,
        currentStateNode = new connect4.Node(),
        Node = connect4.Node,
        ai = conf.AI_MARK,
        human = !ai,
        endGameData;

    function makeHumanMove(action, callback) {
      if (isActionAllowed(currentStateNode.state, action)) {
        currentStateNode = new Node(currentStateNode, action, human);
        if (callback) callback();
      }
    }

    function makeAIMove(callback) {
      currentStateNode.depth = 0;
      currentStateNode = search(currentStateNode);
      endGameData = evaluator.getEndGameData(currentStateNode);
      if (callback) callback();
    }

    this.makeMove = function (action, afterHuman, afterAI) {
      makeHumanMove(action, afterHuman);
      setTimeout(_.partial(makeAIMove, afterAI), 1);
    };

    this.getCurrentStateNode = function () {
      return currentStateNode;
    };

    this.getEndGameData = function () {
      return endGameData;
    };
  }

  connect4.Game = Game;

}());

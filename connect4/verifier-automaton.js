(function () {
  'use strict';

  const FINAL_STATE= 4,
        STATES = [
          {player: 1, null: 1, enemy: 0},
          {player: 2, null: 2, enemy: 0},
          {player: 3, null: 3, enemy: 0},
          {player: 4, null: 4, enemy: 0},
          {player: 4, null: 4, enemy: 0}
        ];

  var conf = connect4.config;

  function getSymbolName(player, symbol) {
    if (symbol === null) {
      return 'null';
    }
    return symbol === player ? 'player' : 'enemy';
  }

  function evaluateSequence(sequence) {
    return _.filter(sequence, _.negate(_.isNull)).length;
  }

  function setEndGameData(player, index, endGameData) {
      _.set(endGameData, 'winner', player);
      _.set(endGameData, 'startsAt', index - conf.OBJECTIVE + 1);
  }

  function VerifierAutomaton() {
    var queue, state, evaluation;

    function restart() {
      queue = [];
      state = 0;
      evaluation = 0;
    }

    function performFinalStateActions(player, index, endGameData) {
      var pointsAcquired = evaluateSequence(queue);

      if (pointsAcquired === conf.OBJECTIVE) {
        setEndGameData(player, index, endGameData);
        evaluation = Infinity;
        return false;
      }

      evaluation += pointsAcquired;
      queue.shift();
      return true;
    }

    function execute(player, sequence, endGameData) {
      _.forEach(sequence, function (symbol, index) {
        state = STATES[state][getSymbolName(player, symbol)];

        if (state === 0) queue = [];
        else queue.push(symbol);

        if (state === FINAL_STATE) {
          return performFinalStateActions(player, index, endGameData);
        }
      });
    }

    this.evaluate = function (player, sequence, endGameData) {
      restart();
      execute(player, sequence, endGameData);
      return evaluation;
    }
  }

  connect4.VerifierAutomaton = VerifierAutomaton;
}());

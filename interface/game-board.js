(function () {
  'use strict';

  var conf = connect4.config,
      game;

  function initialize() {
    createMoveControls();
    createResetButtonBehavior();
    reset();
  }

  function reset() {
    game = new connect4.Game();
    printState();
    hideEndGame();
    unblock();
    connect4.controller.searchTree.erase();
  }

  function unblock() {
    $('#game table').removeAttr('style');
  }

  function block() {
    $('#game table').css('pointer-events', 'none');
  }

  function wait() {
    $('body, #game td').css('cursor', 'wait');
  }

  function ready() {
    $('body, #game td').removeAttr('style');
  }

  function afterHumanMove(time) {
    printState();
    wait();
    time.start = new Date();
  }

  function afterAIMove(time) {
    time.end = new Date();
    printState();
    connect4.controller.searchTree.print(game.getCurrentStateNode(), time);
    verifyEndGame();
    ready();
  }

  function createMoveControls() {
    $('#game td').click(function (ev) {
      var column = $(ev.target).attr('data-index').split(',')[1],
          time = {};

      game.makeMove(column, _.partial(afterHumanMove, time), _.partial(afterAIMove, time));
    });
  }

  function createResetButtonBehavior() {
    $('#restart').click(reset);
  }

  function printSymbolAt(symbol, line, column) {
    $('#game td[data-index="' + line + ',' + column + '"]').attr('class', 'symbol symbol-' + symbol);
  }

  function printState() {
    var state = game.getCurrentStateNode().state;

    _.forEach(state, function (line, i) {
      _.forEach(line, function (value, j) {
        var symbol = connect4.controller.symbolConverter.toSymbol(value);
        printSymbolAt(symbol, i, j);
      });
    });
  }

  function hideEndGame() {
    $('#resultPanel').removeAttr('class');
  }

  function showWinner(winner) {
    var classes = {};
    classes[conf.AI_MARK] = 'lose';
    classes[!conf.AI_MARK] = 'win';
    classes['undefined'] = 'draw';
    $('#resultPanel').addClass('visible ' + classes[winner]);
  }

  function showEndGame(endGameData) {
    showWinner(endGameData.winner);
    connect4.controller.boardHighlighter.highlightWinningSequence(endGameData);
    block();
  }

  function verifyEndGame() {
    var endGameData = game.getEndGameData();
    if (endGameData) {
      showEndGame(endGameData);
    }
  }

  connect4.controller.gameBoard = {
    reset: reset
  };

  initialize();
}());

(function () {
  'use strict';

  var conf = connect4.config;

  function getHighlightedLine(line, startsAt) {
    var highlight = [];
    for (let i = 0; i < conf.OBJECTIVE; i++) {
      highlight.push([line, i + startsAt]);
    }
    return highlight;
  }

  function getHighlightedColumn(column, startsAt) {
    var highlight = [];
    for (let i = 0; i < conf.OBJECTIVE; i++) {
      highlight.push([i + startsAt, column]);
    }
    return highlight;
  }

  function getHighlightedDiagonalRight(line, column, startsAt) {
    var highlight = [];
    for (let i = 0; i < conf.OBJECTIVE; i++) {
      highlight.push([line + i + startsAt, column + i + startsAt]);
    }
    return highlight;
  }

  function getHighlightedDiagonalLeft(line, column, startsAt) {
    var highlight = [];
    for (let i = 0; i < conf.OBJECTIVE; i++) {
      highlight.push([line + startsAt + i, column - startsAt - i]);
    }
    return highlight;
  }

  function getPositionsToHighlight(endGameData) {
    var types = ['line', 'column', 'diagonalRight', 'diagonalLeft'],
        type = _.intersection(_.keys(endGameData), types)[0],
        actions = {
          line: _.partial(getHighlightedLine, endGameData.line, endGameData.startsAt),
          column: _.partial(getHighlightedColumn, endGameData.column, endGameData.startsAt),
          diagonalRight: _.partial(getHighlightedDiagonalRight, _.head(endGameData.diagonalRight), _.last(endGameData.diagonalRight), endGameData.startsAt),
          diagonalLeft: _.partial(getHighlightedDiagonalLeft, _.head(endGameData.diagonalLeft), _.last(endGameData.diagonalLeft), endGameData.startsAt)
        };

    return actions[type]();
  }

  function addClassToBoardPosition(styleClass, line, column) {
    $('#game td[data-index="' + line + ',' + column + '"]').addClass(styleClass);
  }

  function highlightWinningSequence(endGameData) {
    var positions = getPositionsToHighlight(endGameData);
    _.forEach(positions, function (position) {
      addClassToBoardPosition('winning-path', position[0], position[1])
    });
  }

  connect4.controller.boardHighlighter = {
    highlightWinningSequence: highlightWinningSequence
  };

}());

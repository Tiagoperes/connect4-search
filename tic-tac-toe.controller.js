(function () {
  'use strict';

  var node, player, searchMethod;

  function start() {
    restartGame();
    searchMethod = 'minimax';
    bindSearchMethodSelector();
    bindGameActions();
    bindRestartButton();
  }

  function restartGame() {
    node = new connect4.Node();
    player = !connect4.AI_MARK;
    printState();
    $('#resultPanel').hide();
    $('.result').hide();
    $('#searchTree').html('');
    $('#game table').removeAttr('style');
  }

  function bindSearchMethodSelector() {
    $('#searchMethodSelector').change(function () {
      searchMethod = $(this).val();
      restartGame();
    });
  }

  function bindRestartButton() {
    $('#restart').click(function () {
      restartGame();
      $('#resultPanel').hide();
    });
  }

  function toSymbol(value) {
    var hash = {
      'false': 'ai',
      'true': 'human',
      'null': 'empty'
    };
    return hash[value];
  }

  function printState() {
    _.forEach(node.state, function (line, i) {
      _.forEach(line, function (value, j) {
        var symbol = toSymbol(value);
        $('#game td[data-index="' + i + ',' + j + '"]').attr('class', 'symbol symbol-' + symbol);
      });
    });
  }

  function stateToHtml(state, isChosen) {
    var chosenClass = isChosen ? 'chosen': '',
        html = '<table class="board ' + chosenClass + '">';

    _.forEach(state, function (line, indexLine) {
      html += '<tr>';
      _.forEach(line, function (column, indexColumn) {
        var symbol = toSymbol(column);
        html += '<td class="symbol symbol-' + symbol + '"></td>'
      });
      html += '</tr>';
    });

    return $(html + '</table>');
  }

  function expandTreeNode(item, treeNode) {
    var subList;
    item.append('<ul></ul>');
    subList = item.find('ul');
    _.forEach(treeNode.children, function (child) {
      printTreeNode(subList, child, treeNode.chosen === child);
    });
    item.addClass('expanded');
  }

  function collapseTreeNode(item) {
    item.find('ul:first').remove();
    item.removeClass('expanded');
  }

  function bindExpandButton(parentList, treeNode) {
    var item = $(parentList.find('li').last());
    item.find('button').click(function () {
      return item.hasClass('expanded') ? collapseTreeNode(item) : expandTreeNode(item, treeNode);
    });
  }

  function truncate(number) {
    return Math.floor(number * 1000) / 1000;
  }

  function getCutData(treeNode) {
    if (treeNode.evaluation === undefined && _.isEmpty(treeNode.children)) {
      if (treeNode.depth % 2) {
        return '<div class="node-data-item node-cut-beta"><i class="fa fa-scissors"></i>poda &beta;</div>';
      }
      return '<div class="node-data-item node-cut-alpha"><i class="fa fa-scissors"></i>poda &alpha;</div>';
    }
    return '';
  }

  function getMinMaxData(treeNode) {
    var isMax = treeNode.depth % 2 === 0,
        interval = treeNode.max !== undefined ? (' [' + truncate(treeNode.min) + ', ' + truncate(treeNode.max) + ']') : '';

    if (isMax && !_.isEmpty(treeNode.children)) {
      return '<div class="node-data-item node-max"><i class="fa fa-arrow-up"></i>max' + interval + '</div>';
    }
    if (!isMax && !_.isEmpty(treeNode.children)) {
      return '<div class="node-data-item node-min"><i class="fa fa-arrow-down"></i>min' + interval + '</div>';
    }
    return '';
  }

  function getEvaluationData(treeNode) {
    if (treeNode.evaluation !== undefined) {
      return '<div class="node-data-item node-evaluation"><i class="fa fa-heartbeat"></i>' + truncate(treeNode.evaluation) + '</div>';
    }
    return '';
  }

  function getNodeData(treeNode) {
    return '<div class="node-data">' + getEvaluationData(treeNode) + getMinMaxData(treeNode) + getCutData(treeNode) + '</div>';
  }

  function printTreeNode(parentList, treeNode, isChosen) {
    var board = stateToHtml(treeNode.state, isChosen),
        nodeData = getNodeData(treeNode),
        button = _.isEmpty(treeNode.children) ? '' : '<button class="expand-button"></button>',
        item = '<li></li>';

    parentList.append($(item).append(board).append(nodeData).append(button));
    bindExpandButton(parentList, treeNode);
  }

  function formatTime(msTime) {
    if (msTime < 1000) return msTime + 'ms';
    if (msTime < 60000) return (msTime / 1000).toFixed(3) + 's';
    if (msTime < 3600000) return (msTime / 60000).toFixed(3) + 'min';
    return (msTime / 3600000).toFixed(3) + 'hrs';
  }

  function printTimeTaken(timeTaken) {
    var icon = '<i class="fa fa-clock-o"></i>',
        time = formatTime(timeTaken),
        timeDiv = '<div class="time-taken">' + icon + time + '</div>';
    $('#searchTree').append(timeDiv);
  }

  function printSearchTree(timeTaken) {
    $('#searchTree').html('');
    printTreeNode($('#searchTree'), node.parent);
    printTimeTaken(timeTaken);
  }

  function bindGameActions() {
    $('#game td').click(function (ev) {
      var column = $(ev.target).attr('data-index').split(',')[1];
      if (player === !connect4.AI_MARK && node.state[0][column] === null) {
        node = new connect4.Node(node, column, player);
        printState();
        player = !player;
        $('body, #game td').css('cursor', 'wait');
        //verifyEndGame();
        setTimeout(playAI);
      }
    });
  }

  function getHilightedLine(line, startsAt) {
    var hilight = [];
    for (let i = 0; i < connect4.OBJECTIVE; i++) {
      hilight.push([line, i + startsAt]);
    }
    return hilight;
  }

  function getHilightedColumn(column, startsAt) {
    var hilight = [];
    for (let i = 0; i < connect4.OBJECTIVE; i++) {
      hilight.push([i + startsAt, column]);
    }
    return hilight;
  }

  function getHilightedDiagonalRight(line, column, startsAt) {
    var hilight = [];
    for (let i = 0; i < connect4.OBJECTIVE; i++) {
      hilight.push([line + i + startsAt, column + i + startsAt]);
    }
    return hilight;
  }

  function getHilightedDiagonalLeft(line, column, startsAt) {
    var hilight = [];
    for (let i = 0; i < connect4.OBJECTIVE; i++) {
      hilight.push([line + startsAt + i, column - startsAt - i]);
    }
    return hilight;
  }

  function getPositionsToHilight(endGameData) {
    var types = ['line', 'column', 'diagonalRight', 'diagonalLeft'],
        type = _.intersection(_.keys(endGameData), types)[0],
        actions = {
          line: _.partial(getHilightedLine, endGameData.line, endGameData.startsAt),
          column: _.partial(getHilightedColumn, endGameData.column, endGameData.startsAt),
          diagonalRight: _.partial(getHilightedDiagonalRight, _.head(endGameData.diagonalRight), _.last(endGameData.diagonalRight), endGameData.startsAt),
          diagonalLeft: _.partial(getHilightedDiagonalLeft, _.head(endGameData.diagonalLeft), _.last(endGameData.diagonalLeft), endGameData.startsAt)
        };

    return actions[type]();
  }

  function hilightWinningSequence(endGameData) {
    var positions = getPositionsToHilight(endGameData);
    _.forEach(positions, function (position) {
      $('#game td[data-index="' + position[0] + ',' + position[1] + '"]').addClass('winning-path');
    });
  }

  function endGame(endGameData) {
    $('#resultPanel').show();
    hilightWinningSequence(endGameData);
    $('#game table').css('pointer-events', 'none');
  }

  function verifyEndGame() {
    var endOfGameData = connect4.getEndOfGameData(node);

    if (!endOfGameData) return;

    if (endOfGameData.winner === connect4.AI_MARK) {
      $('.result.lose').show();
    } else if (endOfGameData.winner === !connect4.AI_MARK) {
      $('.result.win').show();
    } else {
      $('.result.draw').show();
    }

    endGame(endOfGameData);
  }

  function playAI() {
    var started, ended;
    node.depth = 0;
    started = new Date();
    node = connect4.searchAgents[searchMethod].search(node);
    ended = new Date();
    printState();
    printSearchTree(ended.getTime() - started.getTime());
    verifyEndGame();
    player = !player;
    $('body, #game td').removeAttr('style');
  }

  start();
}());

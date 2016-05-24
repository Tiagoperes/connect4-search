(function () {
  'use strict';

  function stateToHtml(state, isChosen) {
    var chosenClass = isChosen ? 'chosen': '',
        html = '<table class="board ' + chosenClass + '">';

    _.forEach(state, function (line) {
      html += '<tr>';
      _.forEach(line, function (column) {
        var symbol = connect4.controller.symbolConverter.toSymbol(column);
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

  function getTranspositionData(treeNode) {
    if (treeNode.transposition) {
      return '<div class="node-data-item node-transposition"><i class="fa fa-table"></i>transposition</div>';
    }
    return '';
  }

  function getNodeData(treeNode) {
    return '<div class="node-data">' +
      getEvaluationData(treeNode) +
      getMinMaxData(treeNode) +
      getCutData(treeNode) +
      getTranspositionData(treeNode) +
      '</div>';
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
        timeDiv = '<div class="bottom-info time-taken">' + icon + time + '</div>';

    $('#searchTree').append(timeDiv);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + 'kB';
    return (bytes / 1048576).toFixed(2) + 'mB';
  }

  function printTranspositionTableSize(transpositionTableBytes) {
    var icon, size, sizeDiv;
    if (transpositionTableBytes) {
      icon = '<i class="fa fa-table"></i>';
      size = formatBytes(transpositionTableBytes);
      sizeDiv = '<div class="bottom-info table-size">' + icon + size + '</div>';
      $('#searchTree').append(sizeDiv);
    }
  }

  function eraseSearchTree() {
    $('#searchTree').html('');
  }

  function printSearchTree(node, time, transpositionTableBytes) {
    eraseSearchTree();
    printTreeNode($('#searchTree'), node.parent);
    printTimeTaken(time.end - time.start);
    printTranspositionTableSize(transpositionTableBytes);
  }

  connect4.controller.searchTree = {
    erase: eraseSearchTree,
    print: printSearchTree
  };
}());

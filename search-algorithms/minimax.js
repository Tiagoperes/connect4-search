(function () {
  'use strict';

  window.search = window.search || {};

  search.Minimax = function (evaluate, getChildren, maxDepth, transpositionTable) {

    function getMaxDepth(node) {
      if (_.isEmpty(node.children)) {
        return 0;
      }
      return 1 + _.max(_.forEach(node.children, getMaxDepth));
    }

    function calculateBestChild(children, depth, compare) {
      var best = compare(children, function (child) {
        child.evaluation = search(child, depth).evaluation;
        return child.evaluation;
      });
      return _.maxBy(_.filter(children, {evaluation: best.evaluation}), getMaxDepth);
    }

    function evaluateLeafAccordingToTranspositionTable(node) {
      node.evaluation = transpositionTable.get(node.hash);
      if (!node.evaluation) {
        node.evaluation = evaluate(node);
        node.transposition = false;
        transpositionTable.set(node.hash, node.evaluation);
      } else {
        node.transposition = true;
      }
      return node;
    }

    function evaluateLeaf(node) {
      if (transpositionTable) {
        return evaluateLeafAccordingToTranspositionTable(node);
      }
      node.evaluation = evaluate(node);
      return node;
    }

    function search(node, depth) {
      var children = getChildren(node),
          isLeaf = !children.length,
          isDepthValid = depth < maxDepth,
          isMaxLevel = depth % 2 == 0;

      if (isLeaf || !isDepthValid) {
        return evaluateLeaf(node);
      }

      if (isMaxLevel) {
        node.chosen = calculateBestChild(children, depth + 1, _.maxBy);
      } else {
        node.chosen = calculateBestChild(children, depth + 1, _.minBy);
      }

      node.children = children;
      return node.chosen;
    }

    this.search = _.partial(search, _, 0);
  };

}());

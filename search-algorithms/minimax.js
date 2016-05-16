(function () {
  'use strict';

  window.search = window.search || {};

  search.Minimax = function (evaluate, getChildren, maxDepth, transpositionTable) {

    function calculateBestChild(children, depth, compare) {
      return compare(children, function (child) {
        child.evaluation = search(child, depth).evaluation;
        if (transpositionTable) {
          transpositionTable.set(child.hash, child.evaluation);
        }
        return child.evaluation;
      });
    }

    function search(node, depth) {
      var children = getChildren(node),
          isLeaf = !children.length,
          isDepthValid = depth < maxDepth,
          isMaxLevel = depth % 2 == 0;

      if (transpositionTable && depth > 0) {
        let evaluation = transpositionTable.get(node.state, node.hash);
        if (evaluation) {
          node.evaluation = evaluation;
          return node;
        }
      }

      if (isLeaf || !isDepthValid) {
        node.evaluation = evaluate(node);
        return node;
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

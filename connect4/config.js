(function () {
  'use strict';

  window.connect4 = {
    config: {
      AI_MARK: false,
      LOOK_AHEAD: 4,
      ACTIONS: [0, 1, 2, 3, 4, 5, 6],
      BOARD_LINES: 6,
      BOARD_COLUMNS: 7,
      OBJECTIVE: 4,
      SEARCH_AGENTS: {minimax: 'Minimax', alphaBetaHardSoft: 'Alpha-beta HS', alphaBetaFailSoft: 'Alpha-beta FS'},
      useTransposition: false,
      searchAgent: 'minimax'
    }
  };
}());

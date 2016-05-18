(function () {
  'use strict';

  function toSymbol(value) {
    var hash = {
      'false': 'ai',
      'true': 'human',
      'null': 'empty'
    };
    return hash[value];
  }

  connect4.controller.symbolConverter = {
    toSymbol: toSymbol
  }
}());

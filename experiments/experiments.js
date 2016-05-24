(function () {
  'use strict';

  const MOVES = [3, 3, 3, 0, 1, 1, 1, 5, 5, 5, 5, 2, 0, 6, 4, 6, 6, 4, 2, 6, 6],
        EXPECTED_HASH_SEQUENCE = [2702321108742268000, 2702321673730481000, 2702321673730599400, 2952479399225598000,
          2952616691361387500, 2952616691390092000, 3402900597281089000, 31770786668413920000, 31781907331412857000,
          31781907333737910000, 31783760353926762000, 31784195012983407000, 31784195033908896000, 104730187882393670000,
          104730189577358300000, 104763543940757640000, 104763559195439380000, 104763559195439740000,
          104763559195525860000, 104763559195529050000, 104763559195529050000];

  function play(algorithm, lookahead, useTransposition) {
    var game, start, hashSequence, deferred;

    adjustSettings(algorithm, lookahead, useTransposition);

    game = new connect4.Game();
    start = new Date();
    hashSequence = [];
    deferred = $.Deferred();

    makeMove(game, _.clone(MOVES), hashSequence, function () {
      deferred.resolve({
        time: new Date().getTime() - start.getTime(),
        hashSequence: hashSequence,
        winner: game.getEndGameData().winner
      });
    });

    return deferred;
  }

  function adjustSettings(algorithm, lookahead, useTransposition) {
    connect4.config.searchAgent = algorithm;
    connect4.config.LOOK_AHEAD = lookahead;
    connect4.config.useTransposition = useTransposition;
  }

  function makeMove(game, moves, hashSequence, callback) {
    if (game.getEndGameData()) return callback();
    game.makeMove(moves.shift(), undefined, function () {
      console.log((MOVES.length - moves.length) + ' of ' + MOVES.length);
      hashSequence.push(game.getCurrentStateNode().hash);
      makeMove(game, moves, hashSequence, callback);
    });
  }

  function isCorrect(hashSequence) {
    return _.isEqual(hashSequence, EXPECTED_HASH_SEQUENCE);
  }

  function printResult(result) {
    console.log('\n\n--------------------------------------------------------------');
    console.log(result.title);
    console.log('--------------------------------------------------------------');
    console.log('tempo gasto: ' + result.time + 'ms');
    console.log('vencedor: ' + result.winner);
    console.log('correto: ' + (isCorrect(result.hashSequence) ? 'sim' : 'não'));

  }

  function playAndStoreResult(results, algorithm, lookeahead, useTransposition, title) {
    console.log('playing: ' + algorithm + '; lookahead=' + lookeahead + '; trasposition=' + useTransposition);
    return play(algorithm, lookeahead, useTransposition).then(function (result) {
      result.title = title;
      results.push(result);
    });
  }

  function runAll() {
    var results = [];
    playAndStoreResult(results, 'minimax', 4, false, 'Minimax com lookahead 4 sem transposição:')
      .then(_.partial(playAndStoreResult, results, 'minimax', 4, true, 'Minimax com lookahead 4 com transposição:'))
      .then(_.partial(playAndStoreResult, results, 'alphaBetaHardSoft', 4, false, 'Alpha Beta Hard Soft com lookahead 4 sem transposição:'))
      .then(function () {
        console.log('finished.\n\nResults:\n');
        _.forEach(results, printResult);
      });
  }

  window.experiments = {
    play: play,
    runAll: runAll
  };
}());

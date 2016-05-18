(function () {
  'use strict';

  var conf = connect4.config;

  function initialize() {
    //bindSearchMethodSelector();
    createTranspositionToggle();
    createLookaheadControl();
  }

  function createTranspositionToggle() {
    $('.ai-options .checkbox').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
      } else {
        $(this).addClass('active');
      }
    });
  }

  function updateLookaheadText() {
    $('#lookahead').html('Lookahead ' + conf.LOOK_AHEAD);
  }

  function createLookaheadControl() {
    $('.ai-options .number-selector .up').click(function () {
      conf.LOOK_AHEAD++;
      updateLookaheadText();
    });

    $('.ai-options .number-selector .down').click(function () {
      conf.LOOK_AHEAD--;
      updateLookaheadText();
    });
  }

  //function bindSearchMethodSelector() {
  //  $('#searchMethodSelector').change(function () {
  //    connect4.conf.searchAgent = $(this).val();
  //    connect4.controller.gameBoard.reset();
  //  });
  //}

  initialize();
}());

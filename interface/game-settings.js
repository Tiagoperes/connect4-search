(function () {
  'use strict';

  var conf = connect4.config,
      newConfig = _.pick(conf, ['useTransposition', 'LOOK_AHEAD', 'searchAgent']);

  function initialize() {
    createTranspositionToggle();
    createLookaheadControl();
    createSearchMethodSelection();
    bindApplySettingsButton();
    updateTranspositionToggle();
    updateLookaheadText();
    updateSearchMethodTextAndOptions();
  }

  function verifyApplyButton() {
    var originalConfig = _.pick(conf, ['useTransposition', 'LOOK_AHEAD', 'searchAgent']);
    if (_.isEqual(originalConfig, newConfig)) {
      $('.apply-settings').attr('disabled', '');
    } else {
      $('.apply-settings').removeAttr('disabled');
    }
  }

  function createTranspositionToggle() {
    $('.ai-options .checkbox').click(function () {
      newConfig.useTransposition = !newConfig.useTransposition;
      updateTranspositionToggle();
      verifyApplyButton();
    });
  }

  function updateTranspositionToggle() {
    if (newConfig.useTransposition) {
      $('.ai-options .checkbox').addClass('active');
    } else {
      $('.ai-options .checkbox').removeClass('active');
    }
  }

  function updateLookaheadText() {
    $('#lookahead').html('Lookahead ' + newConfig.LOOK_AHEAD);
  }

  function updateSearchMethodTextAndOptions() {
    $('#searchMethod').html(conf.SEARCH_AGENTS[newConfig.searchAgent]);
    $('.ai-options .select .options li').show();
    $('.ai-options .select .options li[value="' + newConfig.searchAgent + '"]').hide();
  }

  function createLookaheadControl() {
    $('.ai-options .number-selector .up').click(function () {
      newConfig.LOOK_AHEAD++;
      updateLookaheadText();
      verifyApplyButton();
    });

    $('.ai-options .number-selector .down').click(function () {
      if (newConfig.LOOK_AHEAD > 1) {
        newConfig.LOOK_AHEAD--;
        updateLookaheadText();
        verifyApplyButton();
      }
    });
  }

  function closeMethodSelection(evt) {
    if (!evt || !$('.ai-options .select .options').has(evt.target).length) {
      $('.ai-options .select').removeClass('show-options');
      $(document).unbind('click', closeMethodSelection);
    }
  }

  function openMethodSelection(evt) {
    $('.ai-options .select').addClass('show-options');
    createCloseMethodSelectionBehavior();
    evt.stopPropagation();
  }

  function createCloseMethodSelectionBehavior() {
    $(document).click(closeMethodSelection);
  }

  function createOpenCloseBehavior() {
    $('.ai-options .select').click(function (evt) {
      if ($(this).hasClass('show-options')) {
        closeMethodSelection(evt);
      } else {
        openMethodSelection(evt);
      }
    });
  }

  function createChangeSelectionBehavior() {
    $('.ai-options .select .options li').click(function (evt) {
      newConfig.searchAgent = $(this).attr('value');
      closeMethodSelection();
      updateSearchMethodTextAndOptions();
      verifyApplyButton();
      evt.stopPropagation();
    });
  }

  function createSearchOptions() {
    var opts = _.reduce(conf.SEARCH_AGENTS, function (code, agentName, agentValue) {
      return code + '<li value="' + agentValue + '">' + agentName + '</li>';
    }, '');
    $('.ai-options .select .options').html(opts);
  }

  function createSearchMethodSelection() {
    createSearchOptions();
    createOpenCloseBehavior();
    createChangeSelectionBehavior();
  }

  function bindApplySettingsButton() {
    $('.apply-settings').click(function () {
      _.merge(conf, newConfig);
      verifyApplyButton();
      connect4.controller.gameBoard.reset();
    });
  }

  initialize();
}());

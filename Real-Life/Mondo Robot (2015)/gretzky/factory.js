;
(function($, window, document, undefined) {

  // List of widgets available
  // Keys are the data-widget values to search for on the page
  // Values are the corresponding $.widget to apply
  var WIDGET_DEFINITIONS = {
      // 'switch': 'switchwidget' //  ->  $('[data-widget="switch"]').switchwidget();
    },
    onBefore = [],
    onComplete = [],
    refreshDebounceThresh = 200,
    $body = $(document.body);


  /**
   * Debounces the Factory refresh call back to `refreshDebounceThresh`ms
   *
   * @param  {jQuery} $container Optional container to target upon refresh
   * @return {void}
   */
  function debounceRefresh($container) {
    // no container = use body
    if (!$container) {
      $container = $body;
      // no $ wrapper = wrap it
    } else if (!($container instanceof $)) {
      $container = $($container);
    }

    // figure out times etc
    var self = this,
      now = (+new Date),
      last = $container.data('lastRefresh') || -99999,
      dif = now - last;

    // save this as the last time a refresh was requested
    $container.data('lastRefresh', now);

    // if we're still under the refresh Debounce
    if (dif < refreshDebounceThresh) {
      return;
    }

    refresh($container);
  }

  /**
   * Main factory function
   * Looks through provided container (or body) and refreshes/inits widgets
   * @param  {JQuery} $container Optional container to init widgets in (defaults to document.body)
   * @return {void}
   */
  function refresh($container) {
    // no container = use body
    if (!$container) {
      $container = $body;
      // no $ wrapper = wrap it
    } else if (!($container instanceof $)) {
      $container = $($container);
    }

    // run any `onBefore` functions
    executeBefores($container);

    // temp loop variables
    var $v, j,
      widgetRequest,
      widgetNames,
      widgetDefinition,
      /**
       * Function to find widget declarations on an element,
       * and instantiate those widgets as necessary
       * (define it here since we use it for both children and the container)
       */
      initElWidget = function(i, v) {
        $v = $(v);
        // get the desired widget name from the el
        widgetRequest = $v.attr('data-widget') || '';

        // split by spaces so we can have multiple widgets on one element
        widgetNames = widgetRequest.split(' ');

        for (j = 0; j < widgetNames.length; j++) {
          // find any corresponding definitions
          widgetDefinition = _getDefinition(widgetNames[j]);
          // if there is a widget to apply here, do so
          // (don't have to check for previous instances,
          // as widget.refresh will be called)
          if (widgetDefinition) {
            try {
              $v[widgetDefinition]();
            } catch (e) {
              console && console.warn && console.warn('Factory : refresh : error instancing ' + widgetNames[j]);
            }
          }
        }
      };

    // find the widgets in the provided container and instantiate/refresh
    $container.find('[data-widget]').not('[data-no-init]').each(initElWidget);

    // check the container itself for a widget attr
    var thisWidget = $container.attr('data-widget')
    if (typeof thisWidget !== 'undefined' && thisWidget !== '') {
      // if so, just fire the same function we used for everything else
      initElWidget(null, $container[0]);
    }

    // run any `onComplete` functions
    executeCompletes($container);
  }

  /**
   * Utility function to find a widget definition
   * @param  {String} widgetName Widget definition to find
   * @return {false|String}             False if no definition found, else returns the corresponding $ widget to fire
   */
  function _getDefinition(widgetName) {
    // check for pre-defined names
    if (WIDGET_DEFINITIONS.hasOwnProperty(widgetName)) {
      return WIDGET_DEFINITIONS[widgetName];
      // else, check if $.widgetname will work anyway
    } else if ($.mondo.hasOwnProperty(widgetName)) {
      return widgetName;
      // else, there is no widget
    } else {
      console && console.warn && console.warn('WidgetFactory : _getDefinition : "' + widgetName + '" definition not found');
      return false;
    }
  }

  /**
   * Adds a function to fire before the Factory refreshes
   * @param {Function} fn    The callback function to fire before
   */
  function _addBefore(fn) {
    onBefore.push(fn);
  }

  /**
   * Executes the queue of onBefore items
   * @param  {Element} $target Element to pass as the onBefore argument
   * @return {void}
   */
  function executeBefores($target) {
    var thisBefore;
    for (var i = 0; i < onBefore.length; i++) {
      thisBefore = onBefore[i];
      thisBefore && thisBefore($target);
    }
  }

  /**
   * Adds a function to fire after the Factory refreshes
   * @param {Function} fn    The callback function to fire after
   */
  function _addComplete(fn) {
    onComplete.push(fn);
  }

  /**
   * Executes the queue of onComplete items
   * @param  {Element} $target Element to pass as the onComplete argument
   * @return {void}
   */
  function executeCompletes($target) {
    var thisComplete;
    for (var i = 0; i < onComplete.length; i++) {
      thisComplete = onComplete[i];
      thisComplete && thisComplete($target);
    }
  }

  /**
   * Expose the public function(s)
   * @type {Object}
   */
  window.WidgetFactory = {
    'refresh': debounceRefresh,
    '_refresh': refresh,
    // we expose our internal 'add' functions as more
    // conventional 'on' functions
    'onBefore': _addBefore,
    'onComplete': _addComplete
  };

})(jQuery, window, document);

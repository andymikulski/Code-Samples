;
(function($, window, document, undefined) {

  // List of widgets available
  // Keys are the data-widget values to search for on the page
  // Values are the corresponding $.widget to apply
  var WIDGET_DEFINITIONS = {
    // 'switch': 'switchwidget' //  ->  $('[data-widget="switch"]').switchwidget();
  };

  /**
   * Main factory function
   * Looks through provided container (or body) and refreshes/inits widgets
   * @param  {JQuery} $container Optional container to init widgets in (defaults to document.body)
   * @return {void}
   */
  function refresh($container) {
    // no container = use body
    if (!$container) {
      $container = $(document.body)
        // no $ wrapper = wrap it
    } else if (!($container instanceof $)) {
      $container = $($container);
    }

    // temp loop variables
    var $v, i,
      widgetRequest,
      widgetName,
      widgetDefinition;

    // find the widgets in the provided container and instantiate/refresh
    $container.find('[data-widget]').not('[data-no-init]').each(function(i, v) {
      $v = $(v);
      // get the desired widget name from the el
      widgetRequest = $v.attr('data-widget');

      widgetNames = widgetRequest.split(' ');

      for (i = 0; i < widgetNames.length; i++) {
        // find any corresponding definitions
        widgetDefinition = _getDefinition(widgetNames[i]);
        // if there is a widget to apply here, do so
        // (don't have to check for previous instances,
        // as widget.refresh will be called)
        if (widgetDefinition) {
          $v[widgetDefinition]();
        }
      }
    });
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
   * Expose the public function(s)
   * @type {Object}
   */
  window.WidgetFactory = {
    'refresh': refresh
  };

})(jQuery, window, document);

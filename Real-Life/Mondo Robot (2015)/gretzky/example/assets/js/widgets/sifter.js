;
(function($, window, document, undefined) {

  $.widget('mondo.sifter', $.mondo.base, {
    'options': {
      'additive': false
    },

    'currentFilters': '',
    '$controls': $(),
    '$items': $(),
    'filterThrottle': null,

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;

      widget.$controls = widget.element.find('[data-controls]');
      widget.$items = widget.element.find('[data-item]');
      widget._super('_create');
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;

      widget.bindControlEvents();
    },

    /**
     * Binds event listeners to this sifter's control widget
     * @return {void}
     */
    'bindControlEvents': function() {
      var widget = this,
        getActiveEvent = widget.generateUniqueEvent('toggle:active');

      widget.$controls.unbind(getActiveEvent).on(getActiveEvent, widget.receiveActive.bind(widget));
    },

    /**
     * Control toggle:active event. Fired when they sifter's control widget has selected another value
     * Accepts a list of filters to apply and calls widget.filter
     * @param  {Event} event Event object
     * @param  {Object} data  Control-specific data object
     * @return {void}
     */
    'receiveActive': function(event, data) {
      var widget = this,
        receivedList = data.eventData.active,
        activeList = [];

      // it's a little sketchy pulling the 'active' list from the type data
      // passed through this event.. it should probably be tighter and just
      // straight up send the types
      for (var i = 0; i < receivedList.length; i++) {
        activeList.push(receivedList[i].elData.type);
      }

      // trigger the sifter to filter results
      widget.filter(activeList);
    },

    /**
     * Public filter function.
     * Throttles filterRequest calls to prevent tons of dom manipulation
     * @param  {[type]} list [description]
     * @return {[type]}      [description]
     */
    'filter': function(list) {
      var widget = this;

      // we wait 100ms to fire filterRequests
      if (widget.filterThrottle) {
        clearTimeout(widget.filterThrottle);
      }
      widget.filterThrottle = setTimeout((function(list) {
        return function() {
          widget.filterRequest(list);
        };
      })(list), 100);
    },

    /**
     * Internal filter function.
     * Accepts a list of types to search on and hides/shows elements
     * within the widget accordingly.
     * @param  {Array<String>} list Array of filter types to apply
     * @return {void}
     */
    'filterRequest': function(list) {
      var widget = this;

      // if 'all' is the only selected one,
      // just show them all
      if (list.length === 1 && list[0] === 'all') {
        widget.$items.show();
        return;
      }

      // hide them all (those staying won't be effected by this)
      widget.$items.hide();

      if (widget.options.additive) {
        // if we're additive we need to match elements with
        // exactly these filters.
        widget.$items.filter(widget.generateAdditiveSelector(list)).each(function(i, v) {
          // adding the element to $showing will allow us to batch
          // manipulate the elements later (performance boost)
          $(v).show();
        });
      } else {
        for (var i = 0; i < list.length; i++) {
          // if we're not additive, we just find all the items associated with provided types
          widget.$items.filter('[data-type*="' + list[i] + '"]').each(function(i, v) {
            $(v).show();
          });
        }
      }

      // emit that the filter has filtered
      widget.emit('sifter:has-filtered', {
        'additive': widget.options.additive,
        'array': list,
        'list': list.join(', ')
      });
    },

    /**
     * Utility function. Generates a selector string to find items with
     * an exact set of data-type values
     * @param  {Array<string>} list Array of types
     * @return {string}             Compiled selector string
     */
    'generateAdditiveSelector': function(list) {
      var widget = this,
        selector = '';

      for (var i = 0; i < list.length; i++) {
        selector += '[data-type' + (list.length > 1 ? '*' : '') + '="' + list[i] + '"]';
      }
      return selector;
    }
  });

})(jQuery, window, document);

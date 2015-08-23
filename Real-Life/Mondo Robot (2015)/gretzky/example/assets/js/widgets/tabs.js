;
(function($, window, document, undefined) {

  $.widget('mondo.tabs', $.mondo.base, {
    'options': {
      'index': 0,
    },

    'activeIndex': 0,
    'hasRun': false,
    '$toggle': $(),
    '$contents': $(),

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;

      widget._super('_create');
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this,
        $el = widget.element;

      // find the required elements
      widget.$toggle = $el.find('[data-widget="toggle"]');
      widget.$contents = $el.find('[data-content]');

      if (!widget.$toggle.length) {
        console && console.warn && console.warn('Tabs : no toggle element found');
        return;
      }
      if (!widget.$contents.length) {
        console && console.warn && console.warn('Tabs : no contents element found');
        return;
      }

      widget.bindTabController();
      widget.showContent(widget.options.index);
    },

    /**
     * Listen for events on the tab's toggle controller
     * @return {void}
     */
    'bindTabController': function() {
      var widget = this,
        changedEvent = widget.generateUniqueEvent('toggle:was-changed');

      widget.$toggle.unbind(changedEvent).on(changedEvent, widget.onTabChange.bind(widget));
    },

    /**
     * Tab's toggle:was-changed event handler
     * @param  {Object} event Event object
     * @param  {Object} data  Toggle event data
     * @return {void}
     */
    'onTabChange': function(event, data) {
      var widget = this;

      widget.showContent(data.index);
    },

    /**
     * Displays a section of content based on index provided
     * @param  {number} index Index of content to display
     * @return {void}
     */
    'showContent': function(index) {
      var widget = this;
      // dont do anything if we're already on this index
      if (widget.hasRun && index === widget.activeIndex) {
        return;
      }

      // hide all
      widget.$contents.hide();

      // after first run we animate content into place
      if (widget.hasRun) {
        Walt.animate({
          'el': widget.$contents.eq(index),
          'animation': 'fadeInUp',
          'duration': '350ms',
          'onBefore': function($el) {
            $el.show();
          }
        });
        // first run we just show it
      } else {
        widget.$contents.eq(index).show();
      }

      // broadcast a change vent
      widget.emit('tabs:change', {
        'index': index
      });

      // update current index etc
      widget.activeIndex = index;
      widget.hasRun = true;
    }
  });

})(jQuery, window, document);

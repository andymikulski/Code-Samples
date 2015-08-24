/**
 * TODO:
 * - Should use RAF as throttle and not a direct 'scroll' event
 */

;
(function($, window, document, undefined) {

  $.widget('mondo.sticky', $.mondo.base, {
    'options': {
      'class': 'is-stuck',
      'target': null
    },

    '$window': $(window),
    '$container': $(),
    '$clone': $(),

    // infinity will prevent stuff from being sticky at first
    'offsetTop': Infinity,

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

      widget.getParent();
      widget.updateOffsetTop();
      widget.setupClone();
      widget.bindWindow();
    },

    /**
     * Clone the element we're going to stickitize
     * @return {JQuery} Compiled $clone
     */
    'setupClone': function() {
      var widget = this,
        position = 'fixed';

      widget.$clone = widget.element.clone();
      widget.$clone
        .attr('data-no-init', true)
        .addClass('is-clone')
        .insertAfter(widget.element);

      if (widget.options.target === 'parent') {
        widget.$clone.addClass('has-parent');
      }

      return widget.$clone;
    },

    /**
     * Determine the relative parent we're going to measure the widget from
     * @return {JQuery} Found $container
     */
    'getParent': function() {
      var widget = this;
      if (widget.options.target === 'parent') {
        widget.$container = widget.element.offsetParent();
      } else if (!widget.options.target) {
        widget.$container = widget.$window;
      } else {
        widget.$container = $(widget.options.target);
      }

      return widget.$container;
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;

      if (!widget.$container.length) {
        return;
      }

      widget.updateOffsetTop();
    },

    /**
     * Binds scroll/resize events to the window
     * @return {void}
     */
    'bindWindow': function() {
      var widget = this,
        id = widget.id,
        eventString = widget.generateUniqueEvent('scroll resize');

      widget.$container.unbind(eventString).on(eventString, widget.onScrollChange.bind(widget));
    },


    /**
     * Scroll/resize event handler.
     * Determines offsets and updates sticky state if necessary
     * @param  {Event} event Event object
     * @return {void}
     */
    'onScrollChange': function(event) {
      var widget = this,
        $container = widget.$container,
        containerTop = widget.$container.scrollTop(),
        offsetTop = widget.offsetTop;

      widget.setStickyState(containerTop > offsetTop);
    },

    /**
     * Determines the top offset based on parent
     * @return {void}
     */
    'updateOffsetTop': function() {
      var widget = this,
        $el = widget.element,
        isSticky = widget.getStickyState(),
        offsetFunction = 'offset';

      // relative to parents we can use position instead of offset
      if (widget.options.target === 'parent') {
        offsetFunction = 'position';
      }

      // if it's currently sticky, we need to unsticky it
      // to get an accurate height reading
      if (isSticky) {
        // unsticky it..
        widget.setUnsticky();
        // wait a sec..
        setTimeout(function() {
          // get the offset..
          widget.offsetTop = $el[offsetFunction]().top;
          // re-sticky it..
          widget.setSticky();
        }, 1);
      } else {
        // else just get the offset
        widget.offsetTop = $el[offsetFunction]().top;
      }
    },

    /**
     * Sets the sticky state of the widget
     * @param  {Boolean} isSticky Is it sticky?
     * @return {void}
     */
    'setStickyState': function(isSticky) {
      var widget = this,
        $el = widget.element;

      if (isSticky) {
        widget.setSticky();
      } else {
        widget.setUnsticky();
      }
    },

    /**
     * Determines if the widget is stuck and returns a true/false value
     * @return {void}
     */
    'getStickyState': function() {
      var widget = this,
        $clone = widget.$clone;

      return $clone.hasClass(widget.options.class);
    },

    /**
     * Sets the widget to 'sticky' state
     * @return {void}
     */
    'setSticky': function() {
      var widget = this,
        $el = widget.element,
        $clone = widget.$clone;

      $el.addClass(widget.options.class);
      $clone.addClass(widget.options.class);
    },

    /**
     * Sets the widget to 'non sticky' state
     * @return {void}
     */
    'setUnsticky': function() {
      var widget = this,
        $el = widget.element,
        $clone = widget.$clone;

      $el.removeClass(widget.options.class);
      $clone.removeClass(widget.options.class);
    }
  });

})(jQuery, window, document);

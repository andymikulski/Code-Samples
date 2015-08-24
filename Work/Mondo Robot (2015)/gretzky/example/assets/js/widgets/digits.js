;
(function($, window, document, undefined) {

  $.widget('mondo.digits', $.mondo.base, {
    'options': {
      'speed': 25
    },

    'events': {
      'digits:start()': 'startCounting'
    },

    'isAnimating': false,
    'targetValue': 0,
    'currentValue': 0,

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;

      widget.targetValue = parseInt(widget.element.text(), 10);
      widget._super('_create');
      widget.startCounting();
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;
      widget.bindEvents();
    },

    /**
     * Bind various key/mouse events
     * @return {void}
     */
    'bindEvents': function() {
      var widget = this,
        $el = widget.element,
        overEvent = widget.generateUniqueEvent('mouseover');

      $el.unbind(overEvent).on(overEvent, widget.onMouseOver.bind(widget));
    },

    /**
     * mouseover event handler
     * Triggers startCounting which begins animation if able
     * @param  {MouseEvent} event MouseOver event object
     * @return {void}
     */
    'onMouseOver': function(event) {
      var widget = this;

      widget.startCounting();
    },

    /**
     * Function that triggers the digit to spin up
     * @param {boolean} force Ignore the current animation state and begin counting
     * @return {void}
     */
    'startCounting': function(force) {
      var widget = this;

      if (force || !widget.isAnimating) {
        widget.isAnimating = true;
        widget.currentValue = 0;
        widget.emit('digits:has-started');
        window.requestAnimationFrame(widget.onFrameEvent.bind(widget));
      }
    },

    /**
     * FrameEnter event handler
     *
     * @return {[type]} [description]
     */
    'onFrameEvent': function() {
      var widget = this,
        $el = widget.element,
        difference = (widget.targetValue - widget.currentValue);

      // does the value still need to change?
      if (Math.abs(difference) !== 0) {
        // calc the new value
        widget.currentValue += difference / widget.options.speed;

        // if we're close enough, just sink up
        if (Math.abs(difference) < 1) {
          widget.currentValue = widget.targetValue;
        }

        // set the text to the closest value we're currently at
        $el.text(Math.round(widget.currentValue));

        // queue the next frame
        window.requestAnimationFrame(widget.onFrameEvent.bind(widget));
      } else {
        // we're done here
        widget.emit('digits:has-ended');
        widget.isAnimating = false;
      }
    }
  });

})(jQuery, window, document);

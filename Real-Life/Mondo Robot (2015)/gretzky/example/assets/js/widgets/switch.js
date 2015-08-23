;
(function($, window, document, undefined) {

  $.widget('mondo.switch', $.mondo.base, {
    'options': {
      'active': false,
      'class': 'is-active',
      'off': null,
      'on': null
    },

    'events': {
      'switch:enable()': 'setEnabled',
      'switch:disable()': 'setDisabled'
    },

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

      // we only use the active option on init
      widget.setState(widget.options.active);
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;
      widget.bindClick();
    },

    /**
     * Binds click events to widget element
     * @return {void}
     */
    'bindClick': function() {
      var widget = this,
        $el = widget.element,
        eventName = widget.generateUniqueEvent('click');

      $el.unbind(eventName).on(eventName, widget.onClickEvent.bind(widget));
    },

    /**
     * Widget click event handler
     * Toggles switch state
     * @param  {MouseEvent} e Click event object
     * @return {void}
     */
    'onClickEvent': function(e) {
      e && e.preventDefault && e.preventDefault();

      var widget = this,
        $el = widget.element;

      if (widget.isEnabled()) {
        widget.setState(false);
      } else {
        widget.setState(true);
      }

      // emit the switch has changed
      widget.emit('switch:was-changed', {
        'state': widget.isEnabled()
      });
    },

    /**
     * Determines if this switch is enabled and returns state
     * @return {Boolean} Switch's current 'active' state
     */
    'isEnabled': function() {
      var widget = this,
        $el = widget.element;

      return $el.hasClass(widget.options.class);
    },

    /**
     * Sets the switch to its 'active' state
     * Also updates switch text based on the 'on'/'off' options
     * @return {void}
     */
    'setEnabled': function() {
      var widget = this,
        $el = widget.element;

      widget.emit('switch:is-enabled');
      $el.addClass(widget.options.class);

      // replace the text in the switch if that option is provided
      if (widget.options.on) {
        $el.text(widget.options.on);
      }
    },

    /**
     * Sets the switch to its 'not active' state
     * Also updates switch text based on the 'on'/'off' options
     * @return {void}
     */
    'setDisabled': function() {
      var widget = this,
        $el = widget.element;

      widget.emit('switch:is-disabled');
      $el.removeClass(widget.options.class);

      // replace the text in the switch if that option is provided
      if (widget.options.off) {
        $el.text(widget.options.off);
      }
    },

    /**
     * Sets the state of the switch dependent on parameter passed in.
     * @param  {Boolean} active Should the switch be active?
     * @return {void}
     */
    'setState': function(active) {
      var widget = this;
      (active ? widget.setEnabled() : widget.setDisabled());
    },

    /**
     * Determines switch state and reports
     * @return {boolean} Switch 'active' state
     */
    'getState': function() {
      return this.isEnabled();
    }
  });

})(jQuery, window, document);

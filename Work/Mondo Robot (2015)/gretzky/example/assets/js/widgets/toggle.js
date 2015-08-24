;
(function($, window, document, undefined) {

  $.widget('mondo.toggle', $.mondo.base, {
    'options': {
      // max selectable switches
      'maxActive': 1,
      // at any point can there be NO switches selected?
      'allowEmpty': false,
      'hasDefault': false,
      // internal
      'numActive': 1
    },

    'defaultEnabled': false,

    '$switches': $(),

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;

      // find the switches this toggle is taking over for
      widget.$switches = widget.getSwitches();

      // no switches = no toggle
      if (!widget.$switches.length) {
        console && console.warn && console.warn('Toggle : _create : no switches found');
        return;
      }

      widget._super('_create');

      widget.defaultEnabled = widget.options.hasDefault;
    },


    /**
     * Broadcasts the current state of the Toggle widget via toggle:active
     * @return {void}
     */
    'emitActive': function() {
      var widget = this,
        $v,
        active = [];

      // loop through each switch and get the current status
      widget.$switches.filter('.is-active').each(function(i, v) {
        $v = $(v);
        // this data will later be transmitted via the toggle:active event
        active.push({
          'index': $v.index(),
          'elData': $v.data()
        });
      });

      // broadcast the current active state
      widget.emit('toggle:active', {
        'active': active
      });
    },

    /**
     * Function to gather switches within this Toggle's scope
     * Also use this function to bind listeners between the Switch and the Toggle
     * @return {JQuery}   Jquery collection of switches
     */
    'getSwitches': function() {
      var widget = this,
        $el = widget.element,
        $list = $el.find('[data-widget="switch"]'),
        // temp var loops
        $v;

      // for each switch in this scope
      $list.each(function(i, v) {
        $v = $(v);
        // bind global events
        $v.on('switch:was-changed', widget.onSwitchChange.bind(widget));
      });

      return $list;
    },

    /**
     * switch:was-changed event handler
     * Determines if the switch emitted an enable/disable, and tells the
     * other switches to enter the opposite state
     * @param  {Event}  event JQuery-provided event object
     * @param  {Object} data  Optional set of data passed through widget's emit
     * @return {void}
     */
    'onSwitchChange': function(event, data) {
      var widget = this;
      // if a switch was enabled
      if (data.state === true) {
        widget.onSwitchEnable(event, data);
      } else {
        // if a switch was disabled
        widget.onSwitchDisable(event, data);
      }

      widget.reportStatus();
    },

    /**
     * Utility function to report the toggle's current status.
     * Emits is-empty, is-not-empty, and is-full events
     * @return {void}
     */
    'reportStatus': function() {
      var widget = this;
      if (widget.options.numActive <= 0) {
        widget.emit('toggle:is-empty');
      } else if (widget.options.numActive === widget.options.maxActive) {
        widget.emit('toggle:is-full');
      } else {
        widget.emit('toggle:is-not-empty');
      }
    },


    /**
     * Switch enable event handler.
     * Determines if the max active has been reached, if there's a default, etc
     * and allows enabling or forces disabling as necessary
     * @param  {Event}  event  Event object
     * @param  {Object} data   Switch event data
     * @return {void}
     */
    'onSwitchEnable': function(event, data) {
      var widget = this;

      // and we only allow 1 max active,
      if (!!data.element.attr('data-default') || widget.options.maxActive === 1) {
        // disable all the rest
        widget.$switches.not(data.element).trigger('switch:disable()');
        widget.emit('toggle:was-changed', {
          'index': data.element.index(),
          'elData': data.element.data()
        });
        widget.options.numActive = 1;

        // if we can have more than one active at a time
      } else if (widget.options.maxActive > 1) {
        var $defaultSwitch = widget.$switches.filter('[data-default="true"]');
        if ($defaultSwitch.hasClass('is-active')) {
          $defaultSwitch.trigger('switch:disable()');
          widget.options.numActive -= 1;
        }

        // and we already have too many active,
        if (widget.options.numActive >= widget.options.maxActive) {
          // disable the switch that just tried to become enabled
          data.element.trigger('switch:disable()');
        } else {
          widget.emit('toggle:was-changed', {
            'index': data.element.index(),
            'elData': data.element.data()
          });
          widget.options.numActive += 1;
        }
      }
      widget.emitActive();
    },

    'onSwitchDisable': function(event, data) {
      var widget = this;
      if (widget.$switches.length === 2 && !widget.options.allowEmpty) {
        // if there are only two switches,
        // we'll allow disabling one to toggle the other
        widget.$switches.not(data.element).trigger('switch:enable()');

        widget.emit('toggle:was-changed', {
          'index': widget.$switches.not(data.element).index(),
          'elData': widget.$switches.not(data.element).data()
        });
      } else if (widget.$switches.length > 2) {

        // if we're going to not have ANY selected, and we're not allowing empty,
        // force the element to stay lit
        if (widget.options.numActive <= 1) {
          // if we dont allow empty
          if (!widget.options.allowEmpty) {
            // and we have a default
            if (widget.options.hasDefault) {
              // apply the default
              var $defaultSwitch = widget.$switches.filter('[data-default="true"]');
              widget.defaultEnabled = true;
              $defaultSwitch.trigger('switch:enable()');
              widget.options.numActive = 1;
              widget.emit('toggle:was-changed', {
                'index': $defaultSwitch.index(),
                'elData': $defaultSwitch.data()
              });
            } else {
              // else we just force this switch to stay enabled
              data.element.trigger('switch:enable()');
            }
          }
        } else {
          // else drop the active count
          widget.options.numActive -= 1;
        }
      }
      widget.emitActive();
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;
    }
  });

})(jQuery, window, document);

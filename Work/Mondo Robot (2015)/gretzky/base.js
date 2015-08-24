;
(function($, window, document, undefined) {

  $.widget('mondo.base', {
    // save some memray
    '$window': $(window),
    '$html': $('html'),
    '$body': $(document.body),
    // used for some things like animating scrollTop in FF
    '$dom': $('html, body'),
    // options function just like normal $ plugin options
    // properties here will be read from the dom later (in getOptionsFromData)
    // so anything here is considered a default option
    'options': {},

    // list of external event calls that will be received
    // (these are triggered by other widgets or whatever,
    // this is just an easy way to map handlers to these events)
    // event name : name of handling function
    'events': {},


    // since jquery ui is weird and decides to make static members out
    // of things that look like instance variables, we wrap them in this object
    'instanceVars': function() {
      return {};
    },

    // each widget has a unique id, supplied later in generateUniqueID
    'id': '',

    // utility property to determine if the user is on a touch-capable device
    'hasTouch': 'ontouchstart' in window,

    // defines the element that triggers/listens for global events
    // (this is where the "global event space" is contained)
    '$global': $(document.body),

    // flag for dealing with sessionStorage stuff
    // (in case cookies are disabled etc)
    'hasStorage': false,

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;
      // mm chaining
      widget
      // set up the private instance vars
        .createInstanceVariables()
        // set the widget's id
        .generateUniqueID()
        // read the dom for any overridden options
        .getOptionsFromData()
        // bind the events that others may trigger on this widget
        .bindIncomingEvents()
        // determine capabilities
        .determineCapabilities()
        // refresh to basically init stuff
        .refresh();

      return widget;
    },

    'createInstanceVariables': function() {
      var widget = this,
        instanceVars = (typeof widget.instanceVars === 'function' ? widget.instanceVars() : widget.instanceVars),
        varName, initValue;

      for (varName in instanceVars) {
        if (instanceVars.hasOwnProperty(varName)) {
          // if this property is already set, don't set it to the init val
          if (!widget.hasOwnProperty(varName)) {
            widget[varName] = instanceVars[varName];
          }
        }
      }

      return widget;
    },

    /**
     * Utilizes JQuery UI's uniqueId function to establish a unique widget ID
     * @return {String}
     */
    'generateUniqueID': function(get) {
      var widget = this,
        $el = widget.element;

      // wish this just returned the string, but instead it sets this element's
      // ID attribute
      $el.uniqueId && $el.uniqueId();
      widget.id = $el.attr('id') || '' + Math.round(Math.random() * 1000) + (+new Date());

      return (get ? widget.id : widget);
    },

    /**
     * Generates a string to use for un/binding events on an element
     * (Utilizes $'s event namespacing - 'click' becomes 'click.this-widget-id')
     * This allows us to more precisely target events that we're binding/unbinding.
     * Also, we can alter events based on device capabilities (e.g. click -> tap)
     * @param  {string} eventName Event name to return
     * @return {string}           Widget-specific event ID
     */
    'generateUniqueEvent': function(eventName) {
      var widget = this,
        id = widget.id,
        eventArray = eventName.split(' '),
        returnEvent = '',
        i;

      for (i = 0; i < eventArray.length; i++) {
        // convert clicks to taps
        if (widget.hasTouch) {
          switch (eventArray[i]) {
            // case 'click':
            //   in a perfect world this would work
            // eventArray[i] = 'tap';
            // break;
            case 'mousedown':
              eventArray[i] = 'touchstart';
              break;
            case 'mouseup':
              eventArray[i] = 'touchend';
              break;
            case 'mousemove':
              eventArray[i] = 'touchmove';
              break;
          }
        }

        // we need to space out events if there are multiples
        if (i > 0) {
          returnEvent += ' ';
        }
        // actually generate the [event].[id] string
        returnEvent += (eventArray[i] + '.' + id);
      }

      // return the string that's used to unbind/bind via $
      return returnEvent;
    },

    /**
     * Binds any event handler definitions described in this widget's events object
     * Maps incoming events to functions already existing on the widget
     * @return {void}
     */
    'bindIncomingEvents': function() {
      var widget = this,
        events = widget.events,
        $el = widget.element,
        eventHandler,
        listener;

      for (listener in events) {
        // if the widget has the defined handler..
        if (!!widget[events[listener]]) {
          $el.unbind(listener).on(listener, widget[events[listener]].bind(widget));
        }
      }

      return widget;
    },

    /**
     * Reads data- attributes from the widget element and overrides any default
     * options with the found values.
     * @return {void}
     */
    'getOptionsFromData': function() {
      var widget = this,
        $el = widget.element,
        prop,
        options = {};

      // $ already data()'d our data, which is cool, since it also parses values for us
      for (prop in $el.data()) {
        if (widget.options.hasOwnProperty(prop)) {
          options[prop] = $el.data(prop);
        }
      }

      // update the widget options with whatever was found + the default values
      widget._setOptions(options);
      return widget;
    },

    /**
     * Setter for widget options
     * Allows manipulation of values (e.g. formatting or capping) before
     * setting widget property values
     * @param {String} key   Property name
     * @param {any}    value Property value
     */
    '_setOption': function(key, value) {
      var widget = this;

      widget._super(key, value);
      return widget;
    },

    /**
     * Setter for multiple widget options
     * @param {Object} options Hashmap of options to set on the widget
     */
    '_setOptions': function(options) {
      var widget = this;

      widget._super(options);
      widget.refresh();
      return widget;
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;
      return widget;
    },

    /**
     * Widget delete function.
     * Removes bindings, cleans stuff up, etc.
     * @return {void}
     */
    '_destroy': function() {
      var widget = this;

      widget.element.unbind();
      return widget;
    },


    /**
     * Utility function to create an object with relevant emission event data
     * @param  {string} eventName Event type to generate data for
     * @return {object}           Compiled information
     */
    'generateEmitData': function(eventName) {
      var widget = this;
      return {
        'widget': widget,
        'element': widget.element,
        'event': eventName,
        'time': Date.now()
      };
    },

    /**
     * Function to bind an event on the global namespace.
     * Prepends `global:` to the requested event name, and attaches
     * handlers (multiple or singular) to that event
     *
     * @param  {string}   eventName       Global event to bind
     * @param  {function} eventHandler    Handling function to fire
     * @param  {boolean}  preventMultiple Optional, force only this handler to exist for this event?
     * @return {widget}                   this
     */
    'bindGlobal': function(eventName, eventHandler, preventMultiple) {
      // no event = no sale
      if (!eventName || eventName === '' || !eventHandler || typeof eventHandler !== 'function') {
        return widget;
      }

      // ensure global things are namespaced accordingly
      if (eventName.indexOf('global:') < 0) {
        eventName = 'global:' + eventName;
      }

      var widget = this,
        eventID = widget.generateUniqueEvent(eventName);

      // force only one to fire
      if (preventMultiple) {
        widget.$global.unbind(eventID);
      }

      // bind the actual global object with the event + handler
      widget.$global.on(eventID, eventHandler);
      return widget;
    },


    /**
     * Alias for `emit(..., ..., true)`
     * Fires an event on the global namespace
     *
     * @param  {string} eventName Global event name to trigger
     * @param  {object} eventData Relevant event data to emit
     * @return {widget}           this
     */
    'emitGlobal': function(eventName, eventData) {
      var widget = this;
      return widget.emit(eventName, eventData, true);
    },

    /**
     * Custom event trigger function.
     * Pre-populates some event data along with any addt'l info passed in
     * @param  {String} eventName Event name to trigger
     * @param  {Object} eventData Event-related info to pass with trigger
     * @return {widget}           this
     */
    'emit': function(eventName, eventData, emitOnGlobal) {
      var widget = this,
        // default data passed with every widget event
        emittedData = widget.generateEmitData(eventName),
        // loop var
        prop;

      // replace any defaults with what was passed in,
      // else any extra values are just added on
      if (eventData) {
        emittedData.eventData = eventData;
        for (prop in eventData) {
          emittedData[prop] = eventData[prop];
        }
      }

      // determine if we need to do some global jiggery-pokery
      if (emitOnGlobal) {
        // ensure global things are namespaced accordingly
        if (eventName.indexOf('global:') < 0) {
          eventName = 'global:' + eventName;
        }
        widget.$global.trigger(eventName, emittedData);
      } else {
        // else we just trigger on this widget
        widget.element.trigger(eventName, emittedData);
      }

      return widget;
    },


    /**
     * Uniquely binds an event to provided element.
     * Used primarily for functions that live in the `refresh` function,
     * usually to find new elements and bind them as they enter the page.
     *
     * @param  {jQuery}   $el     Element to bind
     * @param  {string}   event   Event to bind
     * @param  {function} handler Handling function
     * @return {widget}           this
     */
    'safeBind': function($el, event, handler) {
      var widget = this,
        eventName = widget.generateUniqueEvent(event);

      if (!($el instanceof $)) {
        $el = $($el);
      }

      $el.unbind(eventName).on(eventName, handler);
      return widget;
    },


    /**
     * Unbinds an event from provided element,
     * using `generateUniqueEvent` to provide the correct namespace.
     *
     * @param  {jQuery} $el   Element to unbind
     * @param  {string} event Event name to unbind
     * @return {widget}       This
     */
    'unbind': function($el, event) {
      var widget = this,
        eventName = widget.generateUniqueEvent(event);

      if (!($el instanceof $)) {
        $el = $($el);
      }

      $el.unbind(eventName);
      return widget;
    },

    /**
     * Capability check to determine various function availability
     * Currently checks for `sessionStorage` support
     *
     * @return {widget} this
     */
    'determineCapabilities': function() {
      var widget = this;

      widget.hasStorage = widget._sessionStorageCheck();

      return widget;
    },


    /**
     * Test to determine if sessionStorage is available,
     * without breaking permissions etc
     * @return {boolean} Is sessionStorage available and usable?
     */
    '_sessionStorageCheck': function() {
      var widget = this;

      try {
        var tst = 'test-ignore';
        if (window.sessionStorage) {
          window.sessionStorage.setItem(tst, tst);
          window.sessionStorage.getItem(tst);
          return true;
        } else {
          return false;
        }
      } catch (err) {
        return false;
      }
    }
  });

})(jQuery, window, document);

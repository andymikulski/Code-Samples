;
(function($, window, document, undefined) {

  $.widget('mondo.base', {
    // options function just like normal $ plugin options
    // properties here will be read from the dom later (in getOptionsFromData)
    // so anything here is considered a default option
    'options': {},

    // list of external event calls that will be received
    // (these are triggered by other methods, this is just an easy way
    // to map handlers to these events)
    // event name : name of handling function
    'events': {},

    // each widget has a unique id, supplied later in generateUniqueID
    'id': '',

    // utility property to determine if the user is on a touch-capable device
    'hasTouch': 'ontouchstart' in window,

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;

      // get the widget's id
      widget.generateUniqueID();
      // read the dom for any overridden options
      widget.getOptionsFromData();
      // bind the events that others may trigger on this widget
      widget.bindIncomingEvents();

      // refresh to basically init stuff
      widget.refresh();
    },

    /**
     * Utilizes JQuery UI's uniqueId function to establish a unique widget ID
     * @return {String}
     */
    'generateUniqueID': function() {
      var widget = this,
        $el = widget.element;

      // wish this just returned the string, but instead it sets this element's
      // ID attribute
      $el.uniqueId();
      widget.id = $el.attr('id') || '';
      return widget.id;
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
        if (widget.hasTouch && eventArray[i] === 'click') {
          eventArray[i] = 'touchend';
        }

        if (i > 0) {
          returnEvent += ' ';
        }
        returnEvent += (eventArray[i] + '.' + id);
      }

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
        $el.unbind(listener).on(listener, widget[events[listener]].bind(widget));
      }
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
    },


    /**
     * Utility function to find a template in the page and inject content as necessary.
     * Was created for the Modal widget, eventually should be extended to be more globally compatible.
     * If string is first parameter, that will be used as the name of the template to find + fill
     * If object is first parameter, the widget's default template will be used
     *
     * @param {Object}    content    Hash of content areas to populate in template
     * @return {JQuery}              $-wrapped, content-filled template
     */
    'generateTemplate': function(templateName, content) {
      var widget = this,
        template;

      // if the first param is a string, it's the template name,
      // and second param is the content
      if (typeof templateName === 'string') {
        template = templateName ? templateName : widget.options.template;
      } else {
        // if the first param is an object, it's the content
        // and we need to pull the template from the widget options
        template = widget.options.template;
        content = templateName;
      }

      // no template = no default and not passed in
      if (!template) {
        console && console.warn && console.warn(['Base : generateTemplate : no template found', templateName, template]);
        return;
      }

      // find the actual template element
      var $template = $('#templates').find('#' + template);
      if (!$template || !$template.length) {
        console && console.warn && console.warn(['Base : generateTemplate : no $template found', templateName, template, $template]);
        return;
      }

      // parse it into an element
      var $newTemplate = $($template.html());

      // if we're populating content..
      if (content) {
        // loop through each piece of the content we're targeting
        for (var option in content) {
          // and insert into the dom
          $newTemplate.find('[data-' + option + ']').empty().append(content[option]);
        }
      }

      return $newTemplate;
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
    },

    /**
     * Setter for multiple widget options
     * @param {Object} options Hashmap of options to set on the widget
     */
    '_setOptions': function(options) {
      var widget = this;

      widget._super(options);
      widget.refresh();
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;
    },

    /**
     * Widget delete function.
     * Removes bindings, cleans stuff up, etc.
     * @return {void}
     */
    '_destroy': function() {
      var widget = this;

      widget.element.unbind();
    },

    /**
     * Custom event trigger function.
     * Pre-populates some event data along with any addt'l info passed in
     * @param  {String} eventName Event name to trigger
     * @param  {Object} eventData Event-related info to pass with trigger
     * @return {void}
     */
    'emit': function(eventName, eventData) {
      var widget = this,
        // default data passed with every widget event
        defaultData = {
          'widget': widget,
          'element': widget.element,
          'event': eventName,
          'time': Date.now()
        },
        // loop var
        prop;

      // replace any defaults with what was passed in,
      // else any extra values are just added on
      if (eventData) {
        defaultData.eventData = eventData;
        for (prop in eventData) {
          defaultData[prop] = eventData[prop];
        }
      }

      widget.element.trigger(eventName, defaultData);
    }
  });

})(jQuery, window, document);

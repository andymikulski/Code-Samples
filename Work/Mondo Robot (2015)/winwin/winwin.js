;
(function($, window, document, undefined) {

  /**
   * Window event manager
   * Throttles events on the window via requestAnimationFrame,
   * and reduces amount of actually bound events for better performance.
   *
   * Great for `scroll`, `resize`, `mousemove`, uhh...
   */

  var WinWin = {

    // hold onto our window reference
    '$window': $(window),

    // bound events = all the events bound on the window
    // {'event name': [handler1, handler2, ...]}
    'boundEvents': {},

    // named events = bindings with named aliases for unbinding later
    // event name : ['event type|index of bound event', ...]
    // {'myNamedThing': ['scroll|4', 'resize|1']}
    'namedEvents': {},
    'flaggedEvents': {},

    // allow for disabling window events
    'isLooping': false,

    // flag for checking if we have the raf shim in place or not
    '_hasInit': false,

    // last scroll event object
    'lastEvent': null,

    '_preventScroll': false,


    /**
     * Constructor/init function
     * Basically just runs an raf shim to make sure we can use that
     * @return {WinWin} this
     */
    'init': function() {
      var winwin = this;

      if (!winwin._hasInit) {
        winwin._hasInit = true;
        winwin._rafShim();
      }

      return winwin;
    },


    /**
     * Window binding function
     * Binds an event on the window and throttles via RAF execution.
     * `eventName` will typically be `scroll` or `resize. `eventHandler` is the
     * handling function for the event.
     *
     * `bindingName` is optional and can be used to later `unbind` events.
     * If the same binding name is passed for multiple events, those events
     * are unbound later as a whole (binding is additive, not replace..ive?)
     *
     * @param  {string}   eventName    Name of the event to bind on the window
     * @param  {function} eventHandler Function to fire when the event is triggered
     * @param  {string}   bindingName  Optional: name to use as a reference to group events or unbind later
     * @return {WinWin}                WinWin
     */
    'bind': function(eventName, eventHandler, bindingName) {
      var winwin = this;

      if (eventName.indexOf('resize') > -1) {
        eventName = eventName + ' orientationchange';
      }

      var eventName = eventName.split(' '),
        // loop variables
        tempEvtName, i;

      // event names can be sent in as 'scroll' or 'scroll resize' etc,
      // so we split it up by spaces and loop through em thattaway
      for (i = eventName.length - 1; i >= 0; i--) {
        tempEvtName = eventName[i];

        // check if winwin is even listening for this event
        if (!winwin.boundEvents.hasOwnProperty(tempEvtName)) {
          // if it's not then we need to add a listener for it
          winwin._registerNewEvent(tempEvtName);
        }

        // add the function handler to the list
        winwin.boundEvents[tempEvtName].push(eventHandler);

        // flag this event to fire on the first go
        winwin.flaggedEvents[tempEvtName] = true;

        // if using a name to reference the binding,
        // we need to store the position in which the handler was just added
        // (we use an array so you can bind multiple things together in one group)
        //
        // eg:
        // .bind('resize', handler1, 'myNamedBinding');
        // .bind('scroll', handler2, 'myNamedBinding');
        // .unbind('myNamedBinding'); // both are unbound
        if (bindingName) {
          if (eventName.indexOf(bindingName) > -1) {
            console && console.warn && console.warn('WinWin : bind : binding name "' + bindingName + '" can not be the same name as the event ("' + eventName + '")');
            return winwin;
          }

          // init the named binding list if needed
          if (!winwin.namedEvents.hasOwnProperty(bindingName)) {
            winwin.namedEvents[bindingName] = [];
          }

          // add the named binding (in the format of 'event|index') to the group
          winwin.namedEvents[bindingName].push(tempEvtName + '|' + winwin.boundEvents[tempEvtName].length);
        }
      }

      return winwin;
    },


    /**
     * Unbind event function
     * eventName can be an event ('resize', 'scroll') or binding name ('myBoundEvents') etc
     * @param  {string} eventName Event type or binding reference to unbind
     * @return {WinWin}           WinWin
     */
    'unbind': function(eventName) {
      var winwin = this,
        // loop var
        evt, foundHandlers, currentHandler;

      if (!eventName || eventName === '') {
        // no event name? unbind all!
        winwin.unbindAll();

        // see if the event exists on boundEvents..
      } else if (winwin.hasBinding(eventName)) {
        // if so, see if there is an arry of events
        foundHandlers = winwin.boundEvents[eventName];

        // set the length to 0 regardless of current members,
        // since we're unbinding ALL of them
        if (foundHandlers) {
          foundHandlers.length = 0;
        }

        // remove the flag for this event
        delete winwin.flaggedEvents[eventName];

        // see if the event exists as a named binding..
      } else if (winwin.hasNamedBinding(eventName)) {
        winwin._unbindNamed(eventName);
      } else {
        console && console.warn && console.warn('WinWin : unbind : no "' + eventName + '" to unbind');
      }

      return winwin;
    },


    /**
     * Unbinds everything!
     * @return {WinWin} WinWin
     */
    'unbindAll': function() {
      var winwin = this;

      for (var eventType in winwin.boundEvents) {
        var currentEvents = winwin.boundEvents[eventType];
        if (currentEvents) {
          currentEvents.length = 0;
        }
      }

      for (var eventType in winwin.namedEvents) {
        var currentEvents = winwin.namedEvents[eventType];
        if (currentEvents) {
          currentEvents.length = 0;
        }
      }

      for (var eventType in winwin.flaggedEvents) {
        var currentEvents = winwin.flaggedEvents[eventType];
        if (currentEvents) {
          currentEvents.length = 0;
        }
      }

      return winwin;
    },


    /**
     * Detect if the window has listeners for a particular event.
     *
     * @param  {string}   eventName
     * @return {boolean}  Is WinWin listening for this?
     */
    'hasBinding': function(eventName) {
      var winwin = this;
      return winwin.boundEvents.hasOwnProperty(eventName);
    },

    /**
     * Detect if WinWin has a named binding/group
     * @param  {string} bindingName Name of binding to look up
     * @return {boolean}            Is WinWin listening for this?
     */
    'hasNamedBinding': function(bindingName) {
      var winwin = this;
      return winwin.namedEvents.hasOwnProperty(bindingName);
    },

    /**
     * Interal function to unbind a named event
     * Looks up a named binding and removes corresponding handler functions
     * from the various handler arrays based on indices etc.
     *
     * @param  {string} eventName Binding name to find and remove
     * @return {WinWin}           WinWin
     */
    '_unbindNamed': function(eventName) {
      var winwin = this,
        foundEvents = winwin.namedEvents[eventName],
        currentEvent, currentType, currentIndex;

      if (foundEvents && foundEvents.length) {
        // for each of the events..
        for (var i = foundEvents.length - 1; i >= 0; i--) {
          // take it out of type|index format
          currentEvent = foundEvents[i].split('|');
          currentType = currentEvent[0];
          currentIndex = currentEvent[1] - 1;

          // see if this type even exists..
          if (winwin.boundEvents.hasOwnProperty(currentType)) {
            // and if it does, then set our index to null
            // (while this maintains the size of the array, we don't have to
            // worry about juggling around changing indices)
            winwin.boundEvents[currentType][currentIndex] = null;
          }
        }

        // remove the property off the namedEvents object all together
        delete winwin.namedEvents[eventName];
      }

      return winwin;
    },

    /**
     * Binds an event to the window and inits dirty flags
     * @param  {string} eventName [description]
     * @return {WinWin}           this
     */
    '_registerNewEvent': function(eventName) {
      var winwin = this;

      // init the array of handler functions
      winwin.boundEvents[eventName] = [];

      // bind the new event to the window
      // (so we can set the dirty flag)
      winwin.$window.on(eventName, function(evt) {
        winwin.lastEvent = evt;
        winwin._windowEventHandler(eventName, evt);
        if (winwin._preventScroll && (eventName === 'scroll' || eventName === 'onscroll')) {
          evt.preventDefault();
          return false;
        }
      });

      return winwin;
    },


    /**
     * Window event handler - the only actual one bound to the window
     * Listens for events to be triggered and then sets the 'flagged' status
     *
     * @param  {string} eventType Event type
     * @param  {object} evt       Native event object
     * @return {WinWin}           WinWin
     */
    '_windowEventHandler': function(eventType, evt) {
      var winwin = this;

      if (winwin.flaggedEvents.hasOwnProperty(eventType)) {
        winwin.flaggedEvents[eventType] = true;
      }

      return winwin;
    },


    '_generateEventData': function() {
      var winwin = this,
        $win = winwin.$window,
        winHeight = $win.height(),
        winWidth = $win.width(),
        winScroll = $win.scrollTop();

      return {
        'evt': winwin.lastEvent,
        'height': winHeight,
        'width': winWidth,
        'scrollTop': winScroll,
        'type': null
      };
    },

    /**
     * Internal function to loop through dirty events and fire as necessary
     * @return {winwin} this
     */
    '_fireEvents': function() {
      var winwin = this,
        flagObject = winwin.flaggedEvents,
        dirtyEvents = winwin._getDirty(),
        eventData = winwin._generateEventData(),
        // loop variables
        handlerQueue, handlerFunc, handlerData, i, j;

      for (i = dirtyEvents.length - 1; i >= 0; i--) {
        // grab the reference to the array
        handlerQueue = winwin.boundEvents[dirtyEvents[i]];
        // check if it exists and if it has anything in it..
        if (handlerQueue && handlerQueue.length) {
          eventData.type = dirtyEvents[i];
          // if so then loop through each and run em
          for (j = handlerQueue.length - 1; j >= 0; j--) {
            handlerFunc = handlerQueue[j];
            // bonus function check too
            handlerFunc && typeof handlerFunc === 'function' && handlerFunc(eventData);
          }
        }
      }

      return winwin;
    },


    /**
     * Internal function to reset the flagged events all to false
     * (resets the status on each loop to listen for fresh triggers)
     * @return {WinWin}   WinWin
     */
    '_resetFlags': function() {
      var winwin = this;

      for (var evt in winwin.flaggedEvents) {
        if (winwin.flaggedEvents.hasOwnProperty(evt)) {
          winwin.flaggedEvents[evt] = false;
        }
      }

      return winwin;
    },


    /**
     * Get a list of all the currently dirty events
     *
     * @return {Array} List of dirty events
     */
    '_getDirty': function() {
      var winwin = this,
        flagObject = winwin.flaggedEvents,
        dirty = [];
      for (var evt in flagObject) {
        if (flagObject[evt] === true) {
          dirty.push(evt);
        }
      }
      return dirty;
    },

    //
    //
    //  RAF Init/Tick functions
    //
    //

    /**
     * Internal function to kick off the request animation frame loop
     * @return {WinWin} WinWin
     */
    '_initLoop': function() {
      var winwin = this;

      winwin.init();

      winwin.isLooping = true;
      winwin._onTick();

      return winwin;
    },

    /**
     * Internal requestAnimationFrame event handler
     * @return {WinWin} WinWin
     */
    '_onTick': function() {
      var winwin = this;

      // check if we stopped looping for some reason
      if (!winwin.isLooping) {
        return winwin;
      }

      // handle any dirty events,
      // then reset the dirty flags back to normal
      winwin._fireEvents()._resetFlags();

      // when we're done we can RAF again
      window.requestAnimationFrame(winwin._onTick.bind(winwin));
      return winwin;
    },

    /**
     * requestAnimationFrame shim
     * @return {void}
     */
    '_rafShim': function() {
      var lastTime = 0,
        vendors = ['webkit', 'moz'];
      for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
      }

      if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id = window.setTimeout(function() {
                callback(currTime + timeToCall);
              },
              timeToCall);
          lastTime = currTime + timeToCall;
          return id;
        };

      if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
        };
    },

    /**
     * Start WinWin's monitoring
     * @return {WinWin} WinWin
     */
    'start': function() {
      var winwin = this;
      return winwin._initLoop();
    },
    /**
     * Pause WinWin's monitoring
     * @return {WinWin} WinWin
     */
    'pause': function() {
      var winwin = this;
      winwin.isLooping = false;
    },
    /**
     * Stop WinWin's monitoring
     * @return {WinWin} WinWin
     */
    'stop': function() {
      var winwin = this;
      return winwin.pause();
    },
    /**
     * Resume WinWin's monitoring
     * @return {WinWin} WinWin
     */
    'resume': function() {
      var winwin = this;
      return winwin.start();
    },


    'allowScrolling': function(yesno) {
      var winwin = this;

      winwin._preventScroll = !yesno;

      return winwin;
    }
  };

  // We init on construction to get the raf shim outta the way
  window.WinWin = WinWin.init().start();

})(jQuery, window, document);

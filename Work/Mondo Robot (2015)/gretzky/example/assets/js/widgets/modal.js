/**
 * BROKEN
 * RELIES ON OLD TEMPLATE FUNCTIONS
 */

// ;
// (function($, window, document, undefined) {

//   $.widget('mondo.modal', $.mondo.base, {
//     'options': {
//       'template': 'modal',
//       'class': 'is-visible'
//     },

//     'events': {
//       'modal:open()': 'openModal',
//       'modal:close()': 'closeModal',
//       'modal:toggle()': 'toggleModal'
//     },

//     '$modal': $(),
//     '$window': $(window),

//     /**
//      * Constructor. Runs on widget instantiation.
//      * Options are passed in via widget constructor function, which
//      * becomes this.options.
//      *
//      * @return {void}
//      */
//     '_create': function() {
//       var widget = this;

//       widget._super('_create');
//     },

//     /**
//      * 'Re-init' function. Used when widget constructor is called on
//      * an element that already has it. Basically a straight refresh.
//      * @return {[type]} [description]
//      */
//     'refresh': function() {
//       var widget = this;

//       if (!widget.$modal || !widget.$modal.length) {
//         widget.createModal();
//       }
//       widget.bindTriggerEvents();
//     },


//     /**
//      * Generates the modal template and populates it with
//      * the widget's associated content. Also calls WidgetFactory.refresh
//      * so any nested functionality is properly instantiated
//      * @return {[type]} [description]
//      */
//     'createModal': function() {
//       var widget = this,
//         $template = widget.generateTemplate({
//           // grab the content from the widget's associated content
//           'content': widget.element.find('[data-content]').html()
//         });
//       widget.$modal = $template;

//       // bind events on the new modal element
//       widget.bindModal();

//       // append our modal immediately after our widget
//       widget.$modal.insertAfter(widget.element);

//       // use our app's widget factory to init any widgets in the modal content
//       window && window.WidgetFactory && window.WidgetFactory.refresh(widget.$modal);
//     },


//     /**
//      * Bind mouse and keyboard events events to the modal element
//      * @return {void}
//      */
//     'bindModal': function() {
//       var widget = this;

//       widget.bindMouse();
//       widget.bindKeyboard();
//     },

//     /**
//      * Bind mouse events to the modal element.
//      * Basically just binds a bunch of 'close' listeners
//      * @return {void}
//      */
//     'bindMouse': function() {
//       var widget = this,
//         $modal = widget.$modal,
//         clickEvent = widget.generateUniqueEvent('click'),
//         // i'm just going to use an object here to avoid repeating code
//         bindings = {
//           '.dim': 'close',
//           '.modal-close': 'close'
//         },
//         el, $v;

//       // loop through bindings and apply where necessary
//       for (el in bindings) {
//         // there might be more than one instance of the element we're binding
//         $modal.find(el).each(function(i, v) {
//           $v = $(v);
//           $v.unbind(clickEvent).on(clickEvent, widget[bindings[el] + 'Modal'].bind(widget));
//         });
//       }
//     },

//     /**
//      * Binds keyboard events to the modal element
//      * @return {void}
//      */
//     'bindKeyboard': function() {
//       var widget = this,
//         eventName = widget.generateUniqueEvent('keyup'),
//         $win = widget.$window,
//         $modal = widget.$modal;

//       $win.unbind(eventName).on(eventName, widget.onKeyEvent.bind(widget));
//     },

//     /**
//      * OnKeyUp event handler for the modal element
//      * @param  {KeyboardEvent} evt Event object
//      * @return {void}
//      */
//     'onKeyEvent': function(evt) {
//       var widget = this,
//         code = evt.keyCode;

//       // ignore if the modal ain't even OPEN
//       if (!widget.isOpen()) {
//         return;
//       }

//       switch (code) {
//         case 27:
//           widget.closeModal();
//           break;
//       }
//     },

//     /**
//      * Finds the widget's trigger and binds accordingly.
//      * @return {[type]} [description]
//      */
//     'bindTriggerEvents': function() {
//       var widget = this,
//         $el = widget.element,
//         $trigger = $el.find('[data-trigger]'),
//         clickEvent = widget.generateUniqueEvent('click'),
//         $v, triggerAction;

//       // multiple triggers with multiple functions
//       $trigger.each(function(i, v) {
//         $v = $(v);
//         triggerAction = $v.attr('data-trigger') || 'toggle';
//         $v.unbind(clickEvent).on(clickEvent, widget[triggerAction + 'Modal'].bind(widget));
//       });
//     },

//     /**
//      * Hides/shows the modal based on current state
//      * @param  {Event} evt Event object (click or generic trigger)
//      * @return {void}
//      */
//     'toggleModal': function(evt) {
//       evt && evt.preventDefault && evt.preventDefault();
//       var widget = this;

//       if (widget.isOpen()) {
//         widget.closeModal();
//       } else {
//         widget.openModal();
//       }
//     },

//     /**
//      * Determines if the modal is currently visible
//      * @return {boolean} Modal open status
//      */
//     'isOpen': function() {
//       var widget = this;
//       return (widget.$modal && widget.$modal.hasClass(widget.options.class));
//     },

//     /**
//      * Displays the modal element
//      * @param  {Event} evt Event object (click or generic trigger)
//      * @return {void}
//      */
//     'openModal': function(evt) {
//       evt && evt.preventDefault && evt.preventDefault();
//       var widget = this;

//       widget.$modal.addClass(widget.options.class);
//       widget.emit('modal:has-opened');
//     },

//     /**
//      * Closes the modal element
//      * @param  {Event} evt Event object (click or generic trigger)
//      * @return {void}
//      */
//     'closeModal': function(evt) {
//       evt && evt.preventDefault && evt.preventDefault();
//       var widget = this;

//       widget.$modal.removeClass(widget.options.class);
//       widget.emit('modal:has-closed');
//     }
//   });

// })(jQuery, window, document);

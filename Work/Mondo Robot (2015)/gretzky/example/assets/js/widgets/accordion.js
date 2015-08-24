;
(function($, window, document, undefined) {

  $.widget('mondo.accordion', $.mondo.base, {
    'options': {
      'active': false,
      'animIn': 'fadeInUp',
      'animOut': 'fadeOutDown'
    },

    'events': {
      'accordion:close()': 'hideContent',
      'accordion:open()': 'showContent'
    },

    '$content': $(),
    '$switch': $(),

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;

      widget.setupToggleSwitch();
      widget._super('_create');
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;

      widget.$content = widget.element.find('[data-content]');

      widget.displayContent(widget.options.active);
    },

    /**
     * Function to bind the accordion's switch events
     * in order to toggle the accordion display
     * @return {void}
     */
    'setupToggleSwitch': function() {
      var widget = this,
        $el = widget.element;

      widget.$switch = $el.find('[data-widget="switch"]');

      widget.$switch.on('switch:was-changed', widget.onToggleState.bind(widget));
    },

    /**
     * Button click event handler.
     * Hides/displays content based on value of the event's 'state' property
     * @param  {Event}  event JQuery-provided event data
     * @param  {Object} data  Event-related information object
     * @return {void}
     */
    'onToggleState': function(event, data) {
      var widget = this;

      widget.displayContent(data.state);
    },


    /**
     * Toggle for hiding/displaying content
     * Hides/displays content based on value of the 'show' parameter
     * @param  {boolean} show Show or hide the content?
     * @return {void}
     */
    'displayContent': function(show) {
      var widget = this;

      if (show) {
        widget.showContent();
      } else {
        widget.hideContent();
      }
    },

    /**
     * Displays the content
     * @return {void}
     */
    'showContent': function() {
      var widget = this;

      widget.options.active = true;
      widget.$switch.trigger('switch:enable()');

      Walt.animate({
        'el': widget.$content,
        'animation': widget.options.animIn,
        'duration': '250ms',
        'onBefore': function($el) {
          $el.show();
        }
      });
    },

    /**
     * Hides the content
     * @return {void}
     */
    'hideContent': function() {
      var widget = this;
      widget.options.active = false;
      widget.$switch.trigger('switch:disable()');

      Walt.animate({
        'el': widget.$content,
        'animation': widget.options.animOut,
        'duration': '250ms',
        'onComplete': function($el) {
          $el.hide();
        }
      });
    }
  });

})(jQuery, window, document);

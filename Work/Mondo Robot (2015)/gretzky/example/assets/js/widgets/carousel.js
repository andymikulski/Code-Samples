;
(function($, window, document, undefined) {

  $.widget('mondo.carousel', $.mondo.base, {
    'options': {},
    '$children': $(),
    '$indicators': $(),

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;

      widget.getChildren();
      widget.makeNavDots(widget.$children.length);
      widget.setFirst();

      widget._super('_create');
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;

      widget.getChildren();
      widget.setFirst();
    },

    'getChildren': function() {
      var widget = this;
      widget.$children = widget.element.find('.carousel-list > li');
    },

    'setFirst': function() {
      var widget = this;
      if (!widget.$children.filter('.is-active').length) {
        widget.$children.first().addClass('is-active');
        widget.updateNavDots(0);
      }
    },

    'makeNavDots': function(count) {
      var widget = this,
        $indicators = widget.element.find('.carousel-indicators'),
        $dotTemplate = $('<div class="carousel-dot"></div>'),
        i;

      for (i = 0; i < count; i++) {
        $indicators.append($dotTemplate.clone());
      }

      widget.$indicators = $indicators.find('.carousel-dot');
    },

    'updateNavDots': function(index) {
      var widget = this;
      widget.$indicators.filter('.is-active').removeClass('is-active');
      widget.$indicators.eq(index).addClass('is-active');
    },

    'getIndicators': function() {
      var widget = this;
      widget.$indicators = widget.element.find('.carousel-dot');
    }

  });
})(jQuery, window, document);

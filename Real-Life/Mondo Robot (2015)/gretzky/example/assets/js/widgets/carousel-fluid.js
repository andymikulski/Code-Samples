;
(function($, window, document, undefined) {

  $.widget('mondo.carouselFluid', $.mondo.carousel, {
    'options': {},

    '$wrapper': $(),

    'scrollTimer': null,

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;

      widget.element.addClass('is-fluid');
      widget.$wrapper = widget.element.find('.carousel-wrapper');
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
      widget.sizeCarousel();
      widget.bindWheel();
    },

    'bindWheel': function() {
      var widget = this,
        wheelName = widget.generateUniqueEvent('mousewheel'),
        scrollName = widget.generateUniqueEvent('scroll');

      widget.$wrapper.unbind(wheelName).on(wheelName, widget.onWheelScroll.bind(widget));
    },

    'onWheelScroll': function(evt) {
      var widget = this,
        maxLeft = widget.$wrapper[0].scrollWidth - widget.$wrapper.width(),
        newLeft = widget.$wrapper.scrollLeft() - evt.originalEvent.wheelDelta;

      widget.$wrapper.stop(true, false).scrollLeft(newLeft);

      if (newLeft < maxLeft && newLeft > 0) {
        evt && evt.preventDefault && evt.preventDefault();
        // widget.onContainerScroll(evt.originalEvent.wheelDelta < 0);
      }
    },

    // 'onContainerScroll': function(direction) {
    //   var widget = this;

    //   if (widget.scrollTimer) {
    //     clearTimeout(widget.scrollTimer);
    //   }

    //   var wrapperWidth = widget.$wrapper.width() * 0.9,
    //     numChildren = widget.$children.length,
    //     scrollLeft = widget.$wrapper.scrollLeft();

    //   widget.scrollTimer = setTimeout(function() {
    //     var $inView = widget.getItemsInView();
    //     if (direction) {
    //       $inView = $inView.first();
    //     } else {
    //       $inView = $inView.last();
    //     }

    //     widget.$wrapper.animate({
    //       'scrollLeft': widget.$wrapper.scrollLeft() - ($inView.position().left / 2)
    //     }, 500);
    //   }, 250);
    // },

    'getItemsInView': function() {
      var widget = this,
        $v,
        posLeft,
        threshold = 100,
        wrapperWidth = widget.$wrapper.width(),
        $list = $();

      widget.$children.each(function(i, v) {
        $v = $(v);
        posLeft = $v.position().left;

        if (posLeft > -threshold && posLeft < wrapperWidth - threshold) {
          $v.addClass('is-in-view');
          $list = $list.add($v);
        } else {
          $v.removeClass('is-in-view');
        }
      });

      return $list;
    },

    'sizeCarousel': function() {
      var widget = this,
        totalWidth = 0,
        maxHeight = 0,
        $list = widget.element.find('.carousel-list'),
        $v,
        $img;

      widget.$children.each(function(i, v) {
        $v = $(v);
        $img = $v.find('img');

        if (!$img.length) {
          totalWidth += $v.width();
        } else {
          if ($img[0].complete) {
            totalWidth += $v.width();
          } else {
            $img[0].onload = (function($v) {
              return function() {
                totalWidth += $v.width();
                $list.width(totalWidth * 1.1);

                if ($v.height() > maxHeight) {
                  maxHeight = $v.height();
                  $list.height(maxHeight);
                }
              };
            }($v));
          }
        }
      });

      if (totalWidth > 0) {
        $list.width(totalWidth * 1.1);
      }
      if (maxHeight > 0) {
        $list.height(maxHeight);
      }
    }
  });

})(jQuery, window, document);

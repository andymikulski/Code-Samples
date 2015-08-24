;
(function($, window, document, undefined) {

  $.widget('mondo.carouselFixed', $.mondo.carousel, {
    'options': {
      'class': 'is-fixed',
      'navPadding': 25,
      'speed': '250ms'
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
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;

      widget.bindNavButtons();
      widget.removeFixedClass();
      widget.getChildren();
      widget.setHeight(function() {
        widget.addFixedClass();
      });
    },


    'bindNavButtons': function() {
      var widget = this,
        eventName = widget.generateUniqueEvent('click');

      widget.element.find('.carousel-nav__button').unbind(eventName).on(eventName, widget.onNavClick.bind(widget));
    },

    'onNavClick': function(evt) {
      evt && evt.preventDefault && evt.preventDefault();
      var widget = this,
        $el = widget.element,
        $target = $(evt.currentTarget),
        $active = widget.$children.filter('.is-active'),
        direction = $target.hasClass('next'),
        $next;

      if ($el.find('.walt-animate').length) {
        return;
      }

      $next = $active[direction ? 'next' : 'prev']();
      if (!$next.length) {
        $next = widget.$children[direction ? 'first' : 'last']();
      }


      // animate out the current one
      Walt.animate({
        'el': $active,
        'animation': 'fadeOut' + (direction ? 'Left' : 'Right'),
        'duration': widget.options.speed,
        'onComplete': function($el) {
          $el.removeClass('is-active');
        }
      });
      // animate in the next one
      Walt.animate({
        'el': $next,
        'animation': 'fadeIn' + (!direction ? 'Left' : 'Right'),
        'duration': widget.options.speed,
        'onBefore': function($el) {
          $el.addClass('is-active');
          widget.updateNavDots($next.index());
        }
      });

      widget.emit('carousel:has-changed', {
        '$slide': $next,
        'index': $next.index()
      });

      // $next.addClass('is-active');
      // $active.removeClass('is-active');
    },

    'removeFixedClass': function() {
      var widget = this;
      widget.element.removeClass(widget.options.class)
    },
    'addFixedClass': function() {
      var widget = this;
      widget.element.addClass(widget.options.class)
    },

    'setHeight': function(cb) {
      var widget = this,
        $el = widget.element,
        $v, vHeight, $img,
        numKids = widget.$children.length,
        numLoaded = 0,
        maxHeight = 0,
        callback = function() {
          $el.find('.carousel-list').css('padding-bottom', maxHeight + parseInt(widget.options.navPadding, 10));
          cb && cb();
        };

      widget.$children.each(function(i, v) {
        $v = $(v);
        $v.css('z-index', numKids - i);

        $img = $v.find('img');
        if ($img.length && !$img[0].complete) {
          $img[0].onload = $img[0].onerror = (function($v) {
            return function() {
              vHeight = $v.height();
              if (vHeight > maxHeight) {
                maxHeight = vHeight;
              }
              numLoaded += 1;
              if (numLoaded === numKids) {
                callback && callback();
              }
            }
          })($v);
        } else {
          vHeight = $v.height();
          if (vHeight > maxHeight) {
            maxHeight = vHeight;
          }
          numLoaded += 1;
          if (numLoaded === numKids) {
            callback && callback();
          }
        }
      });
    }
  });

})(jQuery, window, document);

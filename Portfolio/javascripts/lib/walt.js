var Walt = Walt || {};

/* Usage:

Walt.animate({
	'$el': $('#derp'),
	'transition': 'fadeInUp',
	'delay': '.5s',
	'duration': '2s',
	callback: function(){
		alert('herp');
	}
})

Walt.animateEach({
	'list': $('li'),
	'transition': 'fadeInUp',
	'delay': '.5s',
	'duration': '2s',
	callback: function(){
		alert('herp');
	}
})

Walt.animateEachChild({
	'container': $('#derp'),
	'transition': 'fadeInUp',
	'delay': '.5s',
	'duration': '2s',
	callback: function(){
		alert('herp');
	}
})

*/

Walt = (function (window, document) {

	var self = {

		// Base animation function
		// ($)el: Element to be animated
		// transition: string denoting animation to use ('bounceIn', etc)
		// delay: string denoting time before animation fires ('1s', '.2s', etc)
		// duration: string denoting time animation lasts ('1s', '.2s', etc)
		// callback: callback function upon animationEnd
		'animate': function (params) {
			var self = this;

			var $el;
			// Can pass in jQuery object or DOM element
			if(typeof params['el'] != 'undefined') {
				$el = $(params['el']);
			} else if(typeof params['$el'] != 'undefined') {
				$el = params['$el'];
			}

			// Have to set the delay/duration explicitly
			if(typeof params['delay'] !== undefined) {
				$el.css('animation-delay', params['delay']).css('-webkit-animation-delay', params['delay']).css('-moz-animation-delay', params['delay']).css('-o-animation-delay', params['delay']);
			}
			if(typeof params['duration'] !== undefined) {
				$el.css('animation-duration', params['duration']).css('-webkit-animation-duration', params['duration']).css('-moz-animation-duration', params['duration']).css('-o-animation-duration', params['duration']);
			}

			// Callback function
			var doneAnimating = function () {
				// Remove animation event handler
				$el.off('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd');
				// Remove the classes we added to the el
				$el.removeClass(params['transition']).removeClass('animated');

				$el.css('animation-duration', null).css('-webkit-animation-duration', null).css('-moz-animation-duration', null).css('-o-animation-duration', null).css('animation-delay', null).css('-webkit-animation-delay', null).css('-moz-animation-delay', null).css('-o-animation-delay', null).css('animation', null).css('-webkit-animation', null).css('-moz-animation', null).css('-o-animation', null);
				// Callback (either in function or object form)
				if(typeof params['callback'] == 'object' && typeof params['callback']['function'] == 'function') {
					params['callback']['function'](params['callback']['target']);
				} else if(typeof params['callback'] == 'function') {
					params['callback']();
				}
			}

			// Bind the animation events to the element - this fires the callback function
			$el.on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function (e) {
				doneAnimating();
			});

			// This fires the animation ('.animated' is what triggers it for real);
			$el.addClass('animated ' + params['transition']);
			
			if($('html').hasClass('no-cssanimations')){
				$el.trigger('animationend');
			}

		},


		// ###
		// Function to animate a CSS property
		// ($)el: Element to be animated
		// prop: string, property to be animated
		// value: string, target value to set property to
		// duration: string, time it takes to complete animation (ex: 2s, .2s, 0.15s)
		// delay: string, time before anim fires (ex: 2s, .2s, etc);
		// callback: callback function after animation is done
		'cssAnimate': function (params) {
			var wally = this;
			var anim = {};
			anim['' + params['prop']] = params['value'];

			var $el;
			if(typeof params['el'] != 'undefined') {
				$el = $(params['el']);
			} else if(typeof params['$el'] != 'undefined') {
				$el = params['$el'];
			}

			$el.animate(anim, params['duration'], params['callback']);
		},

		// Function to animate a list of objects
		// $list: list of elements ( $('li'), $('.herp'), etc)
		// transition: string denoting animation to use ('bounceIn', etc)
		// delay: float, time before anim fires (ex: 2, .2, etc);
		// duration: string, time it takes to complete animation (ex: 2s, .2s, 0.15s)
		// callback: callback function after animation is done
		'animateEach': function (params) {
			var wally = this;
			var t = 1;
			params['list'].each(function (i, v) {
				t++;
				wally.animate({
					'el': $(v),
					'transition': params['transition'],
					'delay': (params['delay'] * (i + 1)) + 's',
					'duration': params['duration']
				});
			});
			setTimeout(function(){ typeof params['callback'] == 'function' ? params['callback']() : 42; },  (parseFloat(params['delay']) * t)*1000*parseFloat(params['duration']));
		},

		// Function to animate each child element in a container
		// container: target jQuery object
		// ...
		// subcallback: callback to fire after each child finishes animating
		// callback: calllback to fire after animation is complete
		'animateEachChild': function (params) {
			var wally = this;
			subcall = (typeof params['subcallback'] == 'function' ? params['subcallback']() : null);
			params['container'].children().each(function (i, v) {

				wally.animate({
					'el': $(v),
					'transition': params['transition'],
					'delay': (params['delay'] * (i + 1)) + 's',
					'duration': params['duration'],
					'callback': {
						'function': params['subcall'],
						'target': v
					}
				});

			});
			setTimeout(function () {
				typeof params['callback'] == 'function' ? params['callback']() : 42;
			}, params['container'].children().length * params['delay'] * 1000);

		}
	};
	return self;

})(this, this.document);
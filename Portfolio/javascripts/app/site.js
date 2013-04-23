/**
 * Maestro
 */
var Maestro = (function (window, document) {
	var self = {
		'init': function (options) {
			var maestro = self;
			maestro.isDragging = false; // Detects if user is dragging a slide or not (moz fix)
			window.inertiaInterval = null; // Timer used to detect a slide throw
			maestro.autoScrolling = false; // Bool to tell if the page scroll is being animated
			// Setup functions
			maestro.buildWorkData();
			maestro.bindSplash();
			// maestro.bindStickyBar();
			maestro.bindScroll();
			maestro.buildWorks();
			maestro.bindComps();
			maestro.bindFooter();
			// Detect if the user is somewhere else already
			if (location.hash != '#portfolio' && location.hash != '') {
				var navTo = maestro.data.filter(function (piece) {
					return piece.shortCode == location.hash
				});
				if (navTo.length > 0) {
					// This is cheating!
					$('.work[data-id=' + navTo[0].id + ']').find('.seeMore .button').click();
				}
			}
		},
		/*
		 * buildWorkData
		 * Creates the maestro.data variable, later used in templating the works out
		 */
		'buildWorkData': function () {
			var maestro = self;
			/*
				Get server response here,
				returns an array of objects that are used to build each work on the page.

				maestro.data = serverResponse;
			*/
		},
		/*
		 * bindFooter
		 * Enables navigation to different work
		 */
		'bindFooter': function () {
			var maestro = self;
			$('#footer_global .pieces .button, #footer_global .pieces .button a').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				if ($('#portfolio').hasClass('single')) {
					// Temporary workaround until I create a proper function to switch between projects
					window.location.href = 'http://andymikulski.com/' + $(e.currentTarget).find('a').attr('href');
				} else {
					var navTo = maestro.data.filter(function (piece) {
						return piece.shortCode == $(e.currentTarget).find('a').attr('href')
					});
					$('.work[data-id=' + navTo[0].id + ']').find('.seeMore .button').click();
				}
			});
		},
		/*
		 * bindSplash
		 * Binds all necessary events on splash screen (buttons, scroll, etc)
		 */
		'bindSplash': function () {
			var maestro = self;
			// Resize if the window height changes
			$('#splash').height($(window).height());
			$(window).on('resize', function () {
				$('#splash').height($(window).height());
			});
			// Function to scroll to contact information
			$('.nav .contactMe, .nav contactMe a').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (!maestro.autoScrolling) {
					maestro.autoScrolling = true;
					$('body,html').stop(true, false).animate({
						'scrollTop': $('#footer_global').offset().top
					}, 750, function () {
						maestro.autoScrolling = false;
					});
				}
			});
			// Function to scroll to top of the portfolio section
			$('.nav .portfolio, .nav portfolio a').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (!maestro.autoScrolling) {
					maestro.autoScrolling = true;
					$('body,html').stop(true, false).animate({
						'scrollTop': $('#splash').height()
					}, 750, function () {
						maestro.autoScrolling = false;
						if (location.hash != '#portfolio') {
							// Change the hash once we're at the new section
							window.history.pushState({
								'page': 'portfolio'
							}, "portfolio", "#portfolio");
						}
					});
				}
			});
			// Function to scroll to top of page
			$('.nav .backtotop').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (!maestro.autoScrolling) {
					maestro.autoScrolling = true;
					$('body,html').stop(true, false).animate({
						'scrollTop': 0
					}, 800, function () {
						maestro.autoScrolling = false;
						// Need to clear the hash
						if (location.hash != '') {
							window.history.pushState({
								'page': ''
							}, "", "#");
						}
					});
				}
			});
			// Not a bind, but something that needs to happen on the splash
			$('#splash li.button').hide();
		},
		/*
		 * splashMenu
		 * Animates the splash menu into view
		 */
		'splashMenu': function () {
			setTimeout(function () {
				Walt.animateEach({
					'list': $('#splash .nav li').show(),
					'transition': 'fadeInLeft',
					'duration': '.5s',
					'delay': 0.1
				});
			}, 850);
		},
		/*
		 * buildWorks
		 * Templates maestro.data into the DOM
		 * @param animateIn - bool - Determines if the works should animate into view (true) or just be placed (false)
		 */
		'buildWorks': function (animateIn) {
			var maestro = self;
			var animate = animateIn || false;
			for (var i = 0; i < maestro.data.length; i++) {
				var source = $('#work-template').html();
				var template = Handlebars.compile(source);
				$('#portfolio').append(template(maestro.data[i]));
			}
			maestro.bindSeeMore();
			if (animate) {
				Walt.animateEach({
					'list': $('#portfolio').children(),
					'transition': 'fadeInLeftBig',
					'duration': '.75s',
					'delay': .1
				});
			}
			// Resets any height changes after pieces are in. Prevents the page from jumping between dom manipulations
			$('#portfolio').css('height', 'auto').css('min-height', 'auto');
		},
		/*
		 * bindStickyBar
		 * Binds the fixed header to the top of the page on scroll
		 * Don't use because the CSS transform3d hack breaks any position: fixed's
		 */
		'bindStickyBar': function () {
			var maestro = self;
			$(window).on('scroll', function (e) {
				var scrollTop = $(window).scrollTop();
				if (scrollTop > $('#header_global').not('.stuck').offset().top && $('#header_global.stuck').length < 1) {
					var $newGuy = $('#header_global').clone();
					$newGuy.insertAfter($('#header_global')).addClass('stuck');
				} else if (scrollTop < $('#header_global').not('.stuck').offset().top && $('#header_global.stuck').length >= 1) {
					$('#header_global.stuck').remove();
				}
			});
		},
		/*
		 * bindSeeMore
		 * Binds the red 'See More' buttons on each condensed portfolio
		 */
		'bindSeeMore': function () {
			var maestro = self;
			$('.seeMore .button').unbind().on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				var $thisInfo = $(e.currentTarget).closest('.info');
				var $this = $thisInfo.closest('.work');
				// Expand the height and fade the title card, if needed
				$this.addClass('expanded').removeClass('animated fadeInLeftBig');
				var $titleCard = $this.find('.titleCard');
				if (!$titleCard.hasClass('hidden')) {
					Walt.animate({
						'$el': $titleCard,
						'transition': 'fadeOutDown',
						'duration': '.3s',
						'delay': '0s',
						'callback': function () {
							$titleCard.remove();
						}
					});
				} else {
					$titleCard.remove();
				}
				// Content section
				var $scContent = $('#portfolio');
				// Get what the height is before animating
				var tempHeight = $scContent.height();
				Walt.animateEach({
					'list': $scContent.children().not($this),
					'transition': 'fadeOutRightBig',
					'duration': '1s',
					'delay': 0.2,
					'callback': function () {
						// tempOffset determines how far down the element is
						var tempOffset = $this.offset().top - $('#splash').height() - 29;
						// Set the section height to what it was, clear it, then start moving things into place
						$scContent.css('height', tempHeight).empty().addClass('single').append($this);
						// the element is stuck at the position it should be in (prevents jumping around due to lack of siblings)
						$this.css('position', 'absolute').css('top', tempOffset + 'px');
						// Start animating it into position
						$this.animate({
							'top': 20
						}, 200, function () {
							// We're absolutely done (ha get it)
							$this.css('position', 'relative');
							// Once it's moved into place, build the rest of the details page
							var source = $('#work-view-template').html();
							var template = Handlebars.compile(source);
							$scContent.append(template(maestro.data[parseInt($this.attr('data-id'))]));
							// Hide the section with all of the data coming in
							$('.viewWork').hide();
							Walt.animateEachChild({
								'container': $('.viewWork').fadeIn(),
								'transition': 'fadeInUpBig',
								'duration': '0.8s',
								'delay': 0.1
							});
							$scContent.animate({
								'height': $('#splash').height() - 58 + $('#footer_global').height()
							}, 800, function () {
								$scContent.css('min-height', ($(window).height() - 58) + $('#footer_global').height() + 'px');
								$scContent.height('auto');
							});
						});
						if (maestro.$headerClone != null) {
							maestro.$headerClone.remove();
							maestro.$headerClone = null;
						}
						maestro.bindClose();
						var moreMaybe = 0;
						if ($(window).height() <= 690) {
							moreMaybe = $('.thumbs').height() / 1.5;
						}
						$('body,html').animate({
							'scrollTop': $('#splash').height() + moreMaybe
						}, 800, function () {
							maestro.bindComps();
						});
						if (location.hash != maestro.data[parseInt($this.attr('data-id'))].shortCode) {
							window.history.pushState({
								'page': maestro.data[parseInt($this.attr('data-id'))].shortCode
							}, maestro.data[parseInt($this.attr('data-id'))].shortCode, maestro.data[parseInt($this.attr('data-id'))].shortCode);
						}
					}
				});
				return false;
			});
		},

		/*
		 * bindClose
		 * Rebinds the red 'See More' buttons into 'Close' buttons
		 */
		'bindClose': function () {
			var maestro = self;
			$('.seeMore .button').text('Close').unbind().on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				// In case the titleCard is still there
				$('#portfolio .titleCard').remove();
				$('.seeMore .button').unbind();
				$('#portfolio').css('overflow-x', 'hidden');

				// Scoot everything out
				Walt.animateEachChild({
					'container': $('#portfolio > *'),
					'transition': 'fadeOutRightBigNoRotate',
					'duration': '.8s',
					'delay': 0.1,
					'subcall': function (v) {
						$(v).hide();
					},
					'callback': function () {
						/// Just in case they aren't gone just yet, we'll .fadeOut instead of .hide
						$('#portfolio > *').fadeOut();
						setTimeout(function () {
							$('#portfolio').height($('#portfolio').height()).removeClass('single').empty().css('overflow', 'auto');
							// Rebuild and rebind the works
							// the (true) tells buildWorks to animate them in this time
							maestro.buildWorks(true);
							maestro.bindComps();
							window.history.pushState({
								'page': 'portfolio'
							}, "portfolio", "#portfolio");
						}, 0.1 * $('#portfolio').children().length + 0.35 * 900); // A little hacky, but can control the animation timings pretty well
					}
				});
			});
		},

		/*
		 * bindComps
		 * Binds the dragging/sliding/expanding stuff to the work sliders
		 */
		'bindComps': function () {
			var maestro = self;

			// Mouseup..
			$('.work').unbind('mouseup').on('mouseup', function (e) {
				var $this = $(e.currentTarget);

				// If mouseup and it's not expanded, not viewing an individual work, and is not being thrown..
				if (!$this.hasClass('expanded') && !$('#portfolio').hasClass('single') && !maestro.isDragging) {
					var $curExpo = $('.expanded');

					// Fade the title card and expand the work
					Walt.animate({
						'$el': $curExpo.find('.titleCard').show(),
						'transition': 'fadeInDown',
						'duration': '.3s',
						'delay': '0s'
					});
					$curExpo.removeClass('expanded');
					$this.addClass('expanded');
					var $titleCard = $this.find('.titleCard');
					Walt.animate({
						'$el': $titleCard,
						'transition': 'fadeOutDown',
						'duration': '.3s',
						'delay': '0s',
						'callback': function () {
							$titleCard.hide().addClass('hidden');
						}
					});

					// Else if mouseup and it's expanded..
				} else if (!$('#portfolio').hasClass('single') && !maestro.isDragging) {
					$('.expanded').removeClass('expanded');
					var $titleCard = $this.find('.titleCard').hide();

					// Animate the title card in
					Walt.animate({
						'$el': $titleCard.show(),
						'transition': 'fadeInDown',
						'duration': '.3s',
						'delay': '.2s',
						'callback': function () {}
					});

					// If the container needs to be aligned..
					var $container = $this.find('.thumbs');
					$container.stop(true, false);
					var newX = parseInt($container.css('left')) || 0;
					var curSlide = Math.floor(newX / 960);
					if (newX > 450) {
						curSlide = 1;
						$container.children().addClass('inactive').removeClass('active');
						$container.children().eq(0).removeClass('inactive').addClass('active');
					} else if (newX < 450 && newX > -450) {
						curSlide = 0;
						$container.children().addClass('inactive').removeClass('active');
						$container.children().eq(1).removeClass('inactive').addClass('active');
					} else if (newX < -450) {
						curSlide = -1;
						$container.children().addClass('inactive').removeClass('active');
						$container.children().eq(2).removeClass('inactive').addClass('active');
					}
					// ..it'll be moved accordingly
					$container.animate({
						'left': curSlide * 960
					}, 350);
				}
			});



			// Bind drag on the individual slides in the work slider
			$('.thumbs li').unbind().on('dragstart', function (e) {
				e.preventDefault();
				e.stopPropagation();
				maestro.isDragging = true;

				clearInterval(window.inertiaInterval);

				var mouseOriginalX = e.originalEvent.pageX;
				var $this = $(this);
				var $originalContainer = $this.closest('.thumbs');
				$container = $originalContainer;
				$container.stop(true, false);
				var containerLeft = parseInt($container.css('left'));
				if (isNaN(containerLeft)) {
					containerLeft = 0;
				}

				// Timer variable for inertia-ing
				var t = 0;
				var lastX = containerLeft;
				$container.css('position', 'relative');

				$('.work').unbind('mousemove').on('mousemove', function (e) {
					// Move the slider around
					var newX = -1 * (mouseOriginalX - e.pageX) + containerLeft;
					if (newX >= 960) {
						newX = 960;
					} else if (newX <= -960) {
						newX = -960;
					}
					$container.css('left', newX);
					t++;
					if (t % 3 == 0) {
						// update the newX every 3 ticks
						lastX = newX;
					}
				});

				// Apply inertia and re-highlight as necessary
				$('.work').on('mouseup', function (e) {
					e.preventDefault();
					e.stopPropagation();
					maestro.isDragging = false;

					var newX = -1 * (mouseOriginalX - e.pageX) + containerLeft;
					var inertia = -1 * (lastX - newX);
					inertia *= 1.5;
					if (inertia > 40) {
						inertia = 40;
					} else if (inertia < -40) {
						inertia = -40;
					}
					window.inertiaInterval = setInterval(function () {
						newX = parseInt($container.css('left')) + inertia;
						if (newX >= 960) {
							newX = 960; // * $container.children().length;
						} else if (newX <= -960) {
							newX = -960; // * $container.children().length;
						}
						$container.css('left', newX + 'px');
						inertia *= 0.9;
						if (inertia <= 0.5 && inertia >= -0.5) {
							inertia = 0;
							var curSlide = Math.floor(newX / 960);
							if (newX > 450) {
								curSlide = 1;
								$container.children().addClass('inactive').removeClass('active');
								$container.children().eq(0).removeClass('inactive').addClass('active');
							} else if (newX < 450 && newX > -450) {
								curSlide = 0;
								$container.children().addClass('inactive').removeClass('active');
								$container.children().eq(1).removeClass('inactive').addClass('active');
							} else if (newX < -450) {
								curSlide = -1;
								$container.children().addClass('inactive').removeClass('active');
								$container.children().eq(2).removeClass('inactive').addClass('active');
							}
							$container.animate({
								'left': curSlide * 960
							}, 350);
							clearInterval(inertiaInterval);
						}
					}, 10);

					// Unbind everything and rebind the mouse stuff
					// Prevents multiple event bug
					$('.work').unbind('mousemove').unbind('mouseup');
					maestro.bindComps();
				});
			});
		},

		/*
		 * bindScroll
		 * Binds the mousewheel event to pushStates
		 */
		'bindScroll': function () {
			var maestro = this;
			maestro.oldTop = $(window).scrollTop();
			maestro.scrollDirection = "";
			maestro.autoScrolling = false;
			$(window).mousewheel(function (e, d) {
				if (maestro.autoScrolling) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}
				var scrollTop = $(window).scrollTop();
				if (scrollTop > $('#splash').height() && location.hash != "#portfolio" && !$('#portfolio').hasClass('single')) {
					window.history.pushState({
						'page': 'portfolio'
					}, "portfolio", "#portfolio");
				}
				if (scrollTop < $('#splash').height() * 0.6 && !$('#portfolio').hasClass('single') && location.hash != "") {
					window.history.pushState({
						'page': 'splash'
					}, "splash", "#");
				}
				if (d < 0) {
					maestro.scrollDirection = 'down';
					if (scrollTop >= $(window).height() * .5 || $('#splash').height() > $(window).height()) {
						return;
					}

					// Auto scroll the user down to the portfolio if mousewheel'd down from the splash
					var _cur_top = scrollTop;
					if (_cur_top < $(window).height() * 1.25 && _cur_top >= 0 && !maestro.autoScrolling) {
						maestro.autoScrolling = true;
						e.preventDefault();
						e.stopPropagation();
						$('body,html').stop(true, false).animate({
							'scrollTop': $('#splash').height()
						}, 750, function () {
							maestro.autoScrolling = false;
							if (location.hash != '#portfolio' && !$('#portfolio').hasClass('single')) {
								window.history.pushState({
									'page': 'portfolio'
								}, "portfolio", "#portfolio");
							}
						});
					}
				} else if (d > 0) {
					maestro.scrollDirection = 'up';
				}
			});
		},

		/*
		 * isMobile
		 * Utility function to determine if a user is on a mobile device
		 */
		'isMobile': {
			'Android': function () {
				return navigator.userAgent.match(/Android/i) || false;
			},
			'BlackBerry': function () {
				return navigator.userAgent.match(/BlackBerry/i) || false;
			},
			'iOS': function () {
				return navigator.userAgent.match(/iPhone|iPad|iPod/i) || false;
			},
			'Opera': function () {
				return navigator.userAgent.match(/Opera Mini/i) || false;
			},
			'Windows': function () {
				return navigator.userAgent.match(/IEMobile/i) || false;
			},
			'any': function () {
				return (self.isMobile.Android() || self.isMobile.BlackBerry() || self.isMobile.iOS() || self.isMobile.Opera() || self.isMobile.Windows() || false);
			}
		}
	};
	return self;
})(window, window.document);





// Now we can start!
$(document).ready(function () {
	Maestro.init();
});



// Loading bit
$(window).load(function () {
	// Body has a 'loading' class on it as page loads
	$(document.body).fadeOut('slow', function () {
		$(document.body).removeClass('loading').show();
		Walt.animateEach({
			'list': $(document.body).children().show(),
			'transition': 'fadeIn',
			'duration': '.2s',
			'delay': .1
		});
		if (location.hash == '#portfolio' && $(document.body).scrollTop() < $('#portfolio').offset().top) {
			$(document.body).scrollTop($('#splash').height());
		}

		// Once we know the user is loaded and ready, everything is shown and the menu is animated in
		Maestro.splashMenu();
	});
});

// Utility function
window.log = function () {
	log.history = log.history || [];
	log.history.push(arguments);
	if (this.console) {
		console.log(Array.prototype.slice.call(arguments))
	}
};
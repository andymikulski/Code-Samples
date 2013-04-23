/**
 * ColorView
 */
var ColorView = Backbone.View.extend({

	'events': {},

	'initialize': function (options) {
		var view = this;
		_.bindAll(view);

		view.stats = new Stats();
		view.stats.setMode(0);
		var $body = $(document.body);
		$body.append(view.stats.domElement);

		// Settings
		view.shadowDistance = 2000;
		view.maxWorkers = 10;
		$body.attr('data-workers', view.maxWorkers);
		view.colors = [];

		// shim layer with setTimeout fallback
		window.requestAnimFrame = (function () {
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
		})();


		view.initiateWorkers(view.maxWorkers);
		view.render();


		// Window events to pause/play animation as necessary
		var $win = $(window);
		$win.on('blur', view.pause);
		$win.on('focus', view.play);

		log('Backbone : ColorView : Initialized', view);

	},

	// animLoop
	// Detects if paused, and if not then keeps running requestAnimFrame
	'animLoop': function () {
		var view = this;
		if (!view.paused) {
			window.requestAnimFrame(view.animLoop);
			view.renderLoop();
		}
	},


	// render
	// Builds canvas and begins loop
	'render': function () {
		var view = this;

		view.$canvas = $('<canvas></canvas>', {
			'id': 'canvas_background'
		});

		$(document.body).prepend(view.$canvas);
		view.context = view.$canvas[0].getContext('2d');

		view.canvas = view.$canvas[0];
		view.canvas.width = 1000;
		view.canvas.height = 1000;

		view.context.shadowOffsetX = view.shadowDistance; // (default 0)
		view.context.shadowOffsetY = view.shadowDistance; // (default 0)
		view.context.shadowBlur = 18; // (default 0)
		view.context.fillStyle = 'rgba(0,0,0,.15)';


		view.buildPalettes();

		log('Backbone : ColorView : Render');

		view.animLoop();
	},


	// buildPalettes
	// Reads data-color information attached from back end and builds dom elements for each color
	'buildPalettes': function () {
		var view = this;

		$('.thing').find('img').each(function (i, v) {
			var $v = $(v);
			// If no palette, add one
			if ($v.closest('.thing').find('.info').find('.palette').length <= 0) {
				$v.closest('.thing').find('.info').append($('<div></div>', {
					'class': 'palette'
				}));
			}

			// If the image doesn't have a palette for some reason, build one now
			if (parseInt($v.attr('data-count')) <= 0) {
				var colorArray = createPalette($v, 7);
				for (var i = 0; i < colorArray.length; i++) {
					$v.attr('data-color' + (i + 1), colorArray[i]);
				}
				$v.attr('data-count', 7);
			}


			// For each data-color..
			for (var i = 0; i < parseInt($v.attr('data-count')); i++) {
				var $li = $('<li></li>', {
					'class': 'colorLi'
				});

				// Create an Li and insert the HEX value into it as text and as the BG color
				var hex = view.rgbToHex($v.attr('data-color' + (i + 1)));
				$li.text(hex);
				$v.closest('.thing').find('.palette').append($li);
				$li.css('background-color', hex);
			}

			// Set the color rotate index to 1 as a default
			$v.attr('data-cindex', 1);

		});

		log('Backbone : ColorView : buildPalettes');
	},

	// rgbToHex
	// utility function to convert RGB to HEX
	'rgbToHex': function (rgb) {
		var view = this;
		rgb = "" + rgb;
		rgb = rgb.split(',');
		return "#" + ("0" + parseInt(rgb[0], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2);
	},


	// initiateWorkers
	// This is where the magic lives!
	// Builds worker objects and gets them going
	// @param num - int - number of workers to create
	'initiateWorkers': function (num) {
		var view = this;

		view.workers = [];
		for (var i = 0; i < num; i++) {


			// Creating the worker object
			view.workers[i] = {
				'id': i,
				'opacitySpeed': .01,
				'scrolling': false,
				// You have to 'hire' the worker first, right?
				'hire': function (options) {
					var worker = this;
					if (parseInt($(document.body).attr('data-workers')) <= parseInt(worker.id)) {
						return;
					}

					// If there aren't any active images, make up its own color
					if ($('.thing.active').find('img').length <= 0) {
						// Bitwise operators because I'm a hipster
						worker.r = (0.5 + (Math.random() * 255)) << 0;
						worker.g = (0.5 + (Math.random() * 255)) << 0;
						worker.b = (0.5 + (Math.random() * 255)) << 0;
					} else {
						var $activeThing = $('.thing.active').find('img');
						if ($activeThing.attr('data-color1') == undefined) {
							worker.r = (0.5 + (Math.random() * 255)) << 0;
							worker.g = (0.5 + (Math.random() * 255)) << 0;
							worker.b = (0.5 + (Math.random() * 255)) << 0;
						} else {
							var colorIndex = parseInt($activeThing.attr('data-cindex'));
							var newColor = $activeThing.attr('data-color' + colorIndex);
							newColor = newColor.split(',');
							worker.r = newColor[0];
							worker.g = newColor[1];
							worker.b = newColor[2];
							if ($activeThing.attr('data-color' + (colorIndex + 1)) == undefined) {
								$activeThing.attr('data-cindex', 1);
							} else {
								$activeThing.attr('data-cindex', colorIndex + 1);
							}

						}
					}


					// After it's been assigned a color, fade it in
					worker.opacity = 0;
					worker.targetOpacity = (Math.random() * 1) + .7;
					worker.color = worker.setColor();
					worker.comingIn = true;
					// Let it come out or go in
					worker.direction = parseInt(Math.random() * 2) ? 'grow' : 'shrink';
					if (worker.direction == 'shrink') {
						worker.radius = (Math.random() * 300) + 75;
						worker.speed = (Math.random() * .25) + .05;
					} else {
						worker.radius = (Math.random() * 100) + 20;
						worker.speed = (Math.random() * .25) + .05;
					}

					// Make sure the radius is big enough for us
					if (worker.radius < 500) {
						worker.radius += worker.radius;
					}

					worker.targetSpeed = worker.speed;

					// Place it somewhere
					worker.x = (0.5 + (Math.random() * 1000) + 10) << 0;
					worker.y = (0.5 + (Math.random() * 1000) + 10) << 0;
				},


				// Work
				// Grows/shrinks and fades accordingly
				'work': function (callback) {
					var worker = this;

					if (worker.direction === 'grow') {
						worker.radius += worker.speed;
					} else {
						worker.radius -= worker.speed;
					}

					if (worker.comingIn == true) {
						worker.opacity += worker.opacitySpeed;
						if (worker.opacity >= worker.targetOpacity) {
							worker.comingIn = false;
						}
					} else {
						if (worker.opacity > 0) {
							if (worker.opacity - worker.opacitySpeed <= 0) {
								worker.opacity = 0;
							} else {
								worker.opacity -= worker.opacitySpeed;
							}
						}
					}

					// If the worker is faded or too small
					if (worker.opacity <= 0 || worker.radius <= worker.speed) {
						// Fire 'em!
						worker.fire();
					}

					callback();

				},

				// setColor
				// Converts worker's rgb+a to rgba
				'setColor': function () {
					this.color = 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.opacity + ')';
					return this.color;
				},

				// fire
				// Gets rid of the worker and re-hires him
				'fire': function () {
					var worker = this;

					worker.opacity = 0;

					worker.hire();
				}
			}


			// After all of that paperwork, now we can hire the worker!
			view.workers[i].hire();
		}
	},

	// renderLoop
	// Draws what each worker has constructed
	'renderLoop': function () {
		var view = this;
		var $canvas = view.$canvas;
		var canvas = view.$canvas[0];
		var context = view.canvas.getContext('2d');
		// FPS monitor
		view.stats.begin();
		context.clearRect(0, 0, 2000, 2000);

		// For each worker...
		for (var i = 0; i < view.workers.length; i++) {
			var thisWorker = view.workers[i];

			// Tell the worker to figure out its stuff
			thisWorker.work(function () {
				// Then draw what it's thinking about
				context.shadowColor = thisWorker.setColor();
				context.beginPath();
				// Try/catch is really slow, so this should definitely be fixed
				try {
					context.arc(thisWorker.x - view.shadowDistance,
						thisWorker.y - view.shadowDistance,
						thisWorker.radius,
						0, Math.PI * 2, true);
				} catch (e) {}

				context.closePath();
				context.fill();
			});
		}
		view.stats.end();
		var fps = view.stats.getFps();


		// Attempt at canvas optimization
		var currWorkers = parseInt($(document.body).attr('data-workers'));
		if (fps > 55 && currWorkers != view.maxWorkers) {
			log(1, 'switch gears');
			$(document.body).attr('data-workers', view.maxWorkers);
		} else if (fps <= 45 && fps > 20 && currWorkers != Math.round(view.maxWorkers / 2)) {
			log(2, 'switch gears');
			$(document.body).attr('data-workers', Math.round(view.maxWorkers / 2));
		} else if (fps <= 20 && fps > 10 && currWorkers != Math.round(view.maxWorkers / 4)) {
			log(3, 'switch gears');
			$(document.body).attr('data-workers', Math.round(view.maxWorkers / 4));
		} else if (fps <= 10 && fps > 0 && currWorkers != 0) {
			log(4, 'switch gears');
			$(document.body).attr('data-workers', 0);
		}
	},

	// Pause function
	'pause': function () {
		if (!this.paused) {
			this.paused = true;
		}
	},

	// Play function
	'play': function () {
		log('playing');
		if (this.paused) {
			this.paused = false;
			this.animLoop();
		}
	}
});
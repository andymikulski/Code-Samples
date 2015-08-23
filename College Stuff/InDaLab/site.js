// Plugins
// Utility functions for cookies (Not sure if necessary anymore, don't think so though.)

function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
	} else var expires = "";
	document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name, "", -1);
}
window.log = function () {
	log.history = log.history || [];
	log.history.push(arguments);
	if (this.console) {
		console.log(Array.prototype.slice.call(arguments))
	}
};


jQuery.extend(jQuery.easing, {
	easeInQuad: function (x, t, b, c, d) {
		return c * (t /= d) * t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	}
});





/* Real stuff --- */


$(document).ready(function () {

	// window.detectedName is passed in through index.php
	  // window.detectedName = <?php gethostbyaddr($_SERVER['REMOTE_ADDR']); ?>
	if (window.detectedName) {
		window.compMap = {
			1: 'cias-nml15.main.ad.rit.edu',
			2: 'cias-nml25.main.ad.rit.edu',
			3: 'cias-nml17.main.ad.rit.edu',
			4: 'cias-nml16.main.ad.rit.edu',
			5: 'cias-nml19.main.ad.rit.edu',
			6: 'cias-nml18.main.ad.rit.edu',
			7: 'cias-nml13.main.ad.rit.edu',
			8: 'cias-nml11.main.ad.rit.edu',
			9: 'cias-nml12.main.ad.rit.edu',
			10: 'cias-nml09.main.ad.rit.edu',
			11: 'cias-nml10.main.ad.rit.edu',
			12: 'cias-nml07.main.ad.rit.edu',
			13: 'cias-nml08.main.ad.rit.edu',
			14: 'cias-nml22.main.ad.rit.edu',
			15: 'cias-nml14.main.ad.rit.edu',
			16: 'cias-nml21.main.ad.rit.edu',
			17: 'cias-nml23.main.ad.rit.edu',
			18: 'cias-nml20.main.ad.rit.edu',
			19: 'cias-nml24.main.ad.rit.edu',
			20: 'cias-nml05.main.ad.rit.edu',
			21: 'cias-nml06.main.ad.rit.edu',
			22: 'cias-nml03.main.ad.rit.edu',
			23: 'cias-nml04.main.ad.rit.edu',
			24: 'cias-nml02.main.ad.rit.edu',
			25: 'cias-nml01.main.ad.rit.edu',
			26: 'cias-nmtp01.rit.edu',
			27: 'cias-nmllab.main.ad.rit.edu'
		};
		for (var computer in window.compMap) {
			if (window.compMap[computer] == window.detectedName) {
				// confirmedComputer is the identified computer ID
				window.confirmedComputer = parseInt(computer);
			}
		}
	}


	// If the user has a recent cookie, we can get em logged in
	if (readCookie('indalab-username') != null) {
		window.userName = readCookie('indalab-username');
		window.userComp = parseInt(readCookie('indalab-comp-id'));
		window.user = {
			'userName': window.userName,
			'userComp': window.userComp
		};
	} else {
		window.user = {};
	}



	// Quotes Stuff

	// Big array of quotes! What else?
	var quotes = ['Anyone get food yet?', '<s>Fuck</s> this project!', 'Who\'s using this to render right now?', 'New Media does it all night long.', 'Tell me what you think of this.', 'You\'re reaching for low-hanging fruit.', '&quot;I hate you guys.&quot; - Adam', 'Awkward salmon!!!', 'What the frick!', 'And then you click here and it\'ll be like, bloop-bloop!', 'Who just microwaved something? It smells gross.', 'Wait why is that happening', 'RIT New Media Lab (BOO-1303)'];
	// Shuffle them
	for (var j, x, i = quotes.length; i; j = parseInt(Math.random() * i), x = quotes[--i], quotes[i] = quotes[j], quotes[j] = x);
	$('#header_global h2').attr('data-index', Math.floor(Math.random() * quotes.length));
	// 5s interval to rotate through qutoes in the array
	window.quoteInterval = setInterval(function () {
		var $h2 = $('#header_global h2');
		var index = parseInt($h2.attr('data-index'));
		$h2.animate({
			'top': '-10px',
			'opacity': 0
		}, 150, 'easeInQuad', function () {
			index += 1;
			if (index > quotes.length) {
				index = 0;
				// loop back to the beginning if we're at the end
			}
			$h2.html(quotes[index]).css('top', '10px');
			$h2.animate({
				'top': '0',
				'opacity': 1
			}, 150, 'easeOutQuad');
			$h2.attr('data-index', index);
		})
	}, 5000);



	// loggedInCount keeps track of how many users are signed in that the client is aware of
	window.loggedInCount = -1;
	// updateInterval is what pings the server for user information
	window.updateInterval = setInterval(function () {
		$.ajax({
			'url': 'query.php?a=countLoggedIn'
		}).done(function (count) {
			// If the server reports something different, get the rest of the information
			if (window.loggedInCount != parseInt(count)) {
				$.ajax({
					'url': 'query.php?a=getLoggedIn'
				}).done(function (res) {
					var data = $.parseJSON(res);
					$('li.active').addClass('gahbage');
					for (var entry in data) {
						$('li[data-computer-id="' + data[entry].id + '"]').attr('class', 'active').find('.name').text(data[entry].name);
					}

					// Anything that's not gahbage gets cleared out
					$('li.active.gahbage').not('.donttouch').attr('class', null);
					window.loggedInCount = count;
				});
			}
		});
	}, 1500);


	// If the user closes the window, log them out
	$(window).unload(function () {
		if (!$.isEmptyObject(window.user)) {
			eraseCookie('indalab-username');
			eraseCookie('indalab-comp-id');
			window.oldName = window.user.userName;

			$.ajax({
				'url': 'query.php?a=signOut&id=' + window.user.userComp,
				'async': false
			});

			window.user = {};
		}
	});




	$('li').click(function (e) {
		var $this = $(e.currentTarget);
		// If a user is not signed in, or the computer is not theirs, return out
		if (!$.isEmptyObject(window.user)) {
			if (window.user.userComp != parseInt($this.attr('data-computer-id'))) {
				return;
			}
		} else {
			return;
		}

		var $this = $(e.currentTarget);
		var $thisCouch = null;
		if ($this.closest('ul').hasClass('couch')) {
			$thisCouch = $this.closest('.couch');
		}
		if ($this.hasClass('active')) {
			$this.removeClass('active').addClass('donttouch');
			$.ajax({
				'url': 'query.php?a=signOut&id=' + parseInt($this.attr('data-computer-id'))
			}).done(function (res) {
				$this.attr('class', null);
				eraseCookie('indalab-username');
				eraseCookie('indalab-comp-id');
				window.oldName = window.user.userName;
				window.user = {};
			});
		} else {

			//If we need to sign in a user..
			$this.addClass('infocus donttouch');
			$('li:not(.infocus), ul.couch:not(.infocus)').attr('data-blur', 'yes');
			if ($thisCouch != null) {
				$thisCouch.attr('data-blur', 'no');
			}


			// Build a modal from a template on the page
			var $hey = $('#ohhey');
			$hey.unbind().empty().append($('#templates .signIn').clone()).addClass('open');
			if (window.oldName != null) {
				$hey.find('#signin_name').val(window.oldName);
			}
			var $dim = $('<div id="dim"></div>');
			$dim.insertAfter($hey)
			$dim.animate({
				'opacity': 0.3
			}, 500);
			$dim.on('click', function () {
				$hey.find('.close').click();
			});
			$hey.find('.close').on('click', function (e) {
				$hey.find('input').val(null);
				$this.removeClass('infocus donttouch');
				$('[data-blur="yes"]').attr('data-blur', 'no');
			});
			$hey.find('.submit').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				var name = $hey.find('#signin_name').val();
				var id = parseInt($this.attr('data-computer-id'));
				// Should probably do validation here
				$.ajax({
					'url': 'query.php?a=signIn&id=' + id + '&name=' + name
				}).done(function (res) {
					$this.attr('class', 'active').find('.name').text(name);
					$('[data-blur="yes"]').attr('data-blur', 'no');
					createCookie('indalab-username', name, 0.125);
					createCookie('indalab-comp-id', id, 0.125);
					window.user = {
						'userName': name,
						'userComp': id
					};
					$hey.find('.close').click();
				});
			});
		}
	});


	// Close button binding for all modals
	$('#ohhey .close').live('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		$('#ohhey').removeClass('open');
		$('#dim').animate({
			'opacity': 0
		}, 500, function () {
			$('#dim').remove();
		});
		$this.removeClass('infocus donttouch');
		$('[data-blur="yes"]').attr('data-blur', 'no');
	});




	// Detect if a user is on a computer but not logged in
	if (window.confirmedComputer && $.isEmptyObject(window.user)) {

		// Modal it up
		var $hey = $('#ohhey');
		var $this = $('[data-computer-id="' + parseInt(window.confirmedComputer) + '"]');
		$hey.unbind().empty().append($('#templates .detected').clone()).addClass('open');

		// If they signed out already, the site should already know their name
		if (window.oldName != null) {
			$hey.find('#confirmed_name').val(window.oldName);
		}

		// More modal stuff..
		var $dim = $('<div id="dim"></div>');
		$dim.insertAfter($hey)
		$dim.animate({
			'opacity': 0.3
		}, 500);
		$this.addClass('infocus donttouch');
		var $thisCouch = null;
		if ($this.closest('ul').hasClass('couch')) {
			$thisCouch = $this.closest('.couch');
		}
		$('li:not(.infocus), ul.couch:not(.infocus)').attr('data-blur', 'yes');
		if ($thisCouch != null) {
			$thisCouch.attr('data-blur', 'no');
		}
		$dim.on('click', function () {
			$hey.find('.close').click();
		});
		$hey.find('.close').on('click', function (e) {
			$hey.find('input').val(null);
		});
		$hey.find('.submit').on('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var name = $hey.find('#confirmed_name').val();
			var id = parseInt(window.confirmedComputer);
			$.ajax({
				'url': 'query.php?a=signIn&id=' + id + '&name=' + name
			}).done(function (res) {
				$this.attr('class', 'active').find('.name').text(name);
				$('[data-blur="yes"]').attr('data-blur', 'no');
				createCookie('indalab-username', name, 0.125);
				createCookie('indalab-comp-id', id, 0.125);
				window.user = {
					'userName': name,
					'userComp': id
				};
				// Cheating! 
				$hey.find('.close').click();
			});
		});
	}
	$(document.body).removeClass('preload');
});
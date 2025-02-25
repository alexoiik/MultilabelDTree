(function ($) {

	"use strict";

	var cfg = {
		scrollDuration: 800, // Smoothscroll Duration.
	},

	$WIN = $(window);

	// Preloader.
	var ssPreloader = function () {
		$WIN.on('load', function () {
			// Force page scroll position to top at page refresh.
			$('html, body').animate({ scrollTop: 0 }, 'normal');

			// Will fade out the whole preloader DIV that covers the website.
			$("#preloader").delay(500).fadeOut('slow');
		});
	};

	// Smooth Scrolling.
	var ssSmoothScroll = function () {
		$('.smoothscroll').on('click', function (e) {
			var target = this.hash,
				$target = $(target);

			e.preventDefault();
			e.stopPropagation();

			$('html, body').stop().animate({
				'scrollTop': $target.offset().top
			}, cfg.scrollDuration, 'swing', function () {
				window.location.hash = target;
			});
		});
	};

	// Placeholder Plugin Settings.
	var ssPlaceholder = function () {
		$('input, textarea, select').placeholder();
	};

	// Animate On Scroll.
	var ssAOS = function () {
		AOS.init({
			offset: 200,
			duration: 600,
			easing: 'ease-in-sine',
			delay: 300,
			once: true,
			disable: 'mobile'
		});
	};

	// Back to Top.
	var ssBackToTop = function () {

		var pxShow = 500,           // Height on which the button will show.
			fadeInTime = 400,      // How slow/fast you want the button to show.
			fadeOutTime = 400,    // How slow/fast you want the button to hide.
			scrollSpeed = 300,   // How slow/fast you want the button to scroll to top. can be a value, 'slow', 'normal' or 'fast'.
			goTopButton = $("#go-top")

		// Show or hide the sticky footer button.
		$(window).on('scroll', function () {
			if ($(window).scrollTop() >= pxShow) {
				goTopButton.fadeIn(fadeInTime);
			} else {
				goTopButton.fadeOut(fadeOutTime);
			}
		});
	};

	// Initializing main.
	(function ssInit() {
		ssPreloader();
		ssSmoothScroll();
		ssPlaceholder();
		ssAOS();
		ssBackToTop();
	})();

})(jQuery);
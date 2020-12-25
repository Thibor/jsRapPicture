var fullScreenMode = false;

function FullScreenOff() {
	if (document.exitFullscreen)
		document.exitFullscreen();
	else if (document.mozCancelFullScreen)
		document.mozCancelFullScreen();
	else if (document.webkitExitFullscreen)
		document.webkitExitFullscreen();
}

function FullScreenOn(element) {
	if (element.requestFullscreen)
		element.requestFullscreen();
	else if (element.mozRequestFullScreen)
		element.mozRequestFullScreen();
	else if (element.webkitRequestFullscreen)
		element.webkitRequestFullscreen();
	else if (element.msRequestFullscreen)
		element.msRequestFullscreen();
}

$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function (e) {
	fullScreenMode = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
	if (fullScreenMode) {
		$('.rapPicture').addClass('rapPictureF');
		$('.rapPicture').removeClass('rapPictureN');
		$('.fullscreen').text('Fullscreen Off');
	} else {
		$('.rapPicture').addClass('rapPictureN');
		$('.rapPicture').removeClass('rapPictureF');
		$('.fullscreen').text('Fullscreen On');
	}
	$('.rapPicture').each(function (index) {
		let rp = $(this)[index];
		if (rp.opt.onFullScreen)
			rp.opt.onFullScreen.call(rp, fullScreenMode);
	});
});

$(window).resize(function () {
	$('.rapPicture div').finish();
	$('.rapPicture img').finish();
});

$(window).scroll(function () {
	$('.rapPicture div').finish();
	$('.rapPicture img').finish();
});

(function ($) {
	$.fn.jsRapPicture = function (options) {

		return this.each(function () {
			this.opt = $.extend({
				autoplay: false,
				autoplaySpeed: 3000,
				transition: 1000,
				showDefaultMenu: true,
				src: '',
				customMenu: [],
				onFullScreen: null,
				onLoad: null,
				onClickMenu: null,
				onNext: null
			}, options);
			let base = this;
			this.first = true;
			let isReady = true;
			this.timerId = 0;
			if ($('img', this).length)
				this.opt.src = $('img', this).attr('src');
			$(this).empty().addClass('rapPicture rapPictureN');
			this.div = $('<div>').appendTo(this);
			this.imgMain = $('<img>').attr('src', this.opt.src).addClass('rapPicture1').appendTo(this);
			this.img2 = $('<img>').attr('src', this.opt.src).addClass('rapPicture2').appendTo(this.div);
			this.img3 = $('<img>').attr('src', this.opt.src).addClass('rapPicture3').appendTo(this.div);
			var li = this.opt.showDefaultMenu ? '<li>Next Image</li><li>Previous Image</li><li class="fullscreen">Fullscreen On</li><li class="slideshow"></li>' : '';
			if (this.opt.customMenu.length)
				li += '<li>' + this.opt.customMenu.join('</li><li>') + '</li>';
			if (li)
				this.menu = $('<ul class="custom-menu">' + li + '</ul>').appendTo(this);
			$(this).bind({
				click: function (e) {
					e.preventDefault();
					base.ClickNext(1);
					$(".custom-menu").hide();
				},
				contextmenu: function (e) {
					e.preventDefault();
					if (this.menu)
						$(this.menu).finish().toggle().css({ top: e.clientY + "px", left: e.clientX + "px" });
					else
						base.ClickNext(0);
				}
			});
			$('li', this).bind({
				click: function (e) {
					e.stopPropagation();
					var menuItem = $(this).text();
					if (base.opt.onClickMenu)
						base.opt.onClickMenu.call(base, menuItem);
					let hide = true;
					if (base.opt.showDefaultMenu)
						switch ($(this).index()) {
							case 0:
								base.ClickNext(1);
								hide = false;
								break;
							case 1:
								base.ClickNext(0);
								hide = false;
								break;
							case 2:
								base.opt.autoplay = false;
								base.SetFullscreen(!fullScreenMode);
								break;
							case 3:
								base.SetAuto(!base.opt.autoplay);
								break;
						}
					if (hide)
						$(".custom-menu").hide();
				}
			});

			this.ClickNext = function (next) {
				clearTimeout(this.timerId);
				if (this.opt.autoplay)
					this.opt.autoplay = false;
				else
					if (this.opt.onNext && isReady)
						this.opt.onNext.call(this, next);
			}

			this.SetAuto = function (v) {
				clearTimeout(this.timerId);
				this.opt.autoplay = v;
				$('.slideshow', this).text('Slideshow ' + (v ? 'Off' : 'On'));
				if (v)
					this.Slideshow();
			}

			this.SetFullscreen = function (v) {
				$('.fullscreen', this).text('Fullscreen ' + (v ? 'Off' : 'On'));
				fullScreenMode = v;
				if (v)
					FullScreenOn(base);
				else
					FullScreenOff();
			}

			function GetImgMainPosition() {
				let r = base.imgMain[0].getBoundingClientRect();
				let p = base.imgMain.offset();
				let w = r.width;
				let h = r.height;
				let l = p.left - window.scrollX;
				let t = p.top - window.scrollY;
				return { w: w, h: h, l: l, t: t };
			}

			this.SetImg = function (src) {
				isReady = false;
				$.get(src)
					.done(function () {
						let mp = GetImgMainPosition();
						$(base.div).css({ width: mp.w, height: mp.h, left: mp.l, top: mp.t, opacity: 1 });
						$(base).show();
						$(base.imgMain).css('opacity', 0).attr('src', src);
						$(base.img3).css('opacity', 1);
						base.imgMain[0].onload = function () {
							let mp = GetImgMainPosition();
							if (base.opt.onLoad)
								base.opt.onLoad.call(base, mp.w, mp.h);
							$(base.img2).attr('src', src);
							$(base.img3).fadeTo(base.opt.transition, 0);
							let transition = base.first ? 0 : base.opt.transition;
							$(base.div).animate({ left: mp.l, top: mp.t, width: mp.w, height: mp.h }, transition, function () {
								base.first = false;
								isReady = true;
								$(base.div).css({ opacity: 0 });
								$(base.imgMain).css({ opacity: 1 });
								$(base.img3).attr('src', src);
								base.Slideshow();

							});
						}
					}).fail(function () {
						$(base).hide();
					});
			}

			this.Slideshow = function () {
				if (isReady && this.opt.autoplay)
					this.timerId = setTimeout(function () {
						if (base.opt.autoplay && base.opt.onNext)
							base.opt.onNext.call(base, true);
					}, this.opt.autoplaySpeed);
			}

			this.SetImg(this.opt.src);
			this.SetAuto(this.opt.autoplay);
		});

	}
})(jQuery);
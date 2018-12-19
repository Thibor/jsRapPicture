var fullScreenMode = false;

function FullScreenOff(){
if(document.exitFullscreen)
	document.exitFullscreen();
else if(document.mozCancelFullScreen)
	document.mozCancelFullScreen();
else if(document.webkitExitFullscreen)
	document.webkitExitFullscreen();
}

function FullScreenOn(element){
if(element.requestFullscreen)
	element.requestFullscreen();
else if(element.mozRequestFullScreen)
	element.mozRequestFullScreen();
else if(element.webkitRequestFullscreen)
	element.webkitRequestFullscreen();
else if(element.msRequestFullscreen)
	element.msRequestFullscreen();
}

$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange',function(e){
fullScreenMode = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
if(fullScreenMode){
	$('.rapPicture').addClass('rapPictureF');
	$('.rapPicture').removeClass('rapPictureN');
	$('.fullscreen').text('Fullscreen Off');
}else{
	$('.rapPicture').addClass('rapPictureN');
	$('.rapPicture').removeClass('rapPictureF');
	$('.fullscreen').text('Fullscreen On');
}	
});

$(window).resize(function(){
$('.rapPicture div').finish();
$('.rapPicture img').finish();
});

$(window).scroll(function(){
$('.rapPicture div').finish();
$('.rapPicture img').finish();
});

(function($){
$.fn.jsRapPicture = function(options){
	
return this.each(function(){
	this.opt = $.extend({
		autoplay:false,
		autoplaySpeed:3000,
		transition:1000,
		showDefaultMenu:true,
		src:'',
		customMenu:[],
		onLoad:null,
		onClickMenu:null,
		onNext:null
	},options);
	let base = this;
	let isReady = true;
	this.timerId = 0;
	if($('img',this).length)
		this.opt.src = $('img',this).attr('src');
	$(this).empty().addClass('rapPicture rapPictureN');
	this.div = $('<div>').appendTo(this);
	this.img1 = $('<img>').attr('src',this.opt.src).addClass('rapPicture1').appendTo(this);
	this.img2 = $('<img>').attr('src',this.opt.src).addClass('rapPicture2').appendTo(this.div);
	this.img3 = $('<img>').attr('src',this.opt.src).addClass('rapPicture3').appendTo(this.div);
	var li = this.opt.showDefaultMenu ? '<li>Next Image</li><li>Previous Image</li><li class="fullscreen">Fullscreen On</li><li class="slideshow"></li>' : '';
	if(this.opt.customMenu.length)
		 li += '<li>' + this.opt.customMenu.join('</li><li>') + '</li>';
	 if(li)
		this.menu = $('<ul class="custom-menu">' + li + '</ul>').appendTo(this);
	$(this).bind({
		click:function(e){
			e.preventDefault();
			base.ClickNext(1);
			$(".custom-menu").hide();	
		},
		contextmenu:function(e){
			e.preventDefault();
			if(this.menu)
				$(this.menu).finish().toggle().css({top:e.clientY + "px",left: e.clientX + "px"});
			else
				base.ClickNext(0);
		}
	});
	$('li',this).bind({
		click:function(e){
			e.stopPropagation();
			var menuItem = $(this).text();
			if(base.opt.onClickMenu)
				base.opt.onClickMenu.call(base,menuItem);
			let hide = true;
			if(base.opt.showDefaultMenu)
				switch($(this).index()){
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
			if(hide)
				$(".custom-menu").hide();
		}
	});
	
	this.ClickNext = function(next){
		clearTimeout(this.timerId);
		if(this.opt.autoplay)
			this.opt.autoplay = false;
		else
			if(this.opt.onNext && isReady)
				this.opt.onNext.call(this,next);
	}
	
	this.SetAuto = function(v){
		this.opt.autoplay = v;
		$('.slideshow',this).text('Slideshow ' + (v ? 'Off' : 'On'));
		if(v)
			this.Slideshow();
		else
			clearTimeout(this.timerId);
	}
	
	this.SetFullscreen = function(v){
		$('.fullscreen',this).text('Fullscreen ' + (v ? 'Off' : 'On'));
		fullScreenMode = v;
		if(v)
			FullScreenOn(base);
		else
			FullScreenOff();
	}
	
	this.SetImg = function(src){
		isReady = false;
		$.get(src)
		.done(function(){ 
			$(base).show();
			let	w = $(base.img1).outerWidth();
			let h = $(base.img1).outerHeight();
			let p = $(base.img1).offset();
			$(base.img1).css('opacity',0).attr('src',src);
			$(base.img3).css('opacity',1);
			$(base.div).css({width:w,height:h,top:p.top - window.scrollY,left:p.left - window.scrollX,opacity:1});
			base.img1[0].onload = function(){
				let	width = $(base.img1).outerWidth();
				let height = $(base.img1).outerHeight();
				let p = $(base.img1).offset();
				if(base.opt.onLoad)
					base.opt.onLoad.call(base,width,height);
				$(base.img2).attr('src',src);
				$(base.img3).fadeTo(base.opt.transition,0);
				$(base.div).animate({left:p.left - window.scrollX,top:p.top - window.scrollY,width:width,height:height},base.opt.transition,function(){
					isReady = true;
					$(base.div).css('opacity',0);
					$(base.img1).css('opacity',1);
					$(base.img3).attr('src',src);
					base.Slideshow();
					
				});
			};
		}).fail(function(){
			$(base).hide();
		});
	}
	
	this.Slideshow = function(){
		if(this.opt.autoplay)
			this.timerId = setTimeout(function(){
				if(base.opt.onNext && base.opt.autoplay)
					base.opt.onNext.call(base,true);
			},this.opt.autoplaySpeed);
	}
	
	this.SetAuto(this.opt.autoplay);
});

}
})(jQuery);
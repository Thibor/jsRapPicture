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
	$('.rapPicture').addClass('rapPictureFS');
	$('.rapPicture1').removeClass('rapPictureStd rapPictureBorder').addClass('rapPictureFull');
	$('.rapPictureDiv').removeClass('rapPictureBorder');
	$('.fullscreen').text('Fullscreen Off');
}else{
	$('.rapPicture').removeClass('rapPictureFS');
	$('.rapPicture1').removeClass('rapPictureFull').addClass('rapPictureStd rapPictureBorder');
	$('.rapPictureDiv').addClass('rapPictureBorder');
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
	
var defaults={
auto:false,
pause:3000,
transformation:1000,
showMenu:true,
src:''
}
	
return this.each(function(){
	var base = this;
	this.menu = null;
	this.timerId = 0;
	this.opt = $.extend(defaults,options);
	$(this).addClass('rapPicture');
	if($('img',this).length)
		this.opt.src = $('img',this).attr('src');
	$(this).empty();
	this.div = $('<div>').addClass('rapPictureDiv rapPictureBorder').appendTo(this);
	this.img = $('<img>').attr('src',this.opt.src).addClass('rapPicture1 rapPictureStd rapPictureBorder').appendTo(this);
	this.img2 = $('<img>').attr('src',this.opt.src).addClass('rapPicture2').appendTo(this.div);
	this.img3 = $('<img>').attr('src',this.opt.src).addClass('rapPicture3').appendTo(this.div);
	if(this.opt.showMenu)
		this.menu = $('<ul class="custom-menu"><li data-action="next">Next Image</li><li data-action="previous">Previous Image</li><li class="fullscreen" data-action="fullscreen"></li><li class="slideshow" data-action="slideshow"></li></ul>').appendTo(this);
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
			switch($(this).attr("data-action")){
			case "next":
				base.ClickNext(1);
			break;	
			case "previous":
				base.ClickNext(0);
			break;	
			case "fullscreen":
				base.opt.auto = false;
				base.SetFullscreen(!fullScreenMode);
				$(".custom-menu").hide();
			break;
			case "slideshow":
				base.SetAuto(!base.opt.auto);
			$(".custom-menu").hide();
			break;
			}
		}
	});
	
	this.ClickNext = function(next){
		$('div',this).finish();
		$('img',this).finish();
		clearTimeout(this.timerId);
		if(this.opt.auto)
			this.opt.auto = false;
		else
			if(this.opt.onNext)
				this.opt.onNext.call(this,next);
	}
	
	this.SetAuto = function(v){
		this.opt.auto = v;
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
		var w = $(this.img).width();
		var h = $(this.img).height();
		var p = $(this.img).offset();
		$(this.img).css('opacity',0).attr('src',src);
		$(this.img3).css('opacity',1);
		$(this.div).css({width:w,height:h,top:p.top - window.scrollY,left:p.left - window.scrollX,opacity:1});
		this.img[0].onload = function(){
			var w = $(base.img).width();
			var h = $(base.img).height();
			var p = $(base.img).offset();
			$(base.img2).attr('src',src);
			$(base.img3).fadeTo(base.opt.transformation,0);
			$(base.div).animate({left:p.left - window.scrollX,top:p.top - window.scrollY,width:w,height:h},base.opt.transformation,function(){
				$(base.div).css('opacity',0);
				$(base.img).css('opacity',1);
				$(base.img3).attr('src',src);
				base.Slideshow();
			});
		};
		
	}
	
	this.Slideshow = function(){
		if(this.opt.auto)
			this.timerId = setTimeout(function(){
				if(base.opt.onNext && base.opt.auto)
					base.opt.onNext.call(base,1);
			},this.opt.pause);
	}
	
	this.SetAuto(this.opt.auto);
	this.SetFullscreen(fullScreenMode);
});

}
})(jQuery);
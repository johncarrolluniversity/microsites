var large_scroll;
function loaded() {
	large_scroll = new iScroll('large-wrapper', { 
	    hScroll: true,
	    vScroll:true,
	    momentum: true,
        zoom: false, //Default zoom status  
        zoomMin: 1,
        zoomMax: 4, 
        //wheelAction: 'scroll',
	    checkDOMChanges: true
	    });
}

document.addEventListener('DOMContentLoaded', loaded, false);

var config ;
var audioClip ;
var mode = 0 ;
var mute = false ;
var device = "PC" ;
var screenSize,bookSize,preBookSize ;
var pageIndex = 1 ;
var bookPos = {top:40,right:0,bottom:10,left:0}
var isLarge = false ; // 0 book 1 large
var zoomRate = 1 ; //放大的比例，针对上次比例
var bookRate = 1 ; //书本的长宽比例
var navWidth = 0 ;
var clickTime = new Date() ;
var clickSP = 300 ;

var pageMode = "HTML" ; // HTML IMG

function loadSetting()
{
    $.ajax({
        url: "setting.xml",
        dataType: "xml",
        success: function (xml){
			var js = "" ;
		   $("*",$(xml).children()).each(function(){
				if (js != "")
					js += "," ;
				 js += this.tagName + ":'" + filter($(this).text()) + "'" ;
		   });
		   
		   config = eval("({" + js + "})") ;

		   if (config.thumbnails == 0)
		        $(".menu-thumb").hide();   
		   if (config.sharebutton == 0)
		        $(".menu-share").hide();
		   if (config.aboutbutton == 0)
		        $(".menu-help").hide();
		   if (config.downloadpdf == 1)
		        $(".controls .menu-right").prepend("<li class='cmditem menu-down'><a href='" + config.pdfurl + "' target='_blank'></a></li>");
		       
		   screenSize = preBookSize = bookSize = {width:0,height:0};
           preBookSize = {width:config.pagewidth*2,height:config.pageheight} ;
           bookRate = preBookSize.width / preBookSize.height ;
           bookSize = getMaxBookSize() ;
           navWidth = 35 ;
           initPage();
           
           
         },
        error: function (xhr, ajaxOptions, thrownError) {
            showErrorByLocal();
        }
    });	
}



/*Initial page*/
function initPage()
{
    config.pages = new Array(config.pagecount);
    for(var i=0 ;i<config.pagecount ;i++)
        config.pages[i] = "page" + (i+1) ;
    audioClip = document.getElementById("audio-clip");
    
    
    //pageIndex = checkHash();
    
    var paramPageIndex = getUrlParam("page") ;
    if (paramPageIndex != null)
    {
        if (paramPageIndex < 1)
            paramPageIndex = 0 ;
        if (paramPageIndex > config.pages)
            paramPageIndex = config.pages ;
        pageIndex =  paramPageIndex ;     
    }

       
    $("#lbl_Author").html(config.ad_author);
    $("#lbl_Title").html(config.ad_title);
    $("#lbl-PageCount").html(config.pagecount);
    $("#lbl_Url").html(location.href.replace(location.hash,""));
    $(".book-nav").mouseover(function(){$(this).addClass("book-nav-over");})
    $(".book-nav").mouseout(function(){$(this).removeClass("book-nav-over");})
    
    if (config.bgcolor == undefined)
        config.bgcolor = "#888888" ;
      
    setBackgroundColor(config.bgcolor) ;

    if ((config.bgimage != undefined) && (config.bgimage != ""))
    {
        $("body").css("background-image","url(" + config.bgimage + ")") ;
        $("body").css("background-size","100% 100%") ;
    }
        
    if (config.bgsound == undefined)
        config.bgsound = "" ;

 
    document.title = config.ad_title;
        
    initLarge() ;    
    initBook();    
    initThumb(); 
    loadShow();
    
    

    
	/* Window events */
	$(window).bind('keydown', function(e){
	    if (e.keyCode==37) // → left
		    prev();
	    else if (e.keyCode==39) // ← right
		    next();
	    if (e.keyCode==48) // 0 thumb
		    thumb();
	    if ((e.keyCode==107) && (! isLarge)) // +
		    loadLarge();
	    if ((e.keyCode==109) && (isLarge)) // -
		    loadBook();
	}).bind('hashchange', function() {
			var page = checkHash();
			if (config.pages!=$("#magazine").turn('page'))
			    $("#magazine").turn('page', page);
	}).bind('orientationchange', function() {
		resizeViewPort();
	}).resize(function() {
		resizeViewPort();
	}).click(function() {
		//thumb();
	});

    resizeViewPort();
    bookReset();
    $("#preload").hide();
    $("#entity").show();
    

    
    //touch
    Hammer(document).on("doubletap swipeleft swiperight pinchout pinchin", function(ev) {
	    switch(ev.type)
	    {
	        case "doubletap":
	            if(isLarge)
	               loadBook(pageIndex);
	            else
	               loadLarge(pageIndex);
	            break ;
	        case "swipeleft":
	            next() ;
	            break ;
	        case "swiperight":
	            prev();
	            break ; 
	        case "pinchout":
	            zoomIn();
	            break ;
	        case "pinchin":
	            zoomOut();
	            break ;
	    }
        //trace(ev.type) ;

    });
    
    //mousewheel
    $(document).bind('mousewheel', function(event, delta){
        if (isLarge)
        {
            // mousewheel 用于 iscroll
            if(delta > 0)
                zoomIn();
            else
                zoomOut();
        }
        else
        {
          if(delta > 0)
            zoomIn();
        }


    });
    
    
    
    
}

//==================================================
//放大
//==================================================
function zoomIn()
{
    if (! isLarge)
    {
        //book
        loadLarge(pageIndex) ;
    }
    else
    {
        //large
        
       
    }

}


//==================================================
//缩小
//==================================================
function zoomOut()
{
    if (isLarge)
    {

	loadBook() ;
        
    }

}

 
//==================================================
//得到书本自动大小
//==================================================
function getMaxBookSize(w,h)
{
    
    var maxWidth = (w == undefined)?screenSize.width - navWidth * 2 - 20  : w;
    var maxHeight = (h == undefined)?screenSize.height - 60 : h ;
    var maxRate = maxWidth / maxHeight ;

    if (maxRate < bookRate)
    {
        //根据宽度缩放
        bookSize.width = maxWidth ;
        bookSize.height = maxWidth / bookRate ;
    }
    else
    {
        //根据高度缩放
        bookSize.height = maxHeight ;
        bookSize.width = maxHeight * bookRate ;
    }
    
    return bookSize ;
}

//==================================================
//得到左右，上下居中 {top:5,left:10}
//==================================================
function getCenterPos(containerWidth,containerHeight,objWidth,objHeight)
{
    var pos = {left:0,top:0};
    if (objWidth < containerWidth)
        pos.left = (containerWidth - objWidth) /2 ;
    if (objHeight < containerHeight)
        pos.top = (containerHeight - objHeight) /2 ;
    return pos ;        
}

//==================================================
//设置视图大小
//==================================================
function resizeViewPort(w,h)
{
    //得到屏幕大小
    screenSize = {width:$(window).width(),height:$(window).height()} ; 
    
    var oriWidth = preBookSize.width ;
    bookSize = getMaxBookSize(w,h) ;

    //缩放比例
    zoomRate = bookSize.width / oriWidth ;
    preBookSize = bookSize ;

    //设置书本的尺寸
    $("#magazine").turn('size', bookSize.width,bookSize.height);
    
    bookPos.left = (screenSize.width - bookSize.width)/2 ; 
    bookPos.top = (screenSize.height - bookSize.height)/2 + 5;

    $("#magazine").css("top",bookPos.top).css("left",0);
    $("#book-nav-left").css("top",bookPos.top).css("left",bookPos.left-navWidth).height(bookSize.height);
    $("#book-nav-right").css("top",bookPos.top).css("left",bookPos.left + bookSize.width).height(bookSize.height);
    
    scaleAnchor($('#magazine')) ;

    //设置缩略图的位置
    var arrow_w = 30;
    thumb_container_width =  screenSize.width - (arrow_w * 2)  ;
    $("#thumb-pages").css("left",arrow_w).width(thumb_container_width);

    
    //设置滚动条的区域
    var pos = getCenterPos(screenSize.width,screenSize.height,config.maxpagewidth,config.maxpageheight) ;

    $("#large-scroller").width(config.maxpagewidth).height(config.maxpageheight).css(pos);
    $("#large-wrapper").height(screenSize.height - 30).css("top",30);


}

 

//==================================================
//初始化书本
//==================================================
function initBook()
{
	$("#magazine").turn({
        gradients: !$.isTouch, acceleration: false, elevation: 50,
        display:(mode == 1)? 'single':'double',
        page: pageIndex,
		pages: config.pagecount,
        width:bookSize.width,
        height:bookSize.height,
		when: {
			turning: function(e, page, view) {
				var range = $(this).turn('range', page);
				for (page = range[0]; page<=range[1]; page++) 
					addPage(page, $(this));

			},

			turned: function(e, page) {
				pageIndex = page ;
				bookReset();
				
			}
		}
	});

}

//==================================================
//设置锚点的位置
//==================================================
function scaleAnchor(container)
{
    var _rate =  (bookSize.width/2) / config.pagewidth ;

    $(".axlink",container).each(function(){
        $(this).width( parseInt($(this).attr("data-width"))*_rate );
        $(this).height( parseInt($(this).attr("data-height"))*_rate );
        $(this).css("left",parseInt($(this).attr("data-left"))*_rate ) ;
        $(this).css("top",parseInt($(this).attr("data-top"))*_rate) ;
    })

}

//==================================================
//设置书本的翻页按钮
//==================================================
function bookReset()
{
    var showLeft = false ;
    var showRight = false ;
    
    if (pageIndex >1)
        showLeft = true ;
    if (pageIndex <config.pagecount)
        showRight = true ;
    
    if (showLeft)
        $('#book-nav-left').show();
    else
        $('#book-nav-left').hide();
        
    if (showRight)
        $('#book-nav-right').show();
    else
        $('#book-nav-right').hide();



}

function addPage(page, book) {	
	if (!book.turn('hasPage', page)) {
		book.turn('addPage', getPage(page), page);
	}

}

function getPage(_pageIndex)
{
    if (pageMode == "HTML")
        return getPageByHTML(_pageIndex) ;
    else
        return getPageByIMG(_pageIndex) ;
    
}
//==================================================
//根据HTML得到内容
//==================================================
function getPageByHTML(_pageIndex)
{
 
	var element = $('<div />', {'class': 'page '+((_pageIndex%2==0) ? 'odd' : 'even'), 'id': 'page-'+ _pageIndex }).html('<i class="loader"></i>');
	
    $.ajax({
      url: "m/" + _pageIndex + ".htm",
      dataType:"html",
      cache: false,
      success: function(_inhtml){
            
            //不是第一页或末页，加阴影
            if (config.hidesew == "1")
            {
                if ((_pageIndex != 1) && (_pageIndex != config.pagecount))
                    _inhtml += '<div class="grad grad-' + ((_pageIndex%2==0) ? 'odd' : 'even') + '"></div>'
            }

		    var _page = $(_inhtml) ;
		    
            $(".axlink",_page).each(function(){
                $(this).attr("data-width",parseInt($(this).css("width")));
                $(this).attr("data-height",parseInt($(this).css("height")));
                $(this).attr("data-left",parseInt($(this).css("left")));
                $(this).attr("data-top",parseInt($(this).css("top")));
            })
            
		    //20130815 
		    scaleAnchor($(_page)) ;
		    

            element.html(_page);

      }
    }); 
	return element ;
}

//==================================================
//根据图片得到内容
//==================================================
function getPageByIMG(page)
{
	var element = $('<div />', {'class': 'page '+((page%2==0) ? 'odd' : 'even'), 'id': 'page-'+page}).html('<i class="loader"></i>');
    var url = (mode == 0?"m":"m") + "/" + page + ".jpg" ;
    var img=new Image();
    img.onload=function(){
        var _inhtml = "" ;
        
        //double shadow
        if (mode == 0)
            _inhtml = "<div class='" + ((page%2==0) ? 'oddp' : 'evenp') + "'></div>" ;
		var _page = $("<div style='background-image:url(" + url + ");' class='page'" +  " >" + _inhtml + "</div>") ;

        element.html(_page);
    };
    img.src=url;
	return element ;
}



//==================================================
//得到书本位置 left top
//==================================================
function loadShow(_isLarge)
{
    if (_isLarge != undefined)
        isLarge = _isLarge ;
   
   if (! isLarge)
   {
        loadBook(pageIndex) ;
        isLarge = false ;
   }
   else
   {
        loadLarge(pageIndex) ;
        isLarge = true ;
   }

}

function loadBook(_pageIndex)
{
    $("#btn_zoom").removeClass("menu-zoomout");     
    isLarge = false ;
    $("#book-container").show();
    $("#large-container").hide();
    $("#magazine").turn('page',_pageIndex);
    bookReset();
}


//==================================================
//Large 单页模式
//==================================================
function initLarge()
{

}

function loadLarge(_pageIndex)
{
    $("#btn_zoom").addClass("menu-zoomout");     
    isLarge = true ;
    $("#book-container").hide();
    $("#large-container").show();
    
    $("#large-scroller").html('<i class="loader"></i>');
    if (_pageIndex != undefined)
        pageIndex = _pageIndex ;
    

    $.ajax({
      url: "l/" + _pageIndex + ".htm",
      dataType:"html",
      cache: false,
      success: function(_inhtml){
		    $("#large-scroller").html(_inhtml).dblclick(function(){loadBook(pageIndex)});
      }
    });



    $("#large-nav-left,#large-nav-right").hide();
    if (pageIndex > 1)
        $("#large-nav-left").show();
    if (pageIndex < config.pagecount)
        $("#large-nav-right").show();
        
}

function largeLeft()
{
    loadLarge(pageIndex-1); 
}
function largeRight()
{
    loadLarge(pageIndex+1); 
}





//==================================================
//缩略图
//==================================================
var thumb_container_width =  0 ;
var thumb_left = 0 ;
function initThumb()
{

    //bulid thumb
	var html = '<div id="thumblist"><table id="thumblist-entry" cellpadding="0" cellspacing="0" border="0"><tr>' ;
	for(var i=1;i<=config.pagecount;i++)
		html += "<td><a href='javascript:' onclick='thumbTo(" + i + ",event);' class='" + (i%2 == 1?"thumb-odd":"thumb-even") + "'><img src='s/" + i + ".jpg'><br>" + i + "</a></td>" ;
	html += "<tr></table></div>" ;
	$('#thumb-pages').html(html) ;
	
	$(".thumblist li").each(function(e){
		 var index = e ;
		 $(this).click(function(){
			gotopage(index+1);
		 }) 
	})
    $("#thumb-nav-left").addClass("disable");
    
    
    $("#book-container,#large-container").click(function(){
        //Click to hide
        if ($("#thumb-content").is(":visible")) 
            thumb() ;

    })

    //touch
    Hammer(document.getElementById("thumblist")).on("swipeleft swiperight", function(ev) {
	    switch(ev.type)
	    {
	        case "swipeleft":
	            thumbRight(ev);
	            break ;
	        case "swiperight":
	            thumbLeft(ev);
	            break ; 
	    }
	    
    });

}

 
function thumbLeft(e)
{
    thumbSlide("left");
    e.stopPropagation();
}
function thumbRight(e)
{
    thumbSlide("right");
    e.stopPropagation();
}
function thumbSlide(action)
{
    var value = 0 ;
    var rate = thumb_container_width / 2; //Moving length
    if (action == "right")
        value = thumb_left - rate ; 
    else
        value = thumb_left + rate ;


    if ( (value> 0) || (Math.abs(value) > $("#thumblist").width()))
        return ;
        
    thumb_left = value ;
    
    $("#thumblist").animate({left:thumb_left}, "slow");
    
    if ((value + rate) > 0)
        $("#thumb-nav-left").addClass("disable");
    else
        $("#thumb-nav-left").removeClass("disable");
        
    if (Math.abs(value - rate) > $("#thumblist").width())
        $("#thumb-nav-right").addClass("disable");
    else
        $("#thumb-nav-right").removeClass("disable");
}
function thumbTo(page,e)
{
    $("#thumb-content").slideToggle();
    gotopage(page);
    e.stopPropagation();
}

//==================================================
//命令
//==================================================

function first()
{
    if (! isLarge)
	    $("#magazine").turn('page',1);
    else
        loadLarge(1);
}
function prev()
{
    if (! isLarge)
	    $("#magazine").turn('previous');
    else
        loadLarge(pageIndex - 1);
	
}
function next()
{
    if (! isLarge)
	    $("#magazine").turn('next');
    else
        loadLarge(pageIndex +1);
}
function last()
{
    if (! isLarge)
	    $("#magazine").turn('page',config.pagecount);
    else
        loadLarge(config.pagecount);
    
}

function gotopage(page)
{
    if (! isLarge)
	    $("#magazine").turn('page',page);
    else
        loadLarge(page);
}

function thumb()
{
	$("#thumb-content").slideToggle();
}


 
function playAudio(type) {
    //alert(type);
    //audioClip.src = "r/" + type + ".mp3" ;
    //audioClip.play();
}

function pauseAudio() {
    audioClip.pause();
}


function setMute() {
    mute = !mute ;
    audioClip.muted = mute ;
    $("#btn_sound").toggleClass("menu-mute");
    setCookie("mute",mute?1:0);

    if (config.bgsound != "")
        document.getElementById('audio-bgsound').muted=mute;

    
} 

function help()
{
	$('#win-help').modal({
        containerCss: {width: 400,height: 200},
	});
}

function share()
{
	$('#win-share').modal({
        containerCss: {width: 400,height: 200},
	});
}

function shareto(flag)
{
    var shareTitle = "You may be interested in this flash page-flip book" ;
    var shareBody = "Folks, take a look at this cool  flipping book.%0a%0d%0a%0d" + location.href ;
    switch(flag)
    {
        case "mail":
            location.href = "mailto:?subject=" +  shareTitle + "&body=" + shareBody ;
            return ;
            break ;
        case "twitter":
            url = "https://twitter.com/intent/tweet?source=webclient&url={Url}&text={Body}"
            break ;
        case "facebook":
            url = "http://www.facebook.com/sharer/sharer.php?u={Url}&t={Body}";
            break ;
        case "google":
            url = "https://twitter.com/intent/tweet?source=webclient&url={Url}&text={Body}"
            break ; 
    }
    url = url.replace("{Url}",location.href).replace("{Body}", shareTitle) ;
    window.open(url) ;
}





//==================================================
//URL
//==================================================
function getUrlParam(name,defaultValue) {
    var reg = new RegExp("[?&]" + name + "=([^?&]*)[&]?", "i");
    var match = location.search.match(reg);
    return match == null ? ((defaultValue == undefined)?null:defaultValue) : match[1];
}
function getURL() {
	return window.location.href.split('#').shift();
}
function setUrlParam(name,value)
{
    var url = location.href ;
    var urlSearch = location.search ;
    var urlHash = location.hash ;
    var oldValue = getUrlParam(name) ;
    
    url = url.replace(urlSearch,"").replace(urlHash,"") ;

    if (oldValue == null)
        url += (urlSearch == ""?"?":"&") + name + "=" + value ;
    else
        url += urlSearch.replace(name + "=" + oldValue ,name + "=" + value) ;
    url += urlHash ;
    return url ;
}





function setBackgroundColor(color)
{
    var arrColor = color.split("-") ;
    var color1 = arrColor[0] ;
    var color2 = arrColor.length>1?arrColor[1]:color1 ;
    var types = ["webkit","moz","o","ms"] ;
    for(var i=0;i<types.length ;i++)
    {
        $("body").css("background-image","-" + types[i] + "-linear-gradient(top, " + color1 + ", " + color2 + ")") ;
    }
}


//==================================================
//哈希
//==================================================
function getHash() {
	
	return window.location.hash.slice(1);

}
function checkHash(hash) {

	var hash = getHash(), k;
    pageIndex = 1 ;
	if ((k=jQuery.inArray(hash, config.pages))!=-1) {
		$('nav').children().each(function(index, value) { 
			if ($(value).attr('href').indexOf(hash)!=-1) 
				$(value).addClass('on');
			else 
				$(value).removeClass('on');
		});
		pageIndex = k+1;
	}
	
	return pageIndex;
}

//==================================================
//获得COOKIE
//==================================================
function getCookie(c_name)
{
	if (document.cookie.length>0)
	  {
	  c_start=document.cookie.indexOf(c_name + "=");
	  if (c_start!=-1)
		{ 
		c_start=c_start + c_name.length+1; 
		c_end=document.cookie.indexOf(";",c_start);
		if (c_end==-1) c_end=document.cookie.length;
		return unescape(document.cookie.substring(c_start,c_end));
		} 
	  }
	return "";
}

//==================================================
//设置COOKIE
//==================================================
function setCookie(c_name,value,expiredays)
{
	var exdate=new Date();exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
}    

//==================================================
//过滤特殊字符
//==================================================
function filter(vInString)
{
    var s = "" + vInString + "";
	while(s.charAt(0)==" ")
	{
		s = s.substring(1);
	}
	while(s.charAt(s.length-1) == " ")
	{
		s = s.substring(0,s.length-1);
	}
	
	s = s.replace(/\'/g,"");
	
	return s;
}
  

//==================================================
//跟踪
//==================================================
function trace(msg)
{
    $("#trace").append( "<br>" + msg) ;
}

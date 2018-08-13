var assets_dir = "r" ;


function jsImport(path) {
    var i;
    var ss = document.getElementsByTagName("script");
    for (i = 0; i < ss.length; i++) {
        if (ss[i].src && ss[i].src.indexOf(path) != -1) {
            return;
        }
    }
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = path;
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(s);
}


$(document).ready(function(){
    //显示进度条
    //showLoading();
    
    //判断浏览器
    if (checkHTML5() == false)
    {
        showErrorByHtml();
    }
    else
    {
        showContent();
        loadSetting();
    }

})


function showLoading()
{
    $("#container").html('<div class="container" id="preload"><div  class="progress-box"><div><img src="' + assets_dir + '/loadingAnimation.gif" /></div><div class="progress-text">Powered by aXmag</div></div></div>');
}

function showErrorByHtml()
{
    $("#container").html('<div class="error-box">To test the HTML5 version locally, please open the link in Safari.<br>Or, please upload files to your server and test the HTML5 files. <br>You may find it useful to check out the online manual for more tips:<br><a href="http://www.axmag.com/manual/PC_Pro/index.htm" target="_blank">http://www.axmag.com/manual/PC_Pro/index.htm</a></div>');
}

function showErrorByLocal()
{
    $("#container").html('<div class="error-box"> This web browser does not support HTML5, please open the link in Safari or other web browsers to test HTML5 version locally.<br>Safari can be downloaded from:<br><a href="http://www.apple.com/safari/download/" target="_blank">http://www.apple.com/safari/download/</a></div>');
}

function showContent()
{
    //画界面
    var html = "" ;
    html +='<div class="container"  id="entity" style="display:none;">' ;
    html +='        <div id="book-header" class="controls">' ;
    html +='            <ul class="menu-left">' ;
    html +='                <li class="cmditem menu-home"><a href="javascript:" onclick="first();event.stopPropagation();"></a></li>' ;
    html +='                <li class="cmditem menu-thumb"><a href="javascript:" onclick="thumb();event.stopPropagation();"></a></li>' ;
    html +='                <li class="cmditem menu-zoomin" id="btn_zoom"><a href="javascript:" onclick="loadShow(! isLarge);event.stopPropagation();"></a></li>' ;
    html +='            </ul>' ;
    html +='            <ul class="menu-right">' ;
    html +='                <li class="cmditem menu-share"><a href="javascript:" onclick="share();event.stopPropagation();"></a></li>' ;
    html +='                <li class="cmditem menu-help"><a href="javascript:" onclick="help();event.stopPropagation();"></a></li>' ;
    html +='            </ul>' ;
    html +='            <div style="clear:both"></div>' ;
    html +='        </div>' ;
    html +='        <div id="book-container">' ;
    html +='            <div id="book-content">' ;
    html +='                <div id="book-nav-left" onclick="prev();event.stopPropagation();" class="book-nav book-nav-left">' ;
    html +='                    <img src="' + assets_dir + '/canvas.png" class="flipx" /></div>' ;
    html +='                <div id="book-nav-right" onclick="next();event.stopPropagation();" class="book-nav book-nav-right">' ;
    html +='                    <img src="' + assets_dir + '/canvas.png" /></div>' ;
    html +='                <div id="magazine">' ;
    html +='                </div>' ;
    html +='            </div>' ;
    html +='        </div>' ;
    html +='        <div id="large-container" >' ;
    html +='            <div id="large-content">' ;
    html +='                <div class="book-nav" id="large-nav-left" onclick="largeLeft(event)"><img src="' + assets_dir + '/canvas.png" class="flipx" /></div>' ;
    html +='                <div class="book-nav" id="large-nav-right" onclick="largeRight(event)"><img src="' + assets_dir + '/canvas.png" /></div>' ;
    html +='                <div id="large-wrapper">' ;
    html +='                    <div id="large-scroller"></div>' ;
    html +='                </div>' ;
    html +='            </div>' ;
    html +='        </div>' ;
        
    html +='        <div id="book-footer" onclick="event.stopPropagation();" >' ;
    html +='            <div id="thumb-nav-dot" onclick="thumb()"></div>' ;
    html +='            <div id="thumb-content">' ;
    html +='                <div id="thumb-nav-left" onclick="thumbLeft(event)" ><span></span></div>' ;
    html +='                <div id="thumb-nav-right" onclick="thumbRight(event)"><span></span></div>' ;
    html +='                <div id="thumb-pages"></div>' ;
    html +='            </div> ' ;
    html +='        </div>' ;
           
    html +='        <div id="win-share" class="book-dialog"> ' ;
    html +='           <p><b>Share:</b><br></p>' ;
    html +='            <ul class="sharelist">' ;
    html +='		        <li class="share-mail"><a href="javascript:" onclick="shareto(\'mail\')"></a></li>' ;
    html +='		        <li class="share-twitter"><a href="javascript:" onclick="shareto(\'twitter\')"></a></li>' ;
    html +='		        <li class="share-facebook"><a href="javascript:" onclick="shareto(\'facebook\')"></a></li> ' ;
    html +='            </ul><div style="clear:both"></div>' ;
    html +='            <br>' ;
    html +='	        <p><b>Url:</b><br><span id="lbl_Url"></span></p>' ;
    html +='        </div>' ;
            
    html +='        <div id="win-help" class="book-dialog">' ;
    html +='	        <p><b>Title:</b><br><span id="lbl_Title"></span></p>' ;
    html +='	        <p><b>Author:</b><br><span id="lbl_Author"></span></p>' ;
    html +='	        <p class="poweredby">powered by axmag</p>' ;
    html +='        </div>' ;
            
    html +='       <div style="display:none;">' ;
    html +='            <bgsound volume="-5000" id="sound_start" loop="1" src="' + assets_dir + '/start.mp3">' ;
    html +='            <bgsound volume="-5000" id="sound_end" loop="1" src="' + assets_dir + '/end.mp3">' ;
    html +='            <bgsound volume="-5000" id="sound_full" loop="1" src="' + assets_dir + '/full.mp3">' ;
    html +='            <audio id="audio-clip" style="border:1px solid red"></audio>' ;
    html +='            <audio id="audio-bgsound"  type="audio/mp3" autoplay="autoplay" ></audio>' ;
    html +='        </div>' ;
    html +='</div>' ;

    $("#container").html(html) ;
}
function checkHTML5()
{
    try
    {
        document.createElement("canvas").getContext("2d");
        return true ;
    } 
    catch(e) 
    {
        return false ;
    }
    
}


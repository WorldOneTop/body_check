/*
	Spatial by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
*/

// zoom 초기화 및 동적 선언
function image_zoom_init(id){
    if(typeof(id) != "string"){ //문자열 배열로 한번에 할경우
        for(var i =0;i < id.length; i++){
            $('#'+id[i]).imageZoom({zoom: 350});
        }
    }else{//동적으로 아이디 하나씩 추가할 경우
        $('#'+id).imageZoom({zoom: 350});
    }
}


// 이미지 올렸을때 올린 이미지를 미리보기 해주기
// input태그.onchange(event, 미리보여줄 개체의 id)
function func_imagePriview(event, id) {
    // 입력 취소한 부분일 경우 원래 해놨던 이미지로 교체(placeholder에 저장)
    if(event.target.value.length == 0){
        var image = document.getElementById(id)
        if(!image.placeholder)
            image.src = '';
        else
            image.src = image.placeholder;

        return;    
    }
    if($("#"+event.path[0].id)[0].files[0].type.substr(0,6) != 'image/'){
        alert("이미지 파일을 올려주세요.");
        return;
    }
    
    var reader = new FileReader();
    reader.onload = function(event) {
        var image = document.getElementById(id)
        image.style.left= 0;
        image.src = event.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// 해당 요소로 이동하기
function scroll_to(id, time){
    if(screen.width <= 980){ // 모바일용이라 위에가 안가려짐
        $('html, body').animate({scrollTop : $("#"+id).offset().top}, time);
    }else{                // 위에 배너가 가려져서 추가로 내려야함
        $('html, body').animate({scrollTop : $("#"+id).offset().top - $('#header').height()}, time);
    }
}

// 자세한 내용 팝업 띄우기
function popup(event, html){
    var div = $("#popup");

    $("#popup_contents").html(html);
    
    var x = event.pageX+7;
    var y = event.pageY-7;
    
    // 팝업창이 스크린을 벗어날 경우
    if(window.innerWidth < event.clientX+div.width())
        x -= div.width()+7;
    if(window.innerHeight < event.clientY+div.height())
        y -= div.height()+7;

    // 음수 안되게
    if(x <0)
        x = 0;
    if(y <0)
        y = 0;
    
    // 위치,컨텐츠 및 보이게 설정
    div.css("left", x+'px');
    div.css("top", y+'px');
    div.css("display", "block");
}


(function($) {

	skel.breakpoints({
		xlarge:	'(max-width: 1680px)',
		large:	'(max-width: 1280px)',
		medium:	'(max-width: 980px)',
		small:	'(max-width: 736px)',
		xsmall:	'(max-width: 480px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 100);
			});

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Off-Canvas Navigation.

			// Navigation Panel Toggle.
				$('<a href="#navPanel" class="navPanelToggle"></a>')
					.appendTo($body);

			// Navigation Panel.
				$(
					'<div id="navPanel">' +
						$('#nav').html() +
						'<a href="#navPanel" class="close"></a>' +
					'</div>'
				)
					.appendTo($body)
					.panel({
						delay: 500,
						hideOnClick: true,
						hideOnSwipe: true,
						resetScroll: true,
						resetForms: true,
						side: 'right'
					});

			// Fix: Remove transitions on WP<10 (poor/buggy performance).
				if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
					$('#navPanel')
						.css('transition', 'none');


	});

})(jQuery);


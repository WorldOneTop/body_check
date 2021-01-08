/*
	Spatial by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
*/

(function($) {
    
    
    // 커스텀 다이로그 (로그인)
       $(function(){
            $("#dialog").dialog({
                autoOpen:false, //자동으로 열리지않게
                position:[100,200], //x,y  값을 지정
                //"center", "left", "right", "top", "bottom"
                modal:true, //모달대화상자
                resizable:false, //크기 조절 못하게
                
                buttons:{
                    "확인":function(){
                        $(this).dialog("close");
                    },"취소":function(){
                        $(this).dialog("close");
                    }
                }
            });

            //창 열기 버튼을 클릭했을경우
            $("#btn").on("click",function(){
                $("#dialog").dialog("open"); //다이얼로그창 오픈                
            });
        });
    //여기까지
    

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
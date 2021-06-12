

// 사진 확대창에서는 못움직이게
$('#picture').on('scroll touchmove mousewheel', function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
});
// 이미지 확대 클릭
function picture_click(obj){
    var div = document.getElementById('picture'); 
    div.children[0].style.top = window.innerHeight /2 - div.children[0].height/2 +'px';
    div.children[0].src = "";
    div.children[0].src = obj.src;
    //배경 설정
    div.style.display = "block";
    div.style.top = window.scrollY+'px';
    
    // 이미지 설정
    div.children[0].style.top = window.innerHeight /2 - div.children[0].height/2 +'px';
}



$(document).ready(function() {
    $(window).scroll( function(){
        // 스크롤 이동 리모컨
        if ($(this).scrollTop() > 500) {
                $('#move_top_div').fadeIn();
            } else {
                $('#move_top_div').fadeOut();
            }
        
        
        // 스크롤시 메뉴 나오게
        $('.hiddenSection').each( function(i){
            
            var elementY = $(this).offset().top;
            var windowY = $(window).scrollTop() + $(window).height()*2/3;
            if( $(this).css('opacity')=='0' && windowY > elementY ){
                if($(this).attr('id') == 'main_1'){
                    $(this).animate({'opacity':'0.65','margin-top':'0px'},1200);
                    $(this).animate({'opacity':'1'},350);
                }else if($(this).attr('id') == 'main_2'){
                    $(this).animate({'opacity':'1','width':'100%'},1000);
                }
            }
            
        }); 
    });
    
    
    
    $("#move_top_div").click(function() {
            $('html, body').animate({
                scrollTop : 0
            }, 300);
            return false;
        });
    
    // guide layout init
   var slide =  $('.card')
    $(slide).first().addClass('active-img');
    $(slide).last().addClass('small').addClass('prev');
    $(slide).last().prev('.card').addClass('smaller prevSmall');
    $(slide).first().next('.card').addClass('small next');
    $(slide).first().next('.card').next('.card').addClass('smaller nextSmall');
    $('.guide').css('padding-bottom','300px')
});

  
function guideClick(object){
    var obj = $(object);
    if(obj.hasClass('active-img')){
        obj.children().slideToggle(500);
    }else{
        $('.active-img').children().slideUp();
        if(obj.hasClass('nextSmall')){
            guide_next();
            setTimeout(() => {guide_next();},150);
        }else if(obj.hasClass('prevSmall')){
            guide_prev();
            setTimeout(() => {guide_prev();},150);
        }else if(obj.hasClass('next')){
            guide_next();
        }else if(obj.hasClass('prev')){
            guide_prev();
        }
    }
}

function guide_next(){
		var Active = $('.active-img'), Prev = $('.prev'), Next = $('.next'), SmallPrev = $('.prevSmall'), SmallNext = $('.nextSmall');
  
    $(Active).addClass('small prev ').removeClass('active-img');
    $(Next).addClass('active-img').removeClass('small next');
    $(Prev).addClass('smaller prevSmall ').removeClass('small prev ');
    $(SmallNext).addClass('small next').removeClass('smaller nextSmall ');
    $(SmallPrev).removeClass('prevSmall').addClass('nextSmall');
}
function guide_prev(){
    var Active = $('.active-img'), Prev = $('.prev'), Next = $('.next'), SmallPrev = $('.prevSmall'), SmallNext = $('.nextSmall');
  
    $(Active).removeClass('active-img').addClass('small next');
    $(Prev).removeClass('small prev').addClass('active-img');
    $(Next).removeClass('small next').addClass('smaller nextSmall');
    $(SmallPrev).addClass('small prev').removeClass('smaller prevSmall');
    $(SmallNext).removeClass('nextSmall').addClass('prevSmall');
}
function de_click(obj, isDe){
    // 1. 아무것도 없는데 클릭
    // 2. 반대편이 열려있는데 클릭
    // 3. 현재 열려있는거 닫기
    
    if($(obj).hasClass("active")){ // 닫을때
        $('#'+(isDe ? 'de' : 'cpy')+'Content').slideUp(600);
    }else{ // 열때
        if($('#'+(isDe ? 'cpy' : 'de')).hasClass("active")){ //반대편이 열려있으면
            $('#'+(isDe ? 'cpy' : 'de')+'Content').slideUp(200);
            setTimeout(() => {
                $('#'+(isDe ? 'cpy' : 'de')).toggleClass('active');
                $('#'+(isDe ? 'de' : 'cpy')+'Content').slideDown(500);
            },200);
       }else{
            $('#'+(isDe ? 'de' : 'cpy')+'Content').slideDown(600);
        }
    }
        $(obj).toggleClass('active');
}
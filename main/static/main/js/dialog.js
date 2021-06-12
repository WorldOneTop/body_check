// ajax 실행동안 실행될 함수
ajax_run = false;
$(document).ready(function() {
   $(document).ajaxStart(function () {
       if (ajax_run == false){ 
            ajax_run = true
            loading_login();
            timerId = setInterval(loading_login, 700);
       }
   });
   
   $(document).ajaxStop(function () {
        ajax_run = false;
        clearInterval(timerId);
   });
});
function loading_login(){
    $('#alert_email').append('. ');
}

               
               
// 로그인 form 이상 유무
function checkForm_Login(){
    var str = $('#input_email').val();
    if(str.length==0){//빈 문자열시 submit은 안하고 창은 닫기
        close_dialog();
    }
    else if($('#input_password').val().length == 0){
        $('#alert_email').text("비밀번호를 입력해주세요.");
        $('#alert_email').fadeIn(300);
        $('#alert_email').fadeOut(900);
    }
    else if(checkEmail(str)){//이메일 체크하고, 데이터베이스 확인
        $(':focus').blur();
        $('body').css("pointer-events","none");
        $('.modal').addClass("shadow_all")
        
        $('#alert_email').text("로그인 중");
        $('#alert_email').fadeIn(500);
        // 데이터베이스 ajax조회
        $.ajax({
            url:'/login/',
            data : { 'id': str, 'pw': $('#input_password').val() },
            type:'POST',
            success:function(cased){
                //비밀번호 틀렸을때
                if(cased==1){
                    $('body').css("pointer-events","auto");
                    $('.modal').removeClass("shadow_all")
                    $('#input_password').focus();
                    $('#alert_email').text("비밀번호가 맞지않습니다.");
                    $('#input_password').val("");
                    $('#alert_email').fadeOut(1300);
                }
                //비밀번호 맞았을때
                else if(cased == 2){
                    close_dialog();
                    $('form').addClass('complete');
                    sessionStorage.setItem('id', str);
                    setTimeout(function(){
                        if($('#modal-container').hasClass('mypage')){
                            document.location.pathname = "/mypage/";
                        }
                        else if($('#modal-container').hasClass('comm_write')){
                            var isBug = document.getElementById("h_bug").style.color == "rgb(243, 40, 83)";
                            window.location.href = '../../write/'+ (isBug ? 1 : 0)+ '/0';
                        }
                        else{
                            location.reload();
                        }
                            
                        },600);
                }
                //등록된id가 아닐때                
                else{
                    if (window.confirm("존재하지 않는 ID 입니다.\n회원가입을 진행하시겠습니까?")) {
                        document.getElementById("hidden_input_email").value = str;
                        document.getElementById("hidden_signup_form").submit();
                    }else{
                        $('#input_email').focus();
                        $('body').css("pointer-events","auto");
                        $('.modal').removeClass("shadow_all")
                        $('#alert_email').fadeOut(300);
                    }
                }
            }
        }); 

        
        

    }
    else{
        $('#alert_email').text("email 형식을 확인해주세요.");
        $('#alert_email').fadeIn(300);
        $('#alert_email').fadeOut(900);
    }
    return false;//false 하면 이벤트 전파 막는듯(submit 안함?)
};


// form요소 클릭시 닫는거 막음(이벤트 전파 막기) bug fix
$(".login_form").click(function(event) {
    event.stopPropagation();;
});

//다이얼로그 끄기
$('#modal-container').click(function(e){
    close_dialog();
});



//다이얼로그 띄우기
// navpanel이 열려 있을시 클릭 안되는 버그 fix
function dialog_click(id, to) {
  $("form").removeClass('complete'); //로그인 양식 띄워놓기
  $('#navPanel').removeClass('visible'); //판넬이 닫히면서 창이 뜰 수 있도록
  $('#modal-container').removeAttr('class').addClass(id+' '+ to);
  $('body').addClass('modal-active');
  document.getElementById('input_email').focus();
}



// email 확인 정규식
function checkEmail(myValue) { 
    // test계정의 경우 허용
    if(myValue == 'test'){
        return true;
    }
    
    var email = myValue;
    var exptext = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
        if(exptext.test(email)==false){
            //이메일 형식이 알파벳+숫자@알파벳+숫자.알파벳+숫자 형식이 아닐경우            
            return false;
        };
        return true;
};

//다이얼로그 끄기
function close_dialog() {
  $('#modal-container').addClass('out');
  $('body').removeClass('modal-active');
}
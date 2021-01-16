// 로그인 form 이상 유무
function checkForm_Login(){
    var str = $('#input_email').val();
    if(str.length==0){//빈 문자열시 submit은 안하고 창은 닫기
        close_dialog();
        return false;
    }
    else if(checkEmail(str)){//이메일 체크하고, 데이터베이스 확인
        $(':focus').blur();
        $('body').css("pointer-events","none");
        $('#alert_email').text("로그인 중입니다.");
        $('#alert_email').fadeIn(600);

        return true;
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
function dialog_click(id) {
  $("form").removeClass('complete'); //로그인 양식 띄워놓기
  $('#navPanel').removeClass('visible'); //판넬이 닫히면서 창이 뜰 수 있도록
  $('#modal-container').removeAttr('class').addClass(id);
  $('body').addClass('modal-active');
}



// email 확인 정규식
function checkEmail(myValue) {        
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
// 로그인.js에서 옮김
$(".login_button").click(function(event) {
  event.preventDefault();
  $(".login_form").addClass('complete');
//     form요소 클릭시 닫는걸 막지만 버튼 클릭시 dialog창 닫기 위해
  $("#modal-container").addClass('out');
  $('body').removeClass('modal-active');
});


// form요소 클릭시 닫는거 막음(이벤트 전파 막기) bug fix
$(".login_form").click(function(event) {
    event.stopPropagation();
});

//다이얼로그 끄기
$('#modal-container').click(function(e){
  $(this).addClass('out');
  $('body').removeClass('modal-active');
});



//다이얼로그 띄우기
// navpanel이 열려 있을시 클릭 안되는 버그 fix
function dialog_click(id) {
  $("form").removeClass('complete'); //로그인 양식 띄워놓기
  $('#navPanel').removeClass('visible'); //판넬이 닫히면서 창이 뜰 수 있도록
  $('#modal-container').removeAttr('class').addClass(id);
  $('body').addClass('modal-active');
}





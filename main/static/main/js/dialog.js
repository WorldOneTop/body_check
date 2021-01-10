//다이얼로그 끄기
$('#modal-container').click(function(){
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





$('#modal-container').click(function(){
  $(this).addClass('out');
  $('body').removeClass('modal-active');
});



// navpanel이 열려 있을시 클릭 안되는 버그 fix
function dialog_click(id) {
  $('#navPanel').removeClass('visible'); //판넬이 닫히면서 창이 뜰 수 있도록
  $('#modal-container').removeAttr('class').addClass(id);
  $('body').addClass('modal-active');
}


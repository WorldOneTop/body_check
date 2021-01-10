
$(".login_button").click(function(event) {
  event.preventDefault();
  $(".login_form").addClass('complete');
});


$("#test").click(function(event) {
    alert("Asd");
  $("form").removeClass('complete');
});
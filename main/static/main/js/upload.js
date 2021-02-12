var fileUpload = document.getElementById("image_upload_form");
var fileUploadInput = document.getElementById("image_upload_input");
var ajax_image;
add_listener();

function dragover(){
      fileUpload.classList.add("drag");
      fileUpload.classList.remove("drop", "done");
}
function stop_dragover(e){
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.effectAllowed = 'none';
  e.dataTransfer.dropEffect = 'none';
}
function dragleave(){
      fileUpload.classList.remove("drag");
}
function start() { 
  fileUpload.classList.remove("drag");
  fileUpload.classList.add("drop");
  setTimeout(() => remove_listener(), 100);
  image_upload(url);
}                            // 다끝나고 나오는 V표시 시간
function retry_upload(){
    $("#ani_circle").css("animation",'');
    $("#ani_circle").css("-webkit-animation",'');
    $("#image_upload_form").removeClass("done").removeClass("drop");
    fileUpload.style.cursor = "pointer";
    fileUploadInput.setAttribute("type","file");
    fileUploadInput.style.cursor = "pointer";
    add_listener();
    // success 버튼 감추기
    $("#submit_success").css("display",'none')
    // submit 버튼 출현
    $("#result_submit").css("display",'')
    // 해당 변수가 정의가 안되있는경우(image업로드안했을때)가 있어서 아래에 배치
    ajax_image.abort();
    $("#result_image").fadeOut(0);
    $("#image_upload_form").fadeIn(400);
    
    
    
}
function add_listener(){
    fileUpload.removeEventListener("dragover", stop_dragover);
    fileUpload.addEventListener("dragover", dragover);
    fileUpload.addEventListener("dragleave", dragleave);
    fileUpload.addEventListener("change", start);
}
function remove_listener(){
    fileUpload.removeEventListener("dragover", dragover);
    fileUpload.addEventListener("dragover", stop_dragover);
    fileUpload.removeEventListener("dragleave", dragleave);
    fileUpload.removeEventListener("change", start);
    fileUpload.style.cursor = "default";
    fileUploadInput.setAttribute("type","text");
    fileUploadInput.style.cursor = "default";
}



// 이미지 업로드시 실행할 ajax
function image_upload(url) {
    // 체크박스 확인
    var text = [];
    $("input:checkbox[name=bodycheck_check]").each(function() {
        if(this.checked == true){
         text.push(this.id);
        }
    });
    if(text.length == 0){
        $("#image_upload_form").removeClass("done").removeClass("drop");
        alert("하나 이상 체크해주세요.");
        return;
    }
    // 파일 종류 확인
    if($("#image_upload_input")[0].files[0].type.substr(0,6) != 'image/'){
        $("#image_upload_form").removeClass("done").removeClass("drop");
        alert("이미지 파일을 올려주세요.");
        return;
    }
    
    // 애니메이션 설정
    var ani = $("#ani_circle");
    var i = 1;
    var ani_timeout = setTimeout( function(){
        ani.css('animation-play-state','paused');
    }, 12000);
    
    
    // 보낼 데이터 설정
    var formData = new FormData();
    formData.append('photo',$("#image_upload_input")[0].files[0]);
    formData.append('text',text+"");
    
    ajax_image = $.ajax({
        url: url,
        data: formData,
        type: 'POST',
        dataType:'json',
        processData : false,
        contentType : false,
        success: function (result) {
            retry = document.getElementById("retry");
            //처리 도중 retry 방지
            retry.setAttribute("href","");
            
            clearTimeout(ani_timeout);
            ani.css("-webkit-animation",'progress-animate-fast 0.3s ease 0.3s');
            ani.css("animation",'progress-animate-fast 0.3s ease 0.3s');
            setTimeout(() => fileUpload.classList.add("done"), 400);
            
            result_img_path = result['result_img'];
            if(result_img_path == ""){// 값 못찾았을때
                alert("값을 찾지 못했습니다.");
            }else{
                delete result['result_img'];

                setTimeout( function(){
                    document.getElementById('result_image').setAttribute("src",result_img_path);
                    $("#image_upload_form").fadeOut(0);
                    $("#result_image").fadeIn(400);
                    for (var key in result){
                        document.getElementById("result_"+key).value = result[key]; 
                    }
                    setTimeout(() => resize_tab(), 500);
                    
                   

                }, 1600);    
            }
        },error:function(request,status,error){
            if(error == "abort"){
                clearTimeout(ani_timeout);
            }
            else{
                window.location.href="../error?case=1"
            }
        },complete : function() {
         //처리 완료시 다시 허용
         retry.setAttribute("href","javascript:retry_upload()");
    }

    });
}
// 사용자가 나가거나 이동시 해당 사진 삭제
window.onbeforeunload = function() {
    $.ajax({
        url: "del_img/",
        data: "",
        type: 'POST'
    });
}
// 결과 제출 버튼
$("#result_submit").click( function() {
    var form = document.getElementById("form_submit");
    var result = {};
    var emptyList = true;
    
    for(var i = 0; i < form.elements.length; i++){
        result[form.elements[i].id] = form.elements[i].value;
        if(form.elements[i].value && i < form.elements.length-1){
            emptyList = false;
        }
    }
    
    if(emptyList){
        alert("값을 입력해주세요.");
    }
    else{
        $.ajax({
        url: "upload_change/",
        data: {"dict":JSON.stringify(result)},
        type: 'POST',
        success: function (result) {
            // 입력값들 초기화
            for(var i = 0; i < form.elements.length; i++){
                form.elements[i].value = "";
            }
            // submit 버튼 감추기
            $("#result_submit").css("display",'none')
            // success 버튼 출현
            $("#submit_success").css("display",'')
        },error:function(request,status,error){
            window.location.href="../error?case=1"
        } 
    });
    }
} );
    

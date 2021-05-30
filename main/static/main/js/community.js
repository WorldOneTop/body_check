function init_comm(list){
    // 글 띄우기
    var contentDiv = document.getElementById('list');
    contentDiv.innerHTML = "";
    var append;
    for(var i=0;i<list.length;i++){
        append = "<tr style='cursor:pointer' onclick='listClick(this);'>";
        append += "<td>";
            if(list[i]['email'] == 'dlwpdlf147@naver.com')
                append += '<i class="fas fa-check" style="color:red"> </i><b> 관리자</b>';
            else
                append += list[i]['email__aka'];
        append +="</td>";
        append += "<td>";
            append += list[i]['title'];
            if(list[i]['isSecret']){
                append+= '<i class="fas fa-lock"></i>';
            }else if(list[i]['isRevise']){ 
                append+= '<i class="fas fa-cut"></i>';
            }
        append +="</td>";
        append += "<td>";
            append += list[i]['date'].substr(0,10);
        append +="</td>";
        append +="</tr>";
        contentDiv.insertAdjacentHTML('beforeend',append);
        contentDiv.children[i].placeholder = list[i]['id'];
    }

    // 색상 변경 및 display 바꾸기
    var isBug = window.location.href.split('/');
    isBug = isBug[isBug.length-3] == 1
    if(isBug){
        document.getElementById("h_board").style.color = "";
        document.getElementById("h_bug").style.color = "#f32853";
    }else{
        document.getElementById("h_bug").style.color = "";
        document.getElementById("h_board").style.color = "#f32853";
    }
        $("#board_div").fadeToggle(300);
}
// 자유게시판 or 버그 및 건의 게시판 글자 클릭
function comm_clickHeader(isBug){
    window.location.href = '../../' + isBug + '/0';
}
// 글 작성 버튼
function comm_edit(isLogin){
    if(isLogin){
        var isBug = window.location.href.split('/');
        isBug = isBug[isBug.length-3] == 1
        window.location.href = '../../write/'+ (isBug ? 1 : 0)+'/0';
    }else{
        alert('먼저 로그인을 해주세요.');
        dialog_click('six', 'comm_write');
    }
}
// 글 리스트 클릭
function listClick(obj){
    window.location.href = '../../visited/' + obj.placeholder;
}

// write page init
function init_comm_write(data){
    var isRevise = window.location.href.split('/');
        
    if(data['isMe']){ // 만약 수정하러 온거면
        if(isRevise[isRevise.length-3] == 3){
            window.location.href = '../../'+data['isBug']+'/'+data['id']
        }
        document.getElementById("title").value = data['title'];
        document.getElementById("content").value = data['content'];
        document.getElementById('isSecret').checked = data['isSecret'];
        if(data['picture'])
            document.getElementById('image_label').innerText = data['picture'];
    }
    else if(isRevise[isRevise.length-2] != 0){
        window.location.href = '../0';
    }
    
    var header = document.getElementById("comm_write_header");
    var isBug = window.location.href.split('/');
    isBug = isBug[isBug.length-3] == 1
    
    if(!isBug){
        header.children[0].innerText = "FREE BOARD";
        header.children[1].innerText = "자유 게시판";
        document.getElementById('isSecret_label').style.display = "none";
    }else{
        header.children[0].innerText = "BUG REPOART";
        header.children[1].innerText = "버그 신고 및 개선사항을 전해주세요.";
        document.getElementById('isSecret_label').style.display = "";
    }
    // textarea 높이 감지하기위해서
    $("#content").on("keyup", function() {
        textarea_height_resize('content');
    });
}

// textarea 높이 자동 늘리기
function textarea_height_resize(id){
  var textEle = $('#'+id);
  textEle[0].style.height = 'auto';
  var textEleHeight = textEle.prop('scrollHeight') + 2;
  textEle.css('height', textEleHeight);
}
// write 이미지 업로드
function image_change(event){
    // 이미지가 없다면
    if(!event.target.files[0]){
        document.getElementById('image_label').innerText = "이미지 업로드";
        return;
    }
    // 이미지 파일인지
    if(event.target.files[0].type.substr(0,6) != 'image/'){ 
        alert("이미지 파일만 올려주세요.");
        return;
    }
   document.getElementById('image_label').innerText = event.target.value;
    
}
function comm_write_save(obj){
    var title = document.getElementById("title").value;
    var content = document.getElementById("content").value;
    var image = document.getElementById("image").files[0];
    var isSecret = document.getElementById('isSecret').checked;
    
    if(! (title && content)){
        alert('모두 작성해주세요.');
        return;
    }
    obj.disabled = true;
    
    var formData = new FormData();
    formData.append('title',title);
    formData.append('content',content);
    if(image)
        formData.append('image',image);
    else
        formData.append('image',document.getElementById('image_label').innerText);
    if(isSecret)
        formData.append('isSecret',isSecret);
    
    $.ajax({
        url: 'save',
        data: formData,
        type: 'POST',
        dataType:'text',
        processData : false,
        contentType : false,
        success: function (result) {
            alert('완료되었습니다.');
            window.location.href = "../../../visited/"+location.href.split("/")[location.href.split("/").length-2];
        },error:function(request,status,error){
            // console.log(request,status,error)
        },complete : function() {
            obj.disabled = false;
        }
    });
}

//init_comm_visited
function init_comm_visited(data){
    if(data['isSecret']){
        alert('비밀글입니다.');
        window.history.back();
    }
    var div = document.getElementById('content');
    div.children[0].children[0].innerText = data['title'];
    if(data['isRevise']){
        div.children[0].children[0].innerHTML += '<font style="border:solid;border-radius:12px;padding:2px;font-size:medium;color:gray;margin-left: 1em;">수정됨</font>';
    }
    div.children[0].children[1].innerText = data['date'].substr(0,10);
    div.children[1].innerText = data['content'];
    if(data['picture']){
        div.children[2].src = '/media/'+data['picture'];
        image_zoom_init('imageFile')
    }
    else{
        div.children[2].src ="";
    }
    
    if(data['isMe']){
        document.getElementById('revise').style.display = "block";
        document.getElementById('revise').placeholder = data['id']
    }
    else
        document.getElementById('revise').style.display = "none";
}
// 글 수정하기
function comm_revise(obj){
    window.location.href = '../../write/3/' + obj.parentNode.placeholder;

}
function comm_delete(obj){
    obj.disabled = true;
    if(window.confirm("정말 삭제하시겠습니까?")){
         $.ajax({
            url: 'remove',
            data: '',
            type: 'POST',
            dataType:'text',
            processData : false,
            contentType : false,
            success: function (result) {
                alert('완료되었습니다.');
                window.location.href = "../../../community/0/0";
            },error:function(request,status,error){
                // console.log(request,status,error)
            },complete : function() {
                obj.disabled = false;
            }
        });
    }else{
        obj.disabled = false;
    }
}
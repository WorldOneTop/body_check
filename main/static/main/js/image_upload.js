function image_upload() {
                var formData = new FormData();
                formData.append('photo',$("#id_image")[0].files[0]);
                $.ajax({
                    url: "{% url 'upload_img' %}",
                    data: formData,
                    type: 'POST',
                    dataType:'json',
                    processData : false,
                    contentType : false,
                    success: function (result) {
                        obj = result;
                        // if(obj['code'] == 200){
                        //     text = "<br>체중 : "+obj.weight;
                        //     text = "<br>골격근량 : "+obj.muscle;
                        //     text = "<br>체지방률 : "+obj.fat;
                        //     }
                        // else{
                        //     $("#field").html("에러 <br>"+obj.code);
                        // }
                         $("#field").append("총 걸린 시간 : " +obj['allTime']);
                         $("#field").append("<br>");

                         $("#field").append("ocr 이미지 전처리 및 응답 받는데 걸린 시간 : " +obj['ocrTime']);
                         $("#field").append("<br>");

                         $("#field").append("결과를 이미지파일로 만드는데 걸린 시간 : "+ obj['imageSaveTime'] );
                         $("#field").append("<br>");
                         delete obj['allTime']
                         delete obj['ocrTime']
                         delete obj['imageSaveTime']
                        
                         origin_img = obj['origin_img']
                         result_img = obj['result_img']
                         delete obj['origin_img']
                         delete obj['result_img']
                         
                         for (var key in obj){
                             $("#field").append(key + " : " + obj[key]);
                             $("#field").append("<br>");
                        }
                         $("#field").append('왼쪽은 원본,   오른쪽은 결과 ')
                         $("#field").append("<br>");
            
                        img1 = '<img src = "';
                        img1 += origin_img;
                        img1 += '"/>';
                        $("#field").append(img1);
                        

                        img1 = '<img src = "';
                        img1 += result_img;
                        img1 += '"/>';
                        $("#field").append(img1);
                    },error:function(request,status,error){
                        alert("ajax error\ncode:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                    }
                });
            };

  $("#image_upload_input").change(function(e){
 
    // alert($('input[type=file]')[0].files[0].name); //파일이름
    //    alert($("#image_upload_input")[0].files[0].type); // 파일 타임
    var imageType = $("#image_upload_input")[0].files[0].type.split("/")[1];
      var types = ["jpg", "jpeg", "jfif", "png", "bmp", "heic"];
      for (var i in types){
          if(types[i] == imageType){
           alert("됨"); // 파일 타임
          }
      }
 //  $('input[type=file]')[0].files[0].name;
 //  $("#imgUpload")[0].files[0].type;
 //  $("#imgUpload")[0].files[0].size;
 
    });



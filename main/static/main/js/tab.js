// init 설정
var INIT_TAB = [false,false,false,false,false];
let ARMY_FOOD_DATA;
let ARMY_WORKOUT_JSON;
let FEEDBACK_FOOD = {};    // 일주일치 식단 정보 저장(session storage에 임시 저장으로 구현)  = { ... , [[아침], [점심], [저녁] } => ["dayIndex"][아침,점심,저녁][총칼로리,메뉴,메뉴,메뉴] 추가 섭취 및 칼로리계산은 구현시에
let FEEDBACK_WORKOUT = {}; // 일주일치 운동 정보 저장(session storage에 임시 저장으로 구현)  = {day : [이름,이름 ...], ...}
let NAMESPACE_MUSCLE = {"등":"광배근기립근승모근능형근상부 승모근중하부 승모근","어깨":"전면 삼각근측면 삼각근후면 삼각근",
                    "가슴":"흉근상부흉근하부흉근내외측","하체":"대퇴부둔근종아리대퇴사두대퇴이두종아리 전면","팔":"이두근삼두근전완근상완근",
                    "복부":"복직근복사근장요근상부 복직근하부 복직근","승모근":"상부 승모근중하부 승모근","대퇴부":"대퇴사두대퇴이두","종아리":"종아리 전면","복직근":"상부 복직근하부 복직근"};

// 원하는 Tab으로 바로가기 및 데이터 저장
window.onload = function() {
    if(! sessionStorage.getItem("ARMY_FOOD_DATA")){
        fetch('/media/armyFoodMenu.json', {
          headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
           }
          })
        .then(function(response) {
        return response.json();
        })
        .then(function(myJson) {
            ARMY_FOOD_DATA = myJson;
            sessionStorage.setItem("ARMY_FOOD_DATA",JSON.stringify(ARMY_FOOD_DATA));
        });
    }else{
        ARMY_FOOD_DATA = JSON.parse(sessionStorage.getItem("ARMY_FOOD_DATA"));
    }
    if(! sessionStorage.getItem("WORKOUT_JSON")){
        fetch('/media/workout.json', {
          headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
           }
          })
        .then(function(response) {
        return response.json();
        })
        .then(function(myJson) {
            ARMY_WORKOUT_JSON = myJson;
            sessionStorage.setItem("WORKOUT_JSON",JSON.stringify(ARMY_WORKOUT_JSON));
        });
    }else{
        ARMY_WORKOUT_JSON = JSON.parse(sessionStorage.getItem("WORKOUT_JSON"));
    }
    if(sessionStorage.getItem("FEEDBACK_FOOD"))
        FEEDBACK_FOOD = JSON.parse(sessionStorage.getItem("FEEDBACK_FOOD"));
    if(sessionStorage.getItem("FEEDBACK_WORKOUT"))
        FEEDBACK_WORKOUT = JSON.parse(sessionStorage.getItem("FEEDBACK_WORKOUT"));
    
    var tab = sessionStorage.getItem("tab");
    if (tab) {
        if(tab == 5){
            $("#tabIcon_account").click();
        }
        else if(tab == 2){
            $("#tabIcon_history").click();
        }
        sessionStorage.removeItem("tab");
    }
}




function init_tab(index, value){
    if(!INIT_TAB[index]){
        if(index==0){

        }else if(index==1){
            init_chart(value);
            init_categories();
        }else if(index==2){
            initSpec(value);
        }else if(index==3){
            if(!INIT_TAB[4]){ // feedback탭에서 설정을 필요로함
                document.getElementById('tabIcon_account').click();
                document.getElementById('tabIcon_feedback').click();
                return;
            }
            initFeed_calendar(value);
            initFeed_data(new Date().getDay());
            
        }else if(index==4){
            init_accountTab(value);
        }
        INIT_TAB[index] = true;
    }
}

        // Variables
        var clickedTab = $(".tabs > .active");
        var tabWrapper = $(".tab__content");
        var activeTab = tabWrapper.find(".active");
        var activeTabHeight = activeTab.outerHeight();

    $(document).ready(function(){
        // Show tab on page load
        activeTab.show();
        // 배경 색상 div 초기화
        document.getElementById('tab_content_background').style.marginTop = $('#tabs').height()+'px';
        document.getElementById("tab_content_background").style.height = 10+activeTab.outerHeight(true)+'px';
        document.getElementById("tab_content_background").style.width = document.getElementById('main').offsetWidth +'px';

        if(screen.width < 550){
            $(".content__wrapper").css("padding-left",7);
            $(".content__wrapper").css("padding-right",7);
        }
        else{
            $(".content__wrapper").css("padding-left",80);
            $(".content__wrapper").css("padding-right",80);
        }
        // Set height of wrapper on page load
        tabWrapper.height(activeTabHeight);

        $(".tabs > li").on("click", function() {

            // Remove class from active tab
            $(".tabs > li").removeClass("active");

            // Add class active to clicked tab
            $(this).addClass("active");

            // Update clickedTab variable
            clickedTab = $(".tabs .active");

            // fade out active tab
            activeTab.fadeOut(250, function() {

                // Remove active class all tabs
                $(".tab__content > li").removeClass("active");

                // Get index of clicked tab
                var clickedTabIndex = clickedTab.index();

                // Add class active to corresponding tab
                $(".tab__content > li").eq(clickedTabIndex).addClass("active");

                // update new active tab
                activeTab = $(".tab__content > .active");

                // Update variable
                activeTabHeight = activeTab.outerHeight();

                // Animate height of wrapper to new tab height
                tabWrapper.stop().delay(50).animate({
                    height: activeTabHeight
                }, 500, function() {

                    // Fade in active tab
                    activeTab.delay(50).fadeIn(250);
                    
                    //바깥 색상도 조정
                    className = activeTab[0].childNodes[1].classList[1];
                    if(className=='tab1'){
                        document.getElementById("tab_content_background").style.backgroundColor= '#fafafa';
                    }else if(className=='tab2'){
                        document.getElementById("tab_content_background").style.backgroundColor= '#fefbf1';
                    }else if(className=='tab3'){
                        document.getElementById("tab_content_background").style.backgroundColor= '#f0fcff';
                    }else if(className=='tab4'){
                        document.getElementById("tab_content_background").style.backgroundColor= '#fff5f6';
                    }else if(className=='tab5'){
                        document.getElementById("tab_content_background").style.backgroundColor= '#f9f5fe';
                    }
                    document.getElementById('tab_content_background').style.marginTop = $('#tabs').height()+'px';
                    document.getElementById("tab_content_background").style.height = 10+activeTab.outerHeight(true)+'px';
                    document.getElementById("tab_content_background").style.width = document.getElementById('main').offsetWidth +'px';
                    
                });
            });
        });
    });
function resize_tab(){
    activeTab = $(".tab__content > .active");
    activeTabHeight = activeTab.outerHeight();
    tabWrapper.height(activeTabHeight);
    //바깥 배경색용 div 위치도 조정
    document.getElementById('tab_content_background').style.marginTop = $('#tabs').height()+'px';
    document.getElementById("tab_content_background").style.height = 10+activeTab.outerHeight(true)+'px';
    document.getElementById("tab_content_background").style.width = document.getElementById('main').offsetWidth +'px';
}
    // 모바일 대응 및 창모드 대응
    $(window).resize(function(){
        if(screen.width < 550){
            $(".content__wrapper").css("padding-left",7);
            $(".content__wrapper").css("padding-right",7);
        }
        else{
            $(".content__wrapper").css("padding-left",80);
            $(".content__wrapper").css("padding-right",80);
        }
        //여긴 바디프로필의 크기전용
        if(screen.width < 1000){
            document.getElementById('history_div').classList.add('scroll_active');
            document.getElementById("history_select_date").style.display = "block";
        }else{
            document.getElementById('history_div').classList.remove('scroll_active');
            document.getElementById("history_select_date").style.display = "none";
        }
        resize_tab();
    });

// 정렬 시켜서 저장
function set_FEEDBACK_FOOD(day, breakfast, lunch, dinner){
    // 메뉴별로 정렬시키기 ()
    var result = [[],[],[]]
    for(var i =1;i< breakfast.length; i++){
        result[0].push([breakfast[i], ARMY_WORKOUT_JSON['food']['normal'][breakfast[i]][5]]);//메뉴순서로 정렬하려고
    }
    for(var i =1;i< lunch.length; i++){
        result[1].push([lunch[i], ARMY_WORKOUT_JSON['food']['normal'][lunch[i]][5]]);//메뉴순서로 정렬하려고
    }
    for(var i =1;i< dinner.length; i++){
        result[2].push([dinner[i], ARMY_WORKOUT_JSON['food']['normal'][dinner[i]][5]]);//메뉴순서로 정렬하려고
    }    
    
    for(var i=0; i<3; i++){
        result[i].sort(function(first, second) {
          return first[1] - second[1];
        });
    }
    
    for(var i=0; i<3; i++){
        var cache = [];
        for(var j=0; j<result[i].length; j++){
            cache.push(result[i][j][0]);
        }
        result[i] = cache;
    }
    result[0].unshift(breakfast[0]);
    result[1].unshift(lunch[0]);
    result[2].unshift(dinner[0]);
    
    
    FEEDBACK_FOOD[day]= result;
    sessionStorage.setItem("FEEDBACK_FOOD",JSON.stringify(FEEDBACK_FOOD));
}

/*    바디프로필 탭       */
//스펙 init ( 저장해놓은 사진,해당스펙 등을 포멧에 맞게 html코드로 추가하기 ``이 특수문자로 줄넘김도 구현가능(var a = ` asd `)
function initSpec(json){
     if(screen.width < 1000){
            document.getElementById('history_div').classList.add('scroll_active');
            document.getElementById("history_select_date").style.display = "block";
        }else{
            document.getElementById('history_div').classList.remove('scroll_active');
            document.getElementById("history_select_date").style.display = "none";
        }
    
    for(var i=0; i<json.length; i++){
        addSpec_html(json[i]);
    }
        resize_tab();
    
}


// 데이터 추가 클릭 
function addSpec(){
    // 사진 없으면 안되게
    if(document.getElementById('scroll_element_addImage').style.left != '0px'){
        alert("사진을 업로드해주세요.");
        return;
    }
    if(document.getElementById('bodyprofile_add_date').value == ""){
        alert("날짜를 설정해주세요.");
        return;
    }
    
    var formData = new FormData();
    formData.append('photo',$("#bodyprofile_add_picture")[0].files[0]);
    var datas = document.querySelectorAll('.scroll_element_add');
    var send = new Object();
    for(var i =0; i<datas.length; i++){
        send[datas[i].name] = datas[i].value;
    }
    send['date'] = document.getElementById('bodyprofile_add_date').value;
    formData.append('datas',JSON.stringify(send));

    $.ajax({
        url: 'add_picture/',
        data: formData,
        type: 'POST',
        dataType:'json',
        processData : false,
        contentType : false,
        success: function (result) {
             // 초기화
            //이미지 원래대로
            document.getElementById('scroll_element_addImage').src = '';//이미지 원래대로
            document.getElementById('scroll_element_addImage').style.left = '22%';//위치 원래대로
            document.getElementById('bodyprofile_add_date').value = ""; // 시간값 원래대로
            document.getElementById("bodyprofile_add_picture").value ='';//input 값 원래대로
            // 입력값들 초기화
            for(var i =0; i<datas.length; i++){
                datas[i].value = "";
            }
            
            // 입력했던거 추가
            addSpec_html(result);
        },error:function(request,status,error){
        console.log("code = "+ request.status + " message = " + request.responseText + " error = " + error); // 실패 시 처리
       }
    });
}
function addSpec_html(json){
    var is_fullImage = false;
        //가장 겉의 div
        var outside_div = document.createElement("div");
        outside_div.setAttribute("class","scroll_element");
        outside_div.setAttribute("id","scroll_element"+json['id']);
        outside_div.innerHTML = "<p class='input_date'>"+json['date']+"</p>";
        
        // 이미지 
        var image = document.createElement("img");
        image.setAttribute("src","/media/"+json['picture']);
        image.setAttribute("cursor","pointer");
        image.setAttribute("id","element_image"+json['id']);
        outside_div.appendChild(image);
        
        //세부 사이즈 div
        var spec_div = document.createElement("div");
        spec_div.setAttribute("class", "scroll_spec");
        outside_div.appendChild(spec_div);

        var innerHTML = "";
        if(json['weight'])
            innerHTML += '<div class="spec_input">체중<br>'+json['weight']+'</div>';
        if(json['muscle'])
            innerHTML += '<div class="spec_input">골격근량<br>'+json['muscle']+'</div>';
        if(json['fat'])
            innerHTML += '<div class="spec_input">체지방률<br>'+json['fat']+'</div>';
        
        if(json['shoulder'] || json['arm'] || json['chest'] || json['thigh'] || json['belly'])
            innerHTML += '<div class="scroll_sizeStart"></div>';
        else if(!json['weight'] || !json['muscle'] || !json['fat'])
            is_fullImage = true;
        
        if(json['shoulder'])
            innerHTML += '<div class="spec_input">어깨<br>'+json['shoulder']+'</div>';
        if(json['arm'])
            innerHTML += '<div class="spec_input">팔<br>'+json['arm']+'</div>';
        if(json['chest'])
            innerHTML += '<div class="spec_input">가슴<br>'+json['chest']+'</div>';
        if(json['thigh'])
            innerHTML += '<div class="spec_input">허벅지<br>'+json['thigh']+'</div>';
        if(json['belly'])
            innerHTML += '<div class="spec_input">배<br>'+json['belly']+'</div>';
        
        //삭제하기 버튼
        innerHTML += '<button type="button" id="h_b_'+json['id']+'" class="special" onclick="deleteSpec(this);">삭제하기<br></button>';
        
        spec_div.innerHTML = innerHTML;
        
        if(is_fullImage){
            image.style.maxWidth = "290px";
        }
        document.getElementById('history_div').appendChild(outside_div);
        resize_tab();
        image_zoom_init("element_image"+json['id']);//이미지 줌 처리
    
        //select 박스에 날짜 추가하기
        var select = document.createElement("option");
        select.innerHTML = json['date'];
        document.getElementById("history_select_date").appendChild(select);
        
}

//데이터 삭제 클릭
function deleteSpec(object){
    var id = object.id.substr(4);
    var obj = document.getElementById("scroll_element"+id);
    
    //DB 삭제
    $.ajax({
        url: 'delete_picture/',
        data: {'id':id},
        type: 'POST',
        success: function (result) {
        }
    });
    // 페이지에서 삭제
    obj.parentElement.removeChild(obj);

}
//모바일 전용 바디프로필의 날짜 선택해서 바로보기
function history_select_date(obj){
    number = $("#history_select_date option:selected").prevAll().size();//선택된 옵션 앞의 개수 구하기
    $("#history_div").stop().animate( { scrollTop : (590 * number) }); // 한개의 사이즈(590) * 선택된 수
}


/* 계정 설정 탭*/
// 계정 정보 대로 입력 init, placeholder가 원래데이터로 value와 비교해서 바뀐거 체크
function init_accountTab(dict){
    document.getElementById("acc_aka").value = dict.aka;
    document.getElementById("acc_aka").placeholder = dict.aka;
    document.getElementById("acc_age").value = dict.age;
    document.getElementById("acc_age").placeholder = dict.age;
    document.getElementById("acc_height").value = dict.height;
    document.getElementById("acc_height").placeholder = dict.height;
    document.getElementById("acc_target").value = dict.target;
    document.getElementById("acc_target").placeholder = dict.target;
    document.getElementById("acc_num").value = dict.num;
    document.getElementById("acc_num").placeholder = dict.num;
    document.getElementById("acc_way").value = dict.way;
    document.getElementById("acc_way").placeholder = dict.way;
    document.getElementById("acc_pDay").value = dict.pDay;
    document.getElementById("acc_pDay").placeholder = dict.pDay;
    document.getElementById("acc_army").placeholder = dict.army;
    document.getElementById("acc_army_random").innerText = dict.army == 0 ? "랜덤 설정" : "초기화";
    if(dict.picture){
        document.getElementById("acc_picture").src = dict.picture;
        document.getElementById("acc_picture").placeholder = dict.picture;
    }else{
        document.getElementById("acc_picture").classList.add('icon','fas', 'fa-plus-square', 'fa-6x');
    }
    
    var part = document.getElementById("acc_part");
    part.placeholder = dict.part;
    for(var i=0; i<4; i++){
        part.children[6-(i*2)].checked = dict.part %10;
        dict.part = parseInt(dict.part / 10);
    }
    
}
// 바뀐 부분이 있다면 그부분 초록색으로
function acc_oncahnge(obj){
    if(obj.placeholder == null){//placeholder가 지정이안되있으면
        return;
    }
    
    if(obj.value != obj.placeholder){
            obj.style.background =  "#0f04";
    }else{
            obj.style.background =  "#fff8";
    }
}
// 운동설정 열기
function acc_openWorkout(obj){
    if(document.getElementById('acc_workout').style.display == 'none'){
        document.getElementById('acc_workout').style.display = 'block';
        obj.className = 'icon fas fa-arrow-up'
    }
    else{
        document.getElementById('acc_workout').style.display = 'none';
        obj.className = 'icon fas fa-arrow-down'
    }
    resize_tab();
}
// 사진설정, 바로적용
function acc_pictureUpdate(){
    // 바꾸지 않았을경우
    if(!$("#acc_picture_input").val())
        return;
    
    let check = confirm('바꾸시겠습니까?', '');
    if(check){
        var formData = new FormData();
        formData.append('photo',$("#acc_picture_input")[0].files[0]);
        formData.append('code','1');
         $.ajax({
            url: '/update_user_other/',
            data: formData,
            type: 'POST',
            processData : false,
            contentType : false,
            success: function (result) {
                    alert('저장되었습니다.');
                document.getElementById('acc_picture_input').value = ''
            }
        });
    }
}



// 부대식단, 바로적용
// 랜덤
function acc_army_random(obj){
    if(obj.innerText == '초기화'){
        $.ajax({
            url: '/update_user_other/',
            data: {'code':2, 'army':0},
            dataType: 'text',
            type: 'POST',
            success: function (result) {
                alert('부대 정보가 초기화되었습니다.');
                document.documentElement.scrollTop = 0;
                sessionStorage.setItem("tab", 5);
                location.reload();
                document.getElementById("acc_army").placeholder = 0;
            }
        });
    }else{
        let sendData = {'code':2};
        let dictKeys = Object.keys(ARMY_FOOD_DATA);
        let randomIndex = Math.floor( Math.random() * dictKeys.length );

        while(dictKeys[randomIndex] == 'date'){
            randomIndex = Math.floor( Math.random() * dictKeys.length );
        }
        sendData['army']=dictKeys[randomIndex];
        $.ajax({
        url: '/update_user_other/',
        data: sendData,
        dataType: 'text',
        type: 'POST',
        success: function (result) {
            alert('설정이 완료되었습니다.');
            document.documentElement.scrollTop = 0;
            sessionStorage.setItem("tab", 5);
            location.reload();
            document.getElementById("acc_army").placeholder = sendData['army'];
            }
        });
    }
}
// 설정
function acc_army(){
    let menu = true;
    let json;
    let today = new Date();
    
    let base_day = today.getMonth() +1 ;
    base_day = base_day < 10 ? '0'+base_day : base_day+'';
    base_day = today.getFullYear() + base_day; //ex:202104
    
    let qDay = today.getDate();
    let qHour = ['brst', 'lunc', 'dinr'];
    let hour_index = -1;
    if(today.getHours() < 11){
        hour_index = 0;
    }else if(today.getHours() < 17){
        hour_index = 1;
    }else{
        hour_index = 2;
    }
    
    today = qDay;
    let base_str = '메뉴 중 한가지를 입력해주세요.';
    let data = JSON.parse(JSON.stringify(ARMY_FOOD_DATA));
     //취소, 입력X일 경우 going이 false로 while문 빠져나감
    // 찾았을경우 break문으로 빠져나감
    while(menu){
        if(hour_index==0){
            question = '아침 ' + base_str
        }else if(hour_index==1){
            question = '점심 ' + base_str
        }else{
            question = '저녁 ' + base_str
        }
        if(qDay == today-2){
            question = '그저께 ' + question
        }else if(qDay == today-1){
            question = '어제 ' + question
        }else if(qDay == today){
            question = '오늘 ' + question
        }else if(qDay == today+1){
            question = '내일 ' + question
        }else if(qDay == today+2){
            question = '모레 ' + question
        }else if(qDay == today+3){
            question = '글피 ' + question
        }else{
            if(today > qDay){
                question = (today-qDay) + '일 전 ' + question
            }else{
                question = (qDay-today) + '일 후 ' + question
            }
        }
        var delete_key = [];
        // 메뉴 입력시
        if(menu = prompt(question)){
            for (var key in data) {//남은 부대별로 반복
                isDelete_army = true;
                for(var key2 in data[key][base_day+(qDay <10 ? '0'+qDay : qDay)]){ //해당 부대의 날짜의 메뉴 가지수만큼 반복
                    if(data[key][base_day+(qDay <10 ? '0'+qDay : qDay)][key2][qHour[hour_index]].indexOf(menu) != -1){ //해당 부대의 메뉴가 일치한다면 flag
                        isDelete_army = false;
                    }
                }
                if(isDelete_army){
                    delete_key.push(key);
                }
            }
            for(var i =0; i<delete_key.length; i++){ //나왔던 메뉴가 없을경우 해당 부대 데이터에서 제외
                delete data[delete_key[i]];
            }
            //찾은 경우 (남은 후보가 1개)
            if(Object.keys(data).length == 1){
                let sendData = {'code':2, 'army':Object.keys(data)[0]};
                $.ajax({
                url: '/update_user_other/',
                data: sendData,
                dataType: 'text',
                type: 'POST',
                success: function (result) {
                    alert('설정이 완료되었습니다.');
                    document.documentElement.scrollTop = 0;
                    sessionStorage.setItem("tab", 5);
                    location.reload();
                    document.getElementById("acc_army").placeholder = Object.keys(data)[0];
                    }
                });
                break;
            }else if(Object.keys(data).length > 1){ //아직 남은경우
            if(++hour_index > 2){//날짜 변경해야할 때
                //qDay 설정
                if(qDay == 1 || today - qDay > 2){ //질문을 내일로 이어가야 할경우
                    qDay = today+1;
                }else if(qDay>28){ //질문을 이전으로 돌려야할경우
                    qDay = today-4;
                }else{ // 평범한 상황
                    qDay = (today - qDay >= 0) ? qDay-1 : qDay+1;
                }
                // hour 설정
                hour_index = (hour_index+1) % 3;
                }
            }else{//찾기를 실패한경우
                if(confirm("검색된 데이터가 없습니다.\n다시 하시겠습니까?")){
                    data = JSON.parse(JSON.stringify(ARMY_FOOD_DATA));
                    qDay = today;
                    hour_index = 1;
                }else{
                    alert('취소되었습니다.');
                    return;
                }
            }
        }
    }
    if(!menu){
        alert('취소되었습니다.');
    }
}
// 계정 탈퇴, 바로적용
function acccount_delete(){
    let check = confirm('정말로 탈퇴하시겠습니까?', '');
    if(check){
        del_uploadImage();//업로드 이미지에 사진 있다면 삭제
            $.ajax({
            url: '/delete_user/',
            data: '',
            type: 'POST',
            success: function (result) {
                if(!result){
                    alert('처리되었습니다.');
                    window.location.href = window.location.host+'/index/';
                }
                else
                    alert('테스트 계정은 삭제할 수 없습니다.');
            }
        });
    }else{
        alert('취소되었습니다.');
    }
}
// 바뀐지 체크해서 바뀐건 dict에 추가, pw는 따로처리해야함
function account_update_check(dict, id){
    obj = document.getElementById(id)
    if(obj.value != obj.placeholder){
        dict[id.substr(4)] = obj.value;
    }
}
function alert_backgroundColor(id){
    $('#'+id).css('background','#f004');
    location.href= '#'+id
}
// submit
function account_update(){
    var sendData = {};
    account_update_check(sendData,'acc_aka');
    account_update_check(sendData,'acc_target');
    account_update_check(sendData,'acc_age');
    account_update_check(sendData,'acc_height');
    account_update_check(sendData,'acc_way');
    account_update_check(sendData,'acc_num');
    account_update_check(sendData,'acc_pDay');
    
    //part chek 변환
    var part_ele = document.getElementById("acc_part");
    var part_val = 0;
    for(var i=0; i<4; i++){
        part_val += part_ele.children[6-(i*2)].checked ? Math.pow(10,i) : 0;
    }
    if(part_val != part_ele.placeholder){
        sendData['part'] = part_val;
    }
    
    
    // 모두 입력했다면 추가
    if($('#acc_pw_check').val() && $('#acc_pw_new').val()){
        sendData['pw_check'] = $('#acc_pw_check').val();
        sendData['pw_new'] = $('#acc_pw_new').val();
    }// 모두 입력안하면 pass, 이전에 빨간색 떳을수도 있으니 변경
    else if($('#acc_pw_check').val()=='' && $('#acc_pw_new').val() ==''){   
        $('#acc_pw_check').css('background', 'white');
        $('#acc_pw_new').css('background', 'white');
    }
    //둘중 하나를 입력안했다면
    else{
        if($('#acc_pw_check').val()==''){
            alert_backgroundColor('acc_pw_check')
        }
        else{
            alert_backgroundColor('acc_pw_new')          
        }
        alert("비밀번호 변경 모두 입력해주세요.");
        return;
    } 
    if(Object.keys(sendData).length == 0){
        alert('처리되었습니다.');
        return;
    }
    $.ajax({
        url: '/update_user/',
        data: sendData,
        dataType: 'text',
        type: 'POST',
        success: function (result) {
            if(!result){
                alert('처리되었습니다.');
        // 스크롤 맨위로
        document.documentElement.scrollTop = 0;
                sessionStorage.setItem("tab", 5);
                location.reload();
            }
            else{
                if(result.substr(0,1)=='나')
                    alert_backgroundColor('acc_age')
                else if(result.substr(0,1)=='키')
                    alert_backgroundColor('acc_height')
                else if(result.substr(0,9)=='error : p')
                    alert_backgroundColor('acc_pw_check')
                alert(result)
            }
            }
        });
}


// 하루치의 식단을 포멧으로 바꾸기
// [아침 메뉴(~~,~~,~~) 및 총칼로리, 점심 메뉴 및 총칼로리, ...]
function convertArmyData(obj){
    if(! obj)
        return false;
    
    var result=[[], [], []];
    var kcalSum = [0, 0, 0];
    var name = ['brst','lunc','dinr'];
    for(var i=0; i<obj.length; i++){
        for(var j=0; j<3; j++){            
            if(obj[i][name[j]].indexOf('(') != -1){// 부가적인 이름 잘라야할때
                result[j].push(obj[i][name[j]].substr(0, obj[i][name[j]].indexOf('(')) );//잘라서 저장
            }else{// 그대로 써도될 때
                result[j].push(obj[i][name[j]] );
            }
            if(parseInt(obj[i][name[j]+'_cal']))
                kcalSum[j] += parseInt(obj[i][name[j]+'_cal']);//칼로리 합계 계산중
        }
    }
    return [result, kcalSum];
}
// 해당 부대의 일주일(오늘+6일) 식단 가져오기
function getArmyFood(){
    var code = document.getElementById("acc_army").placeholder;
    // 해당 부대 식단이 없을경우
    if(! ARMY_FOOD_DATA[code]){
        return [false,false,false,false,false,false,false];
    }
    
    var result = [];
    var data = JSON.parse(JSON.stringify(ARMY_FOOD_DATA));
    var date = new Date();
    var today = date.getFullYear()+''+(date.getMonth()+1+'').padStart(2,'0');
    var month_last = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();// 이달의 마지막일수
    
    for(var i=0; i<7; i++)
        if(date.getDate()+i > month_last){//달을 지났다면 데이터X
            result.push("데이터 없음");
        }else{
            result.push(ARMY_FOOD_DATA[code][today+((date.getDate()+i) + '').padStart(2,'0')]);
        }
    return result;
}
/* 피드백 탭 */
//해당 요일의 데이터 설정
function initFeed_data(day){
    var target_section = document.getElementById('feed_food_content');

    if(document.getElementById('feed_food_head').placeholder == 0){
        target_section.children[0].children[0].innerHTML = '체중을 기록하지 않으셨습니다.<br>Body Check탭에서 체중을 기록해주세요.'
        document.getElementById('feed_food_sum').style.display = "none";
        return;
    }
    var date = new Date();
    var armyCode = document.getElementById("acc_army").placeholder;
    var searchIndexDay = day < date.getDay() ? (7 - (date.getDay()- day)) : (day - date.getDay());
    var nameList=["아침 ","점심 ","저녁 "];
    
    // 각 제목설정
    document.getElementById('feed_workout_head').innerText = document.getElementById('feed_'+day).innerText + ' 운동';
    document.getElementById('feed_food_head').innerText = document.getElementById('feed_'+day).innerText + ' 식단';
    
    //식단 설정
    if(armyCode != 0){ // 이용자가 부대식단을 등록했을경우
        var result = convertArmyData(getArmyFood()[searchIndexDay]);
        document.getElementById('feed_food_head').parentNode.children[1].style.display="none"; // 식단 재설정 버튼 없애기
        
        //부대식단등록안되어있을때
        if(! result){
            target_section.children[0].children[0].innerHTML = '데이터 없음'
        }else{
            var maxbody = Math.max(result[0][0].length,result[0][1].length,result[0][2].length);

            // tbody 열 초기화
            target_section.children[0].children[0].children[1].innerHTML = '';

            // 테이블 thead는 따로 처리
            for(var i=0; i<3; i++){ //아점저 설정, 세로로 한줄씩 설정
                if(date + searchIndexDay > new Date(date.getFullYear(), date.getMonth()+1, 0).getDate()){ // 띄울게 말일을 넘었다면 데이터가 없음
                    target_section.children[0].children[0].children[0].children[0].children[i].innerText =  "데이터 없음"
                }else{
                //   섹션의       테이블의    thead        tr        th
                    target_section.children[0].children[0].children[0].children[0].children[i].innerText =  nameList[i]+result[1][i]+"(kcal)";
                }
            }

            // 열 미리 만들어 놓기
            for(var i=0;i < maxbody ;i++){
                // 섹션의        테이블의     tbody 
                target_section.children[0].children[0].children[1].innerHTML += '<tr></tr>';
            }

            //테이블 바디부분 2차원 배열처럼 접근
            for(var i=0; i<maxbody; i++){
                for(var j=0; j<3; j++){ 
                // 섹션의        테이블의        tbody      body의 각 열
                    target_section.children[0].children[0].children[1].children[i].innerHTML += '<td>' + (result[0][j][i] ? result[0][j][i] : '') + '</td>';
                }
            }
        }
        algorithm_food(true, day);
    }else{//이용자가 부대식단등록x
        document.getElementById('feed_food_source').style.display="inline"; // 영양성분 제공 출처
        // 데이터가 없다면 설정
        if(!FEEDBACK_FOOD[day]){
            algorithm_food(false, day);
            create_food_calendar();// 식단 정보 달력에 업데이트
        }
        var result = FEEDBACK_FOOD[day].slice();
        //총 섭취량 계산 및 중복 표현
        var tan=0,dan=0,zi=0;
        for(var i=0;i<3;i++){
            var cache_overlap = {};
            for(var j=1;j<result[i].length;j++){
                tan += ARMY_WORKOUT_JSON['food']['normal'][result[i][j]][1];
                dan += ARMY_WORKOUT_JSON['food']['normal'][result[i][j]][2];
                zi += ARMY_WORKOUT_JSON['food']['normal'][result[i][j]][3];
                //중복 확인
                for(var k=j+1; k<result[i].length;k++){
                    if(result[i][j] == result[i][k]){ //중복된게 있다면
                        if(result[i][j] in cache_overlap){ // 그게 전에도 겹친거였다면
                         cache_overlap[result[i][j]]++;   
                        }else{    // 처음 중복이라면
                         cache_overlap[result[i][j]] = 2;   
                        }
                    }
                }
            }
            if(Object.keys(cache_overlap).length > 0){ // 중복이 있엇다면 처리
                result[i] = [...(new Set(result[i]))]; // 중복을 제거하고
                for(var key in cache_overlap){ 
                    result[i].splice(result[i].indexOf(key), 1, key+' X '+cache_overlap[key]);
                }
            }
        }
        var maxbody = Math.max(result[0].length, result[1].length, result[2].length);//index0은 칼로리정보라서

        // tbody 열 초기화
        target_section.children[0].children[0].children[1].innerHTML = '';

        // 테이블 thead는 따로 처리
        for(var i=0; i<3; i++){ //아점저 설정, 세로로 한줄씩 설정
            //   섹션의                 테이블의    thead        tr        th
            target_section.children[0].children[0].children[0].children[0].children[i].innerText =  nameList[i]+result[i][0]+"(kcal)";
        }

        // 열 미리 만들어 놓기
        for(var i=0;i < maxbody ;i++){
            // 섹션의                    테이블의     tbody 
            target_section.children[0].children[0].children[1].innerHTML += '<tr></tr>';
        }

        //테이블 바디부분 2차원 배열처럼 접근
        for(var i=1; i<maxbody; i++){
            for(var j=0; j<3; j++){ 
                // 섹션의                        테이블의        tbody      body의 각 열
                target_section.children[0].children[0].children[1].children[i].innerHTML += '<td>' + (result[j][i] ? result[j][i] : '') + '</td>';
            }
        }
        
        // 총 섭취량 부분
        var target = document.getElementById('acc_target').placeholder;
        var kcal = document.getElementById('feed_food_head').placeholder;
        if(target == 1)// 벌크업
            kcal += parseInt(kcal*0.55);
        else if(target == 2)//커팅
            kcal += parseInt(kcal*0.4);
        else if(target == 3)//다이어트
            kcal += parseInt(kcal*0.25);
        target_section.children[2].children[1].innerHTML = '섭취 칼로리 : '+parseInt(tan*4 + dan*4 + zi*9) + 'kcal<br>'+
            "탄수화물 : " + parseInt(tan)+ "g, 단백질 : " + parseInt(dan) +"g, 지방 : "+ parseInt(zi) + "g";  
        document.getElementById('suggest_kcal').innerText = "권장 칼로리 : "+kcal+"kcal";

    }
    // 운동정보 업데이트
    feed_day_workout(day);
    
    // 그날의 달력 위치로 스크롤
    var table = document.getElementById("feed_calendar");
    var myInterval = () => {
        setTimeout(() => {
            if(table.offsetWidth == 0)
                myInterval();
            else
                table.parentNode.scrollLeft = (table.offsetWidth/7) * (day-1);
        }, 500);
    };
    myInterval(); // 달력의 너비값은 보여지고 난뒤에 얻을 수 있어서 인터벌로 구현

    resize_tab();
    
}

//달력 설정
function initFeed_calendar(dict){
    // 일일 대사량 기록하기
    document.getElementById('feed_food_head').placeholder = dict['metabolism'];
    
    document.getElementById("acc_army").placeholder = dict['army'];//부대식단 알기위해
    var weekName = new Array('일','월','화','수','목','금','토');
    var today = new Date();
    var table = document.getElementById("feed_calendar");
    var month_last = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();// 이달의 마지막일 알기
    dict['part'] = dict['part'].toString().padStart(4,'0');
    
    for(var i = 0; i < 7; i++){
        //요일 및 날짜설정
        if((today.getDay()+i)%7==today.getDay()){//오늘날일경우
            table.rows[0].cells[(today.getDay()+i)%7].innerText = '오늘';
            table.rows[0].cells[(today.getDay()+i)%7].style.color= 'red';
        }
        else if(today.getDate()+i > month_last){ //달을 지나갔다면
            table.rows[0].cells[(today.getDay()+i)%7].innerText = today.getMonth()+2 +'-'+ ((today.getDate()+i) % month_last)+ ' ('+ weekName[(today.getDay()+i)%7]+')';
        }else{
            table.rows[0].cells[(today.getDay()+i)%7].innerText = today.getMonth()+1 +'-'+ (today.getDate()+i)+ ' ('+ weekName[(today.getDay()+i)%7]+')';
        }
        
        //구분가게 색상 설정    
        if(((today.getDay()+i)%7)%2 != 0){
            table.rows[0].cells[(today.getDay()+i)%7].style.background= 'rgba(144, 144, 144, 0.075)';
            table.rows[2].cells[(today.getDay()+i)%7].style.background= 'rgba(144, 144, 144, 0.075)';
            table.rows[4].cells[(today.getDay()+i)%7].style.background= 'rgba(144, 144, 144, 0.075)';
        }
    }
    
        // 운동 정보 입력
        if(dict['pDay'] == 0 || dict['part'] == 0){                 // 운동가능일수가 없거나 운동 부위가 없을때
            for(var i=0;i<7;i++)
                table.rows[2].cells[i].innerText = 'error 0';
        }else if(dict['num'] > dict['pDay']){                       // 분할수가 운동할수 있는 날보다 많을때
            for(var i=0;i<7;i++)
                table.rows[2].cells[i].innerText = 'error 1';
        }else if(dict['num'] > dict['part'].match(/1/g).length){    // 분할수가 하고싶은 운동종목보다 많을때
            for(var i=0;i<7;i++)
                table.rows[2].cells[i].innerText = 'error 2';
        }else{                                                      // 되는 경우
            var workout = day_workout(dict['num'],dict['part'],dict['pDay']);
            for(var i=0; i<7; i++)
                table.rows[2].cells[i].innerText = workout[i];
        }
    
        // 식단 정보 입력
    create_food_calendar();
}
function create_food_calendar(){
    var table = document.getElementById("feed_calendar");
     if(document.getElementById("acc_army").placeholder != 0){ //군인일때
        for(var i=0; i<7; i++)
            table.rows[4].cells[i].innerText = '병영식';
    }else{
        for(var i=0; i<7; i++)
            if(FEEDBACK_FOOD[i]){
                table.rows[4].cells[i].innerHTML =""
                for(var j=0;j<3;j++){
                    table.rows[4].cells[i].innerHTML +="<br>" +FEEDBACK_FOOD[i][j][1];
                }
            }else{
                table.rows[4].cells[i].innerHTML ="<br><br>클릭하여 생성해보세요."
            }
    }
}
// ~~운동 하는날    분할수 분할종목 운동일수
function day_workout(num, part, pDay){
    if(num == 0)
        num = 1;
    // 운동 일수가 인덱 쉬는날은 없음
    var rest = ['error','123456', '12345','0246','135','30','0',''];
    rest = rest[pDay-(pDay%num)];//일주일안에 분할을 끝내지 못하면 나머지 휴식으로 처리
    var workoutList = ['등','어깨','가슴','하체'];
    var result = [];
    
    // 운동 리스트 설정
    // 묶어서하는 세트가 필요할때
    if(num==3 && part=='1111'){                // 3분할인데 4종목함
        workoutList.splice(1, 1, '어깨+하체');
        workoutList.pop();
    }else if(num == 2 && part.match(/1/g).length != 2){// 2분할인데
        if(part == '1111'){                    // 4종목
            workoutList.splice(0,2,'등+가슴');
            workoutList.splice(1,2,'어깨+하체');
        }else if(part.match(/1/g).length == 3){// 3종목
            
            if(part.indexOf('0') != 3){     // 뺀게 하체가 아니라면
                workoutList.splice(part.indexOf('0'), 1);
                workoutList.splice(0,2,(workoutList[0]+'+'+workoutList[1]));
            }else{                        //뺀게 하체라면
                workoutList.splice(1,3,'어깨+가슴');
            }
        }
    }else{// 묶을 필요없이 지우기만 할때, 그대로일때도
        if(num == 1){//무분할일때
            if(part=='1111')
                workoutList = ["전신"];
            else{
                var cache = "";
                for(var i= part.length -1; i>=0 ; i--){
                    if(part[i] == '1')
                        cache += "+" + workoutList[i];
                }
                workoutList = [cache.substr(1)];
            }
        }else if(num == 2){
            for(var i= part.length -1; i>=0 ; i--){
                if(part[i] == '0')
                    workoutList.splice(i, 1);
            }
        }else if(num == 3){
            workoutList.splice(part.indexOf('0'), 1);
        }
    }
    //운동 정보와 휴식 조합해서 결과로
    for(var i=0, j=0; i < 7; i++){
        if(rest.indexOf(i) != -1 ){ //해당 요일이 쉬는날일 경우
            result.push('휴식');
        }else{
            result.push(workoutList[j++ % workoutList.length]);
        }
    }
    return result;
}
// 그날의 운동 정보 띄우기
function feed_day_workout(day){// 이 정보는 information페이지의 태그를 통해서 가져오기로
    var div = document.getElementById("feed_workout_div");
    var checkWord = document.getElementById('feed_calendar').children[1].children[1].children[1].innerText;
    var result = [];
    
    if(checkWord[0] == "e"){ // 설정에서 에러를 만들었을때
        div.children[0].style.display = "";
        document.getElementById('feed_workout_head').innerText = checkWord;
        if(checkWord == "error 0"){
            div.children[0].children[0].children[2].innerText = "운동 가능 일수가 없거나 운동 할 부위가 설정되지 않았습니다.";
        }else if(checkWord == "error 1"){
            div.children[0].children[0].children[2].innerText = "분할 수가 운동 가능 일수보다 많게 설정되었습니다.";
        }else if(checkWord == "error 2"){
            div.children[0].children[0].children[2].innerText = "분할 수가 운동 하려는 부위보다 많게 설정되었습니다.";
        }
        var onclick_str = 'document.getElementById("tabIcon_account").click();';
        div.children[0].children[0].children[3].innerHTML = "<a href='#' onclick='"+onclick_str+"'>설정하기</a>";
        return;
    }
    
    if(typeof(FEEDBACK_WORKOUT[day]) == "undefined")
         algorithm_workout(day);
    
    // 운동 정보 띄우기
    feed_change_workoutData(day);
}
// FEEDBACK_WORKOUT이용 day의 운동 정보로 보여주기
function feed_change_workoutData(day){
    var parent = document.getElementById("feed_workout_div");
    var select;
    var content = parent.children[0].cloneNode(true);

    parent.innerHTML = "";//이전 정보 초기화
    parent.appendChild(content);

    if(! FEEDBACK_WORKOUT[day]){ //당일은 휴식일 때
        content = parent.children[0].cloneNode(true);
        content.children[0].children[2].innerText = " 개 인 정 비 ";
        content.style.display = "";
        parent.innerHTML = "";//초기화
        parent.appendChild(content);
        document.getElementById('feed_workout_source').style.display="none";
        return;
    }
    // 이전 선택이 휴식이면 display 켜놓아져있어서 끄기
    parent.children[0].style.display = "none";
    document.getElementById('feed_workout_source').style.display="inline"; 
    
    for(var i=0;i<FEEDBACK_WORKOUT[day].length; i++){
        select = ARMY_WORKOUT_JSON['workout'][FEEDBACK_WORKOUT[day][i]];
        content = parent.children[0].cloneNode(true);
        content.style.display = "";
        content.children[0].children[0].src = select[5];
        content.children[0].children[0].id = FEEDBACK_WORKOUT[day][i];
        content.children[0].children[1].innerText = FEEDBACK_WORKOUT[day][i];
        content.children[0].children[2].innerText = select[1];
        content.children[0].children[3].innerHTML = select[3];
        parent.appendChild(content);
    }
    setTimeout(() => {resize_tab();}, 700);
    setTimeout(() => {resize_tab();}, 1500);
    setTimeout(() => {resize_tab();}, 2500);
}
// 무조건 그날의 운동 랜덤 저장 및 반환
function algorithm_workout(day){
    var result = [];
    var target = parseInt(document.getElementById("acc_target").placeholder);
    var way = parseInt(document.getElementById("acc_way").placeholder);
    var workout = [];
    
    for(var i=0; i<7;i++)
        workout.push(document.getElementById('feed_calendar').children[1].children[1].children[i].innerText);
    
    var pDay = workout.filter( isRest=> isRest != "휴식").length; // 실질적 운동 가능 일수
    var amount =  Math.ceil((target*2) + (7-(pDay/2))*4/3); // 몇가지의 운동을 추가할 것인지.(7<=amount<=15)
    var addWorkout = Math.ceil((amount-6) *2/5); // 추가운동 세트 수(이 삼두 복근)
    var addWorkoutKeys = ["복부","이두근","삼두근","팔"];
    
    workout = workout[day].split("+");
    if(workout[0] == "휴식"){
        FEEDBACK_WORKOUT[day] = false;
        sessionStorage.setItem("FEEDBACK_WORKOUT",JSON.stringify(FEEDBACK_WORKOUT));
        return false;
    }
    
    // 메인운동
    for(var i=0;i < workout.length; i++){        // 여러개 하는거면 그만큼 나눠서
        for(var j=parseInt(amount*i/workout.length); j < parseInt(amount*(i+1)/workout.length); j++){
            result.push(random_workoutPick(workout[i],way,target));
        }
    }
    
    // 추가운동 세트 삽입
    for(var i =  amount - addWorkout; i < amount; i++){
        result.push(random_workoutPick(addWorkoutKeys[parseInt(Math.random()*4)],way,target));
    }

    FEEDBACK_WORKOUT[day] = result;
    sessionStorage.setItem("FEEDBACK_WORKOUT",JSON.stringify(FEEDBACK_WORKOUT));
    return result;
}

// 추천도를 확률로 원하는 정보에 맞춰서 운동 이름 반환
function random_workoutPick(muscle, way, target){
    var workout = Object.keys(ARMY_WORKOUT_JSON['workout']);
    var randomIndex = parseInt( Math.random() * workout.length);
    var select = ARMY_WORKOUT_JSON['workout'][workout[randomIndex]];
    
    while(true){
        if(select[4] > (Math.random()*10)){ // 추천도에 따른 확률
            if (select[6].indexOf(way) != -1 &&(target==3 ? select[6].indexOf(6) != -1 :true)) { // 방식에 따라서
                if(select[1].indexOf("전신") != -1){
                    break;
                }
                var cache = select[1].split(",");
                for(var i=0;i<cache.length;i++){    //주동근도 맞는지
                    if(isInclude_muscle(muscle,cache[i])){// 맞는 주동근 and 방식에 따라서
                        break;
                    } 
                }
                if(i<cache.length){
                    break;
                } // 조건 모두 성립
                    
            }
        }
        randomIndex = parseInt( Math.random() * workout.length);
        select = ARMY_WORKOUT_JSON['workout'][workout[randomIndex]];
    }
    return workout[randomIndex];
}
// 식단 영양분 맞춰서 랜덤 저장
function algorithm_food(isArmy, day){
    
    var kcal = document.getElementById('feed_food_head').placeholder;
    var target = document.getElementById('acc_target').placeholder;
    var tan = parseInt(kcal*0.45/4);
    var dan = parseInt(kcal*0.3/4);
    var zi = parseInt(kcal*0.25/9);
    var origin = [];
    var resultKeys = [];
    
    if(target == 1){// 벌크업
        kcal += parseInt(kcal*0.55);
        tan = parseInt(kcal*0.5/4);
        dan = parseInt(kcal*0.3/4);
        zi = parseInt(kcal*0.2/9);
    }else if(target == 2){//커팅
        kcal += parseInt(kcal*0.4);
        tan = parseInt(kcal*0.45/4);
        dan = parseInt(kcal*0.35/4);
        zi = parseInt(kcal*0.2/9);
    }else if(target == 3){//다이어트
        kcal += parseInt(kcal*0.25);
        tan = parseInt(kcal*0.45/4);
        dan = parseInt(kcal*0.4/4);
        zi = parseInt(kcal*0.15/9);
    }
    
    origin = [tan,dan,zi, kcal];
    
    if(isArmy){
        var cache = document.getElementById('feed_food_content').children[0].children[0].children[0];  
            tan -= 394;
            dan -= 122;
            zi -= 99;
        // 식단데이터가 없을경우
        if(! cache){  
            kcal -= 394*4 + 122*4 + 99*9;
        }else{
            cache = cache.children[0];
            if(cache.children[0].innerText != '데이터 없음'){ // 다음달이라 데이터가 없는게 아닐때
                for(var i=0;i < 3; i++){
                    cache2 = cache.children[i].innerText.slice(cache.children[i].innerText.indexOf(' ')+1);
                    cache2.slice(0,cache2.indexOf('('));
                    kcal -= parseInt(cache2);
                }    
            }    
        }
        
        var dictKeys = Object.keys(ARMY_WORKOUT_JSON['food']['px']);
        var randomIndex = parseInt( Math.random() * dictKeys.length );
        var cache = '';
        // +- 30,300 의 영양분을 충족할때까지 랜덤음식
        while(tan > 30 || dan > 30 || zi > 30 || kcal > 300){ // 모두 기준치정도만큼 먹을때까지
            
            if(Math.max(tan,dan,zi) - Math.min(tan,dan,zi) > 50 && Math.min(tan,dan,zi) < -20 ){ // 영양분의 차이가 많아서 있는 음식으로는 진행하지 못할경우
                resultKeys.push('프로틴(1스쿱) x '+parseInt((dan/40)));
                for(var i =1; i< dan / 40; i++ ){
                    tan -= ARMY_WORKOUT_JSON['food']['px']['프로틴(1스쿱)'][1];
                    dan -= ARMY_WORKOUT_JSON['food']['px']['프로틴(1스쿱)'][2];
                    zi -= ARMY_WORKOUT_JSON['food']['px']['프로틴(1스쿱)'][3];
                    kcal -= ARMY_WORKOUT_JSON['food']['px']['프로틴(1스쿱)'][0];
                }
                break;
            }
            
            cache = ARMY_WORKOUT_JSON['food']['px'][dictKeys[randomIndex]];
            
            if(!(tan-cache[1] < -30 || zi-cache[2] < -30 || zi-cache[3] < -30 || kcal-cache[0] < -300)){
                tan -= cache[1];
                dan -= cache[2];
                zi -= cache[3];
                kcal -= cache[0];
                resultKeys.push(dictKeys[randomIndex]);
            }
            randomIndex = parseInt( Math.random() * dictKeys.length );
        }
        
        
        document.getElementById('feed_food_add').style.display = 'block';
        document.getElementById('feed_food_add').children[1].innerHTML = "<p>"+ resultKeys + "</p>";
        kcal = (origin[0] -parseInt(tan)) * 4 + (origin[1] -parseInt(dan) )*4 +(origin[2] -parseInt(zi))*9
        document.getElementById('feed_food_content').children[2].children[1].innerHTML = '섭취 칼로리 : '+(kcal) + 'kcal<br>'+
                "탄수화물 : " +(origin[0] -parseInt(tan))+ "g, 단백질 : " +(origin[1] -parseInt(dan))+"g, 지방 : "+(origin[2] -parseInt(zi))+ "g";    
        document.getElementById('suggest_kcal').innerText = "권장 칼로리 : "+origin[3]+"kcal";

    }else{ // 병영식X
        var brst = [];
        var lunc = [];
        var dinr = [];
        if(! ARMY_WORKOUT_JSON){// 아직 데이터를 못받았으면
            var wakeUpTime = Date.now() + 1000;
            while (Date.now() < wakeUpTime) {} //기다리기
        }
        var dictKeys = Object.keys(ARMY_WORKOUT_JSON['food']['normal']);
        var cache_kcal;
        
        do{
            brst = feed_food_menu_cal(1,dictKeys, tan*0.25,dan*0.25,zi*0.25);
            cache_kcal = 0;
            for(var i =0; i< brst.length; i++){
                cache_kcal += ARMY_WORKOUT_JSON['food']['normal'][brst[i]][0];
            }
            brst.unshift(cache_kcal);
        }while(cache_kcal > kcal * 0.25);//하루중 아침의 칼로리 비율
        
        do{
            lunc = feed_food_menu_cal(2,dictKeys, tan*0.45,dan*0.45,zi*0.45);
            cache_kcal = 0;
            for(var i =0; i< lunc.length; i++){
                cache_kcal += ARMY_WORKOUT_JSON['food']['normal'][lunc[i]][0];
            }
            lunc.unshift(cache_kcal);
        }while(cache_kcal > kcal * 0.45);
        
        do{
            dinr = feed_food_menu_cal(3,dictKeys, tan*0.3,dan*0.3,zi*0.3);
            cache_kcal = 0;
            for(var i =0; i< dinr.length; i++){
                cache_kcal += ARMY_WORKOUT_JSON['food']['normal'][dinr[i]][0];
            }
            dinr.unshift(cache_kcal);
        }while(cache_kcal > kcal * 0.3 );
        // 위 반복문은 칼로리 넘지 못하게
        
        set_FEEDBACK_FOOD(day, brst, lunc, dinr);
    }
    
}
    
    //  아점저메뉴만 맞춰서 한끼 랜덤으로 짜기  result={음식key : [workout.json value]}
function feed_food_menu_cal(time, dictKeys, tan, dan, zi){
    var result = [];
    var randomIndex = parseInt( Math.random() * dictKeys.length );
    var append_menu; 
    var select;
    var cache = [0,0,0];
    
    // 아점저 맞출때까지, 주식부식 고를떄까지
    while(ARMY_WORKOUT_JSON['food']['normal'][dictKeys[randomIndex]][4].indexOf(time) == -1 || ARMY_WORKOUT_JSON['food']['normal'][dictKeys[randomIndex]][5] == 5){
        randomIndex = parseInt( Math.random() * dictKeys.length );
    }
    select = ARMY_WORKOUT_JSON['food']['normal'][dictKeys[randomIndex]];
    cache[0] += select[1];
    cache[1] += select[2];
    cache[2] += select[3];
    result.push(dictKeys[randomIndex]);
    
    if(select[5] < 3) // 처음 고른 메뉴가 식사류라면
        append_menu = [1,2];
    else // 처음 고른 메뉴가 주식류 라면
        append_menu = [3,4];
    
    if(select[6] != ""){//궁합 맞는 음식이 있다면
        // 랜덤으로 맞는 음식 고르기
        select = select[6].split(',')[parseInt( Math.random() * select[6].split(',').length )]; // 추천음식중 랜덤 이름 반환
        result.push(select);
        select = ARMY_WORKOUT_JSON['food']['normal'][select];
        cache[0] += select[1];
        cache[1] += select[2];
        cache[2] += select[3];
    }
    // 첫 메뉴 선택 완료
    
    // 이어서 메뉴 및 시간대에 따라 영양성분을 벗어나지 않는 선에서 추가
    while(cache[0] < tan*0.9 || cache[1] < dan*0.9 || cache[2] < zi*0.9){ // 어느정도 채울떄까지
        // 25% 확률로 과일 선택
        if(Math.random() <= 1/4){
            randomIndex = parseInt( Math.random() * dictKeys.length );
            while(ARMY_WORKOUT_JSON['food']['normal'][dictKeys[randomIndex]][5] != 5){
                randomIndex = parseInt( Math.random() * dictKeys.length );
            }
            select = ARMY_WORKOUT_JSON['food']['normal'][dictKeys[randomIndex]];
            cache[0] += select[1];
            cache[1] += select[2];
            cache[2] += select[3];
            result.push(dictKeys[randomIndex]);
        }
        // 주로 먹을것 선택        
        randomIndex = parseInt( Math.random() * dictKeys.length );
         // 원하는 메뉴(메뉴도 맞고 시간대도 맞을떄)가 나올떄까지
        while(append_menu.indexOf(ARMY_WORKOUT_JSON['food']['normal'][dictKeys[randomIndex]][5]) == -1 && ARMY_WORKOUT_JSON['food']['normal'][dictKeys[randomIndex]][4].indexOf(time) == -1){
            randomIndex = parseInt( Math.random() * dictKeys.length );
        }
        
        select = ARMY_WORKOUT_JSON['food']['normal'][dictKeys[randomIndex]];
        if(cache[0]+select[1] > tan*0.95 || cache[1]+select[2] > dan*0.95 || cache[2]+select[3] > zi*0.95){ // 너무 넘겨버리면 다른거
            continue;
        }
        
        cache[0] += select[1];
        cache[1] += select[2];
        cache[2] += select[3];
        result.push(dictKeys[randomIndex]);
        
        if(select[6] != ""){//궁합 맞는 음식이 있다면
            // 랜덤으로 맞는 음식 고르기
            select = select[6].split(',')[parseInt( Math.random() * select[6].split(',').length )]; // 추천음식중 랜덤 이름 반환
            result.push(select);
            select = ARMY_WORKOUT_JSON['food']['normal'][select];
            cache[0] += select[1];
            cache[1] += select[2];
            cache[2] += select[3];
        }
    }
    return result;
}
// feed 달력 클릭이벤트 -> 해당 날짜의 운동 정보로 바꾸면서 해당 위치로 이동
function feed_cal_click(obj){
    var self_num = parseInt(obj.id.substr(5)); // 클릭한 개체의 숫자
    
    // 해당 위치 이동
    if(self_num > 13)
        scroll_to('feed_food_head', 300);
    else if(6 < self_num)
        scroll_to('feed_workout_head', 300);
    
    // 달력에서 선택한 날짜 빨간색으로
    for(var i=0;i<7; i++){
        if(i == (self_num%7)){
            document.getElementById('feed_'+(self_num%7)).style.color="red";
        }
        else{
            document.getElementById('feed_'+i).style.color="black";
        }
    }
    
    // 해당 날짜의 정보로 바꾸기
    initFeed_data(self_num%7);
    create_food_calendar();
    resize_tab();
}
function feed_kcal(obj, flag){
    obj.disabled = true;
    $.ajax({
    url: '/update_user_other/',
    data: {'code': 3,'metabolism': (flag==0 ? 'up' : 'down')},
    dataType: 'text',
    type: 'POST',
    success: function (result) {
        obj.disabled = false;
        var kcal = document.getElementById('feed_food_head').placeholder + (flag==0 ? 50 : -50);
        document.getElementById('feed_food_head').placeholder = kcal;
        var target = document.getElementById('acc_target').placeholder;
        if(target == 1)// 벌크업
            kcal += parseInt(kcal*0.55);
        else if(target == 2)//커팅
            kcal += parseInt(kcal*0.4);
        else if(target == 3)//다이어트
            kcal += parseInt(kcal*0.25);
        
        document.getElementById('suggest_kcal').innerText = "권장 칼로리 : "+kcal+"kcal";
        }
    });
}

function feed_food_reload(obj){
    obj.disabled = true;
    var day;
    for(var i=0;i<7;i++){
        if(document.getElementById('feed_'+i).style.color == "red")
            day = i;
    }
    FEEDBACK_FOOD[day] = "";
    initFeed_data(day);
    create_food_calendar();
    
    obj.disabled = false;
}
function feed_workout_reload(obj){
    obj.disabled = true;
    var day;
    for(var i=0;i<7;i++){
        if(document.getElementById('feed_'+i).style.color == "red")
            day = i;
    }
    // 정보 재설정        
    algorithm_workout(day);
    // 정보 띄우기
    feed_change_workoutData(day);
    
    obj.disabled = false;
}
// 근육 부위중에서 big이 small을 포함하는 범위면 true  ex: big=등,small=광배근 => true 
// 해당 함수는 information에서 가져옴
function isInclude_muscle(big, small){
    if(big.indexOf("전신") != -1)
        return true;
    if(big.indexOf(small) != -1)
        return true;
    if(NAMESPACE_MUSCLE[big])
        return NAMESPACE_MUSCLE[big].indexOf(small) != -1;
    return false;
}
function popup_workout(event, url){
    popup(event,"자신이 원하는 운동 목표를 설정해보세요.<br><a href='"+url+"' target=\'_blank\'>추천 루틴</a>")
}
function popup_eat(event){
    if(document.getElementById("acc_army").placeholder == 0){ // 부대식단을 등록 안했을 경우
        popup(event,'본인의 체중 변화에 따라<br>칼로리 Up & Down 버튼을 이용해 권장 칼로리를 설정해주세요.<br>권장 칼로리는 체중,키,나이,목표 등에 따라 결정됩니다.<br>목표(벌크업or다이어트 등)에 따라 영양성분의 비율이 조정됩니다.');
    }else{ // 부대인 경우
        popup(event,'병영식의 평균 영양성분<br>탄수화물 : 394g, 단백질 : 122g, 지방 : 99g<br>섭취 칼로리가 권장칼로리보다 높을 경우 식사량을 조절해주세요.');
    }
}
function popup_inbody(event){
    if(window.outerWidth < 500){ // 모바일에선 사진 그냥 띄우기
        window.open("/static/main/images/ex_inbody1.jpg");
    }else{
        popup(event,'<h2 style="color: red;"> 사용 방법 </h2><img style="width: 90%;margin: 20px;" src="/static/main/images/ex_inbody1.jpg">');
    }
}
function popup_feedImg(event, obj){
    popup(event,"<img style='width: 95%;margin: 5px;' src ='"+ARMY_WORKOUT_JSON['workout'][obj.id][5] +"'/>");
}
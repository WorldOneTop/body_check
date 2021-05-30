let WORKOUT_JSON;
let NAMESPACE_MUSCLE = {"등":"광배근기립근승모근능형근상부 승모근중하부 승모근","어깨":"전면 삼각근측면 삼각근후면 삼각근",
                    "가슴":"흉근상부흉근하부흉근내외측","하체":"대퇴부둔근종아리대퇴사두대퇴이두종아리 전면","팔":"이두삼두전완근상완근",
                    "복부":"복직근복사근장요근상부 복직근하부 복직근","승모근":"상부 승모근중하부 승모근","대퇴부":"대퇴사두대퇴이두","종아리":"종아리 전면","복직근":"상부 복직근하부 복직근"};
// 근육 포함 순서    
// 등 | 광배근, 기립근, 승모근(상부 승모근,중하부 승모근), 능형근
// 어깨 | 전면 삼각근, 측면 삼각근, 후면 삼각근
// 가슴 | 흉근상부, 흉근하부, 흉근내외측
// 하체 | 대퇴부(대퇴사두, 대퇴이두), 둔근, 종아리(종아리 전면)
// 팔 | 이두, 삼두, 전완근, 상완근
// 복부 | 복직근(상부 복직근, 하부 복직근), 복사근, 장요근

// 스크롤 이동 리모컨 구현
 $(function() {
        $(window).scroll(function() {
            if ($(this).scrollTop() > 500) {
                $('#move_top_div').fadeIn();
            } else {
                $('#move_top_div').fadeOut();
            }
        });
        
        $("#move_top_div").click(function() {
            $('html, body').animate({
                scrollTop : 0
            }, 300);
            return false;
        });
    });

// 데이터 저장
window.onload = function() {
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
        WORKOUT_JSON = myJson;
        sessionStorage.setItem("WORKOUT_JSON",JSON.stringify(WORKOUT_JSON));
        init_workout_info();    
        });
    }else{
        WORKOUT_JSON = JSON.parse(sessionStorage.getItem("WORKOUT_JSON"));
        init_workout_info();
    }
    info_click_workout();
    init_word_info();
}

// 사진 확대창에서는 못움직이게
$('#info_workout_picture').on('scroll touchmove mousewheel', function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
});

//색인 자동 채우기
function init_word_info(){
    var index = document.getElementById('info_word_content').children;
    var inputDiv = document.getElementById('info_word_index2');
    var result = {};
    
    for(var i =1; i<index.length-1; i+=2){
        // 카테고리index 건너뛰게
        if(index[i].id)
            i++;
        index[i].id = "info_word_content"+i;
        result[index[i].innerText] = index[i].id;
        // result += "<a style='margin-right:1em;' href='#"+index[i].id+"' >"+index[i].innerText+"</a>";
    }
    
    // 인덱스 정렬
    var order_result ={};
    Object.keys(result).sort().forEach(function(key) {
      order_result[key] = result[key];
    });
    
    result = "";
    for(var key in order_result){
        result += "<a style='margin-right:1em;' href='#"+order_result[key]+"' >"+key+"</a>";
    }
    inputDiv.innerHTML += result;
}
// 일단 운동정보 모두 띄우기
function init_workout_info(){
    var parent = document.getElementById("info_workout");
    var child = parent.children[0];
    // workout":{"운동이름":["관련 운동","주동근","사용도구","비고","추천도(☆★)","자세사진url(깃허브이용)","보디빌딩1,/* 피지크2, */ 파워리프팅3, 크로스핏4, 맨몸5, 다이어트6"]},
    // 보여지는 부분 처리(사진, 이름)
    for( var key in WORKOUT_JSON['workout']){
        child_clone = child.cloneNode(true);
        child_clone.id = key;
        child_clone.children[0].src = WORKOUT_JSON['workout'][key][5];
        child_clone.children[1].innerHTML = key + child_clone.children[1].innerHTML;
        parent.appendChild(child_clone);
    }
    // 복제에 쓰인 첫번째 노드 삭제
    parent.removeChild(child);
    
    // 정렬
    init_workout_for_grid();
        
}
//글자 수가 길어서 격자무늬가 안맞춰질 수도 있어서 클래스네임에$붙여서 통일성 주기
function init_workout_for_grid(){
    var children = document.getElementById('info_workout').children;
    
    //보이는 div에 한해서 3개마다 줄넘김 효과
    for(var i =0,j=0; i < children.length; i++){
        if(children[i].style.display != "none"){
            j++;
            if(j%3 == 0){
                children[i].classList.add('4u$');
            }else{
                children[i].classList.remove('4u$');
            }
        }else{
            children[i].classList.remove('4u$');
        }
    }
}


// 추천도 숫자를 별표로 바꾸기
function convertScroe(number){
    var result= "";
    for(var i=0;i<parseInt(number/2);i++)
        result +="★";
    
    if(number%2 == 1)
        result +="☆";
    
    return result;
}
// 이미지 확대 클릭
function info_workoutPicture(obj){
    var div = document.getElementById('info_workout_picture'); 
    div.children[0].style.top = window.innerHeight /2 - div.children[0].height/2 +'px';
    div.children[0].src = "";
    div.children[0].src = obj.src;
    //배경 설정
    div.style.display = "block";
    div.style.top = window.scrollY+'px';
    
    // 이미지 설정
    div.children[0].style.top = window.innerHeight /2 - div.children[0].height/2 +'px';
}
// 해당 운동 정보 상세보기 아이콘 클릭
function info_workoutMore_icon(obj, e){
    var dialog = document.getElementById("info_workoutMore_dialog");
    var key = obj.parentNode.innerText;
    
    dialog.children[2].textContent = WORKOUT_JSON['workout'][key][1];
    dialog.children[4].textContent = convertScroe(WORKOUT_JSON['workout'][key][4]);
    dialog.children[8].innerHTML = WORKOUT_JSON['workout'][key][3];
    dialog.children[6].innerHTML = "";
    
    var relation_workoutList = WORKOUT_JSON['workout'][key][0].split(",");
    if(! relation_workoutList[0])
        dialog.children[6].innerHTML = "없음";
    else{
        for(var i=0; i < relation_workoutList.length; i++)
            dialog.children[6].innerHTML += '<a href="#'+relation_workoutList[i]+'" '+
                `onclick="info_fadeToggle_andClose('`+relation_workoutList[i]+`');">`+ relation_workoutList[i] + "</a>&nbsp;&nbsp;"
    }
    
    dialog.style.top = e.pageY+15+'px';
    dialog.style.display = "block";
    
    if(window.innerWidth > 736){
        var x = window.innerWidth / e.clientX ; //1.5~2.5가 가운데
        if(x < 1.5){    // 오른쪽
            dialog.style.left = e.pageX - dialog.clientWidth + 'px';
        }else if(x < 2.6){ // 가운데
            dialog.style.left = window.innerWidth/2 - dialog.clientWidth/2 + 'px';
        }else{    // 왼쪽
            dialog.style.left = "auto";
        }
    }else{ // 화면이 작아서 dialog가 꽉차보일때
        dialog.style.left = "0";
    }
}
function info_fadeToggle_andClose(name){
    if(screen.width > 980){
    setTimeout(function() { window.scrollBy(0,-100);}, 20)
    }
    
    document.getElementById("info_workoutMore_dialog").style.display = "none";
    var target = document.getElementById(name);
    target.style.background = "#f005";
    setTimeout(function() { target.style.background = "";}, 400)
    setTimeout(function() { target.style.background = "#f005";}, 800)
    setTimeout(function() { target.style.background = "";}, 1400)
}

function info_click_workout(){
    // 클릭 효과
    document.getElementById("info_h_workout").style.color = "#f32853";
    document.getElementById("info_h_word").style.textDecoration = "none";
    document.getElementById("info_h_word").style.color = "#484848";
    
    // 체크박스 초기화 검색한 운동정보 초기화
    var checkbox_div = document.getElementById('info_filter_checkbox');
    while(checkbox_div.children.length != 1)
        checkbox_div.removeChild(checkbox_div.lastChild);
    info_filter_start(false,'');
    
    // 운동정보 div 보여주기
    $("#info_word_div").fadeOut(200);
    setTimeout(function() { $("#info_workout_div").fadeIn();}, 200)
}
function info_click_word(){
    // 클릭 효과
    document.getElementById("info_h_word").style.color = "#f32853";
    document.getElementById("info_h_workout").style.textDecoration = "none";
    document.getElementById("info_h_workout").style.color = "#484848";
    
    //  용어정보 div 보여주기
    $("#info_workout_div").fadeOut(200);
    setTimeout(function() { $("#info_word_div").fadeIn();}, 200)
    
}
// select 부위별 나오는 option 변경
// selct에서 value : -1은 전체, 0부터 아래 순서대로
function info_filter_part(obj){
    if(obj.id.substr(-1) == '1' ){ // 가장 상위 부위
        // 먼저 나머지 select 정리
        var child = document.getElementById('info_filter_part2');
        document.getElementById('info_filter_part3').innerHTML = '<option> ---- </option>';
        
        var tree = [['광배근','기립근','승모근','능형근'],['전면 삼각근','측면 삼각근','후면 삼각근'],['흉근상부','흉근하부','흉근내외측'],
                    ['대퇴부','둔근','종아리'],['이두','삼두','전완근','상완근'],['복직근','복사근','장요근']];
        
        if(obj.selectedIndex == 0){
            info_filter(obj);
            child.innerHTML = '<option value=-1 > 전신 </option>';
        }else{
            child.innerHTML = '<option value=-1 > 전체 </option>';
            // 중간단계 필터링 생성
            for(var i=1;i<tree[obj.value].length + 1;i++){
                child.options[i] = new Option(tree[obj.value][i-1], i-1);
            }
        }
    }else if(obj.id.substr(-1) == '2' ){// 중간 단계 부위
        // 먼저 나머지 select 정리
        var child = document.getElementById('info_filter_part3');
        child.innerHTML = '';
        
        var p1 = document.getElementById('info_filter_part1').selectedIndex;
        var p2 = document.getElementById('info_filter_part2').selectedIndex;
        var tree = [['상부 승모근','중하부 승모근'],['대퇴사두','대퇴이두'],
                    ['종아리 전면'],['상부 복직근','하부 복직근']];
        var index = -1;

        if(p1==1 && p2==3){// 해당되는 부분은 승모근
            index=0;
        }else if (p1==4 && p2==1){//대퇴부
            index=1;
        }else if(p1==4 && p2==3){//종아리
            index=2;
        }else if(p1==6 && p2==1){//복직근
            index=3;
        }
        
        if(index != -1){
            child.innerHTML = '<option value=-1 > 전체 </option>';
            for(var i=1;i< tree[index].length+1;i++){
                child.options[i] = new Option(tree[index][i-1], i-1);
            }
        }
        else{
            child.innerHTML = '<option value = -1> ---- </option>';
        }
        
        if(index ==-1 || obj.selectedIndex == 0){
            info_filter(obj);
        }
    }else{// 가장 세부 부위
        if(obj.text != '----')
            info_filter(obj);
    }
    
}

// 필더링처리(체크박스 추가,제거, 운동 보이기 처리)
function info_filter(obj){
    var checkbox_div = document.getElementById('info_filter_checkbox');
    
    //필터링 추가
    if(obj.id.substr(0,5) == 'info_'){
        var input_text = "";
        
        
        if(obj.value != -1){ // 바로 넣어도 되는 선택
            input_text = obj.selectedOptions[0].text
        }else{    // 전체 인 구간을 선택했을때
            var muscle = parseInt(obj.id.substr(-1));
            //해당 필터링이 운동부위인지
            if(muscle){
                if(muscle == 1){
                    input_text = "전신"
                }else{
                    input_text = document.getElementById('info_filter_part'+(muscle-1)).selectedOptions[0].text;
                }
            }else{//해당 필터링이 기구일 경우 그냥 pass
                return;
            }
        }
        
        var checkbox = checkbox_div.children[0].cloneNode(true);
        checkbox.style.display = 'block';
        checkbox.innerHTML = input_text + checkbox.innerHTML;
        checkbox.id += input_text;
        
        // 중복 방지
        var check = document.getElementById(checkbox.id);
        if(check != null)
            check.parentNode.removeChild(check);
        
        checkbox_div.appendChild(checkbox);
        
        info_filter_start(true, input_text);
    }else{ // 필터링 삭제
        obj.parentNode.removeChild(obj);
        if(obj.id.substr(13,6) == 'search')
            info_search_filter(false, '');
        else
            info_filter_start(false, '');
    }
    
}
function check_filter_category(str){
    var check_str1 = "바벨덤벨케이블벤치머신";
    var check_str2 = "보디빌딩파워리프팅크로스핏맨몸운동다이어트";
    
    if(check_str1.indexOf(str) != -1)
        return 1;
    if(check_str2.indexOf(str) != -1)
        return 2;
    // if()
        return 0;
    
    
}
// 실질적 필터링 수행(검색 필터링 빼고)   필터링을 추가하는경우, 필터링 문자열
function info_filter_start(isAdd, filter_str){
    var workout_div = document.getElementById('info_workout').children;
    // json형식의 1, 2, 6 번째 순서로 필터이름 push
    var filters = [[],[],[]];
    var check_str1 = "바벨덤벨케이블벤치머신";
    var check_str2 = "보디빌딩파워리프팅크로스핏맨몸운동다이어트";
    var convert_name = {"보디빌딩":1,"파워리프팅":3,"크로스핏":4,"맨몸운동":5,"다이어트":6};
    var checkbox_div = document.getElementById('info_filter_checkbox');
    
    if(isAdd){ // 추가한 필터링 문자열만 필요
        if(check_str1.indexOf(filter_str) != -1){
            filters[1].push(filter_str);
        }else if(check_str2.indexOf(filter_str) != -1){
            filters[2].push(convert_name[filter_str]);
        }else{
            filters[0].push(filter_str);
        }
    }else{    // 추가돼있는 모든 필터링 문자 필요
        // 1은 복제용 div라서 넘기고시작
        for(var i=1;i<checkbox_div.children.length;i++){
            if(checkbox_div.children[i].id.substr(13,6) != 'search'){
                var filter_name = checkbox_div.children[i].textContent;

                if(check_str1.indexOf(filter_name) != -1){
                    filters[1].push(filter_name);
                }else if(check_str2.indexOf(filter_name) != -1){
                    filters[2].push(convert_name[filter_name]);
                }else{
                    filters[0].push(filter_name);
                }
            }
        }
    }
    // display필터링 작업             지금 문제점은 필터링 중 하나라도 맞으면 보이게 됨
    var key;
    var checkDisplay = isAdd ? "block" : "none";
    
    // 전체 운동을 대상으로 필터링의 조건이 하나라도 안맞으면 안보이게
    // isAdd ? 보이는 div 대상으로 추가된 필터링 검사 및 추가 필터링 : 안보이는 div대상으로 모든 조건에 충족하면 보이게
    for(var i =0;i<workout_div.length; i++){
        key = workout_div[i].children[1].textContent;
        
        if(workout_div[i].style.display == checkDisplay){
            var filter0,filter1,filter2;
            for(filter0 =0;filter0<filters[0].length; filter0++){ // 운동부위 카테고리 필터
                if(! isInclude_muscle(WORKOUT_JSON['workout'][key][1],filters[0][filter0]))
                    break;
            }
            if(filter0 != filters[0].length){
                workout_div[i].style.display = "none";
                continue;
            }
            for(filter1 =0;filter1<filters[1].length; filter1++){ // 기구 카테고리 필터
                if(WORKOUT_JSON['workout'][key][2].indexOf(filters[1][filter1]) == -1)
                    break;
            }
            if(filter1 != filters[1].length){
                workout_div[i].style.display = "none";
                continue;
            }
            for(filter2 =0;filter2<filters[2].length; filter2++){ // 종목 카테고리 필터
                if(WORKOUT_JSON['workout'][key][6].indexOf(filters[2][filter2]) == -1)
                    break;
            }
            if(filter2 != filters[2].length){
                workout_div[i].style.display = "none";
            }else{// 모두 필터링에 부합되어서 정상적으로 끝날경우
                workout_div[i].style.display = "block";
            }
        }
    }
    // div 정렬
    init_workout_for_grid();
}

// 근육 부위중에서 big이 small을 포함하는 범위면 true  ex: big=등,small=광배근 => true 
function isInclude_muscle(big, small){
    if(big.indexOf(small) != -1)
        return true;
    else if(NAMESPACE_MUSCLE[big])
        return NAMESPACE_MUSCLE[big].indexOf(small) != -1;
    else
        return false;
}
// 검색기능(추가하기)
function info_search(obj){
    var search = document.getElementById('info_filter_search');
    var search_str = search.value;
    
    if(search_str == '')
        return;
    
    search.value = "";
    search.blur();    // 포커스 지우기

    // 체크박스에 추가
    var checkbox_div = document.getElementById('info_filter_checkbox');
    var checkbox = checkbox_div.children[0].cloneNode(true);
    checkbox.style.display = 'block';
    checkbox.innerHTML = search_str + checkbox.innerHTML;
    checkbox.id += "search_" + search_str;
        
        // 중복 방지
    var check = document.getElementById(checkbox.id);
    if(check != null)
        check.parentNode.removeChild(check);
        
    checkbox_div.appendChild(checkbox);
    
   info_search_filter(true, search_str);
}
// 검색 문자열 필터링 수행
function info_search_filter(isAdd, search_str){
    var checkDisplay = isAdd ? "block" : "none";
    var workout_div = document.getElementById('info_workout').children;
    
    if(isAdd){// isAdd ? 보이는 div 대상으로 추가된 필터링 검사 및 추가 필터링
        for(var i =0;i<workout_div.length; i++){
            if(workout_div[i].style.display == "block"){
                if(workout_div[i].children[1].textContent.indexOf(search_str) == -1){
                    workout_div[i].style.display = "none";
                }
            }
        }
    }
    else{ //
        var search_strs = [];
        var checkbox_div = document.getElementById('info_filter_checkbox');
        for(var i=1;i<checkbox_div.children.length;i++){
            if(checkbox_div.children[i].id.substr(13,6) == 'search'){
                search_strs.push(checkbox_div.children[i].textContent);
            }
        }
        // 다 띄우고 필터링하고 남아있는 문자검색은 추가하면서
        
        // 다 띄우고 문자열 검색을 제외한 필터링 적용
        for(var i =0;i<workout_div.length; i++){
            workout_div[i].style.display = "none"; // 필터링 함수 특성때문에 none으로 출발
        }
        info_filter_start(false, '');
        
        //  문자열 필터링 추가
            for(var i=0; i<search_strs.length; i++){ 
                info_search_filter(true, search_strs[i]);
            }
    }
    
    init_workout_for_grid();
}
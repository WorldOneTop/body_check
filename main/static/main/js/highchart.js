var chart;
var dataSet = [[],[],[],[],[],[],[],[],[]];
var MAX_LENGTH = 17;
function init_chart(data){
    
   
    data.forEach(function(v){
        dataSet[0].push((v['weight'] == 0) ? null : v['weight']);
        dataSet[1].push((v['muscle'] == 0) ? null : v['muscle']);
        dataSet[2].push((v['fat'] == 0) ? null : v['fat']);
        dataSet[3].push((v['water'] == 0) ? null : v['water']);
        dataSet[4].push((v['protein'] == 0) ? null : v['protein']);
        dataSet[5].push((v['mineral'] == 0) ? null : v['mineral']);
        dataSet[6].push((v['score'] == 0) ? null : v['score']);
        dataSet[7].push(v['date']);
        //pk인 id
        dataSet[8].push(v['id']);
    });
    
    
    
    chart = Highcharts.chart('chart_container', {
        title: {
            text: '',
        },
        xAxis: {
            categories: [],
        },
        chart: {
            scrollablePlotArea: {
                minWidth: 700,
                scrollPositionX: 1,
                opacity:0.8
            },
            backgroundColor:'#fefbf1',
            animation: {
                duration: 1200
            }
        },
        yAxis: {
            allowDecimals: true,
            title: {
                text: '',
            },
        },
        legend: {
            layout: 'vertical'    ,
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0,
        },
        plotOptions: {
            series: {
                connectNulls: true,//null값인 부분 연결
                events: {
                    legendItemClick: function () {
                        if(this.index == 6){
                            return true;
                        }
                        document.getElementById("section_ex_"+this.index).style.display = this.visible ? "none" : "block";
                    }
                }
            }
        },
        series: [
            {      
                name: '체중',
                data: [],
            },
            {
                name: '골격근량',
                data: [],
            },
            {
                name: '체지방률',
                data: [],
            },
            {
                name: '체수분',
                data: [],
            },
            {
                name: '단백질',
                data: [],
            },
            {
                name: '무기질',
                data: [],
            },
            {
                name: '점수',
                data: [],
            }
        ]
    });
    
}

function drawData(now){
      // x축(날짜) 초기화
    var categories=[];
    for(var i=0;i<dataSet[7].length;i++){
        if(dataSet[7][i].substr(0, 4) == new Date().getFullYear()){//현재랑 같은 년도이면
            categories.push(dataSet[7][i].substr(5));
        }else{//다른년도이면
            categories.push(dataSet[7][i]);
        }
    }
    chart.xAxis[0].setCategories(categories);
    
     // 너무 많으면 addPoint 활용시 느림
    if(MAX_LENGTH < dataSet[7].length){
        for(var ii =0; ii<chart.series.length; ii++){
            chart.series[ii].setData(dataSet[ii]);
        }
        return;
    }
    
    //지우고 새로 그리기
    for(var ii =0; ii<chart.series.length; ii++){
        chart.series[ii].setData();
    }
    setTimeout(function(){
        chart.reflow();
                    // 총 보여주는 시간은 1.5초 + 8개당 0.5초씩 추가
        var sumTime = 1500+(parseInt(dataSet[7].length/8)*500);
        if(dataSet[7].length>32){//너무 많다 싶으면 딜레이없이
            sumTime = 0;
        }
        var time_interval = parseInt(sumTime / dataSet[7].length);//시간안에 순서대로 다보여주기위해서
        var i=0,j=0;
        
        for (var k = 0; k < dataSet[7].length; k++) {
            setTimeout(function() {
                for(var j =0; j < chart.series.length; j++){
                     chart.series[j].addPoint(dataSet[j][i]);
                    if(j == chart.series.length-1){
                        i++;
                    }
                }
            }, time_interval*k*now);//애니메이션 효과 보여주기위해서
        }
    chart.reflow();
    },1000*now);
}


//history 탭의 결과 수정 데이트타임 설정 및 클릭이벤트
function init_categories() {//카테고리 초기화
    var updateDate = document.getElementById("updateDate");
    var uniqueArr = []; 
    updateDate.innerHTML = '<option value="1">날짜 선택</option>';//초기화

    // 겹치는 날짜 처리
    for(var i =0; i<dataSet[7].length; i++){// 모두 순회한다 했을때
        if(dataSet[7][i] == dataSet[7][i+1]){//겹치는 부분이 발견되면
            for(var j =1; j<dataSet[7].length-i; j++){ //해당 부분부터 _1 붙이기
                if(dataSet[7][i+j] != dataSet[7][i]){ //다른 부분이 시작되면 끊기
                    break;
                }
                uniqueArr.push(dataSet[7][j+i]+"_"+(j+1));
            }
            uniqueArr.splice(i, 0, dataSet[7][i]+"_1");
            i = i+j-1;
        }else{
            uniqueArr.push(dataSet[7][i]);
        }
    }

    for(var i=0; i<uniqueArr.length; i++) { //카테고리의 옵션 만들기
        var select = document.createElement("option");
        select.setAttribute("value",uniqueArr[i]);
        select.setAttribute("id","updateDate"+i);
        select.innerHTML = uniqueArr[i];
        updateDate.appendChild(select);
    }
}
function delete_dateOption(){// 날짜 변경 설정창 닫기
     $("#updateData").fadeOut(600);
    setTimeout(function() {resize_tab();}, 700);
}
function updateDate(updateDate){ //카테고리 선택시 설정창 열기 및 안의 값들 설정
    var date = updateDate.value;
    var index = updateDate.selectedIndex-1;
    var data = document.getElementById("updateData");
    
    if(date == 1){//만약 날짜선택을 눌렀을 경우 옵션창 닫기
        delete_dateOption();
        return;
    }if(data.style.display != "block"){
        $("#updateData").fadeIn(600);
        resize_tab();
    }
    
    //안의 설정값 세팅하기
    for(var i =0; i< 6;i++){
        data.elements[i].value = dataSet[i][index];
    }
    data.elements[6].value = date.substring(0,10);
    
    
}
function update_reset(){//하루의 데이터 삭제
    var dataIndex = document.getElementById("updateDate").selectedIndex-1;
    $.ajax({
        url: "./delete/",
        data: "id="+ dataSet[8][dataIndex],
        type: 'POST',
        success: function (result) {
            delete_dateOption();
            for(var i =0;i<7;i++){//차트데이터 및 setData 자르기
                chart.series[i].data[dataIndex].remove();
                dataSet[i].splice(dataIndex, 1);
            }
            dataSet[7].splice(dataIndex, 1);
            dataSet[8].splice(dataIndex, 1);
            //카테고리 업데이트
            var header = document.getElementById("updateDate"+dataIndex);	//제거하고자 하는 엘리먼트
            header.parentNode.removeChild(header);
        }});
}
function update_highchart(){//변경 결과 저장 및 설정창 닫기
    var datas = document.getElementById("updateData");
    var dataIndex = document.getElementById("updateDate").selectedIndex-1;
    var send = {};
    for(var i=0; i<7;i++){
        send[datas.elements[i].id.substr(2)] = datas.elements[i].value=="" ? '0' : datas.elements[i].value;
    }
    send['id'] = dataSet[8][dataIndex];
    
    $.ajax({
        url: "./update/",
        data: send,
        type: 'POST',
        dataType : "text",
        success: function (result) {
            //dataSet 바꾸기
            for(var i =0;i<6;i++){
                dataSet[i].splice(dataIndex, 1, Number(datas.elements[i].value));//데이터 세팅 
            }
            dataSet[6].splice(dataIndex, 1, Number(result));
            
            if(datas.elements[6].value != document.getElementById("updateDate").value.substring(0,10)){//날짜를 업데이트 한경우
                var insert_index;
                for(var i=0;i<=dataSet[7].length;i++){//시간으로 비교해서 넣을 위치 찾기
                    if(i==dataIndex){//같은 값 비교 X
                        continue;
                    }
                    if(i==dataSet[7].length){//끝까지 갔다면 맨뒤
                        insert_index = i;
                        break;
                    }
                    else if(datas.elements[6].value < dataSet[7][i]){//작은순으로 비교했는데 작다면 거기 위치
                        insert_index = i > dataIndex ? i-1 : i;//가지고있는값을 넘었다면 index상에서 -1에 위치함
                        break;
                    }
                }
                dataSet[7].splice(dataIndex, 1, datas.elements[6].value);//날짜 세팅
                
                for(var i =0;i<dataSet.length;i++){
                    dataSet[i].splice(insert_index, 0, dataSet[i].splice(dataIndex, 1)[0]);//배열순서바꾸기
                }
                drawData(0);//바로 다시그리기
                init_categories();//카테고리도(데이터 수정) 업데이트
            }else{//안한경우 차트 변화만
                for(var i =0;i<6;i++){
                    chart.series[i].data[dataIndex].update(dataSet[i][dataIndex]);
                }
                init_categories();//
            }
            delete_dateOption();
        }});
}
function create_chartData(val){//바디체크탭에서 만든 데이터 적용하기
    var form = document.getElementById("form_submit");
    var insert_index;
    
    for(var i=0;i<=dataSet[7].length;i++){//시간으로 비교해서 넣을 위치 찾기
        if(i==dataSet[7].length){//끝까지 갔다면 맨뒤
            insert_index = i;
            break;
        }
        else if(form.elements[6].value < dataSet[7][i]){//작은순으로 비교했는데 작다면 거기 위치
            insert_index = i;
            break;
        }
    }
    for(var i=0;i<6;i++){//dataSet 추가
        dataSet[i].splice(insert_index, 0, (form.elements[i].value == 0 ? null : form.elements[i].value)*1);
    }
    dataSet[6].splice(insert_index, 0, val.score);
    dataSet[7].splice(insert_index, 0, form.elements[6].value);
    dataSet[8].splice(insert_index, 0, val.id);
    
    //카테고리도(데이터 수정) 업데이트
    init_categories()
}

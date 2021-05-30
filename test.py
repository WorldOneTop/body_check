import json
import requests
import os
from datetime import datetime


# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 병영식단 공공데이터용 부대명
ARMYDATA_NAMES = ['9030','8902','8623','7652','7369','6335','6282','6176','5322','5021','1691','2171','ATC','3296','3389']
ARMYDATA_HOST = "https://openapi.mnd.go.kr/"

with open(os.path.join('secrets.json')) as f:
    secrets = json.loads(f.read())
    ARMYDATA_HOST += secrets['ARMY_DATA_API_KEY']
ARMYDATA_HOST += '/json/DS_TB_MNDT_DATEBYMLSVC_'
ARMYDATA_SERVICE = 'DS_TB_MNDT_DATEBYMLSVC_'


def publicData_hostName(name, start=1, end=100000):
    return ARMYDATA_HOST+name+'/'+str(start)+'/'+str(end)+'/'


# 이번달 부대 메뉴가 없다면 False 있다면 True
def foodMenu_isExists():
    # 파일 자체가 없다면
    if(not os.path.isfile('/armyFoodMenu.json')):
        return False

    # 파일 데이터 불러오기 및 date 확인
    with open('/armyFoodMenu.json', 'r') as f:
        file = json.load(f)
        return file['date'] == datetime.today().strftime("%Y%m")


# 이번달 부대별 메뉴 무조건 저장
# 저장 파일 형식 : {'부대명': {'해당날짜':[{데이터},데이터,..]}, '부대명':{...} ..., 'date': 해당 데이터의 날짜(년도월)}
def publicData_FoodMenu_Save():
    today = datetime.today().strftime("%Y%m")
    result = {} # 파일에 저장할 데이터

    for armyName in ARMYDATA_NAMES:
        data = json.loads(requests.get(publicData_hostName(armyName)).text) # 해당 부대 식단 전체 데이터
        data = data[ARMYDATA_SERVICE+armyName]['row'] # 식단 정보만 추출
        input_date = '' # 하루의 시작임을 알리는 flag 및 그날의 날짜정보
        insert_data = {}  # 해당 부대의 한달치 식단을 입력할 변수
        for i in range(len(data)):
            if(input_date): # 하루치 중간의 데이터
                if(data[i]['dates']): # 다음 날짜가 있다면 하루식단 끝
                    input_date = ''
                else: # 아니라면 추가 아직 당일 식단이므로 추가
                    insert_data[input_date].append(data[i])

            if(data[i]['dates']): # 날짜가 있다면 하루식단의 시작임
                input_date = data[i]['dates'].replace('-', '')
                # 이번달의 데이터인지 , 중복되지는 않았는지
                if(input_date.startswith(today) and (input_date not in insert_data)):
                    insert_data[input_date] = [data[i]]
                else:
                    input_date = ''

            result[armyName] = insert_data
    result['date'] = today
    # with open(BASE_DIR+'/armyFoodMenu.json', 'w') as f:
    #     json.dump(result, f)

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.core.mail import EmailMessage
from .models import User, OCR, Change, Picture, Board
from django.db.models import Q
import random
import string
import json
import bcrypt
from datetime import datetime
import os
from django.contrib.auth import logout as auth_logout
from . import vision
import requests
import threading


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 병영식단 공공데이터용 부대명
ARMYDATA_NAMES = ['9030','8902','8623','7652','7369','6335','6282','6176','5322','5021','1691','2171','ATC','3296','3389']
ARMYDATA_HOST = "https://openapi.mnd.go.kr/"
with open(os.path.join(BASE_DIR, 'secrets.json')) as f:
    ARMYDATA_HOST += json.loads(f.read())['ARMY_DATA_API_KEY']
ARMYDATA_HOST += '/json/DS_TB_MNDT_DATEBYMLSVC_'
ARMYDATA_SERVICE = 'DS_TB_MNDT_DATEBYMLSVC_'
# https://openapi.mnd.go.kr/ API의 키 /json/DS_TB_MNDT_DATEBYMLSVC_부대명/1/100000/ # 100000건 조회가 최대

def index(request):
    request.session.clear_expired() # 유효하지 않은 세션을 모델에서 지움
    foodMenu_Process_save() # 이번달 병영식단 저장 존재시 저장X

    if(request.session.get('id', False)):
        aka = User.objects.get(pk=request.session['id']).aka
        return render(request, 'main/index.html', {'aka': aka})
    return render(request, 'main/index.html')


def intro(request):
    return render(request, 'main/intro.html')


def community(request, num, isBug):
    search = request.GET.get('search')
    category = request.GET.get('category')
    result = {}
    if(request.session.get('id', False)):
        aka = User.objects.get(pk=request.session['id']).aka
        result['aka'] = aka
    
    if(not(search and category) or search == ''):
        instance = Board.objects.select_related().filter(isBug=isBug).values('id','title','date','isRevise','isSecret','email','email__aka').order_by("-id")
        result['sum'] = len(instance)
        result['list'] = list(instance[num:num+10])
    else:
        if(category == '1'):
            filtering = Board.objects.filter(isBug=isBug,email__aka__contains = search)
        else:
            filtering = Board.objects.filter(isBug=isBug).filter(Q(title__contains=search) | Q(content__contains=search))
        instance = filtering.values('id','title','date','isRevise','isSecret','email','email__aka').order_by("-id")
        result['sum'] = len(instance)
        result['list'] = list(instance[num:num+10])
        
    for i in range(len(result['list'])):
        result['list'][i]['date'] = str(result['list'][i]['date'])
        result['list'][i]['isRevise'] = 1 if result['list'][i]['isRevise'] else 0
        result['list'][i]['isSecret'] =  1 if result['list'][i]['isSecret'] else 0
        
    return render(request, 'main/community.html', result)
        

def comm_write(request, isBug, num):
    result = {'data': {}}

    if(num != 0 ):
        instance = Board.objects.get(pk=num)
        if(instance.email.email != request.session.get('id', "")):
            result['data']['isMe'] = 0
            return render(request, 'main/comm_write.html', result)

        result['data']['isMe'] = 1
        result['data']['id'] = instance.id
        result['data']['isBug'] =  1 if instance.isBug else 0
        result['data']['title'] = instance.title
        result['data']['content'] = instance.content
        result['data']['isSecret'] =  1 if instance.isSecret else 0
        result['data']['picture'] = instance.picture.name.split('/')[-1]

    return render(request, 'main/comm_write.html', result)


def comm_visited(request, num):
    result = {}
    user = {}
    
    if(request.session.get('id', False)):
        user = User.objects.get(pk=request.session['id'])
        result['aka'] = user.aka
        
    result['data'] = dict(Board.objects.select_related().filter(id=num).values('id','title','content','date','picture','isRevise','email__aka','email','isSecret')[0])
    result['data']['date'] = str(result['data']['date'])
    result['data']['isRevise'] = 1 if result['data']['isRevise'] else 0
    result['data']['isSecret'] = 1 if result['data']['isSecret'] else 0

    if(result['data']['email'] == request.session.get('id', "")):
        result['data']['isMe'] = 1
    if(result['data']['isSecret']):
        if(request.session.get('id', False ) == 'dlwpdlf147@naver.com' or result['data']['isMe']):
            result['data']['isSecret'] = 0
            return render(request, 'main/comm_visited.html', result)
        return render(request, 'main/comm_visited.html', {'data':{'isSecret':1}})
        
    return render(request, 'main/comm_visited.html', result)


def information(request):
    if(request.session.get('id', False)):
        aka = User.objects.get(pk=request.session['id']).aka
        return render(request, 'main/information.html', {'aka': aka})
    return render(request, 'main/information.html')


def comm_save(request, isBug, num):
    result = {'title': request.POST['title'], 'content':request.POST['content']}
    result['email'] = User.objects.get(pk=request.session['id'])
    result['isBug'] = isBug
    
    if(isBug == 1 and 'isSecret' in request.POST):
        result['isSecret'] = request.POST['isSecret'] == 'true'

    if('image' in request.FILES):
        result['picture'] = request.FILES['image']
    elif(num != 0):
        result['picture_isDel'] = request.POST['image']
    # 수정일때
    if(num != 0):
        instance = Board.objects.get(pk=num).custom_update(result)
    else:
        instance = Board.objects.create(**result)

    return HttpResponse(instance.id)

def comm_remove(request, num):
    instance = Board.objects.get(pk=num)
    if(request.session.get('id', "") == instance.email_id):
        if(instance.picture and os.path.exists(instance.picture.path)):
                os.remove(instance.picture.path)
        instance.delete()
    return HttpResponse("")
    


def mypage(request):
    try:
        # 차트에 쓰일 DB 전송
        chart = Change.objects.filter(email=request.session['id']).order_by('date',"id")
        # 그냥 보내면 datetime.date(값) 으로 보내서 문자열로 바꿔줌
        chart_values = list(chart.values())
        for val in chart_values:
            val['date'] = str(val['date'])
        chart_values = str(chart_values)

        # 바디프로필(사진,값)에 쓰일 DB전송
        body = Picture.objects.filter(email=request.session['id']).order_by('date',"id")
        body_values = list(body.values())
        for i in range(len(body_values)):
            body_values[i]['date'] = str(body_values[i]['date'])
            # 0인 데이터는 안보내기
            body_values[i] = {key: value for key, value in body_values[i].items() if value != 0} 
        body_values = str(body_values)

        # 게정설정 탭에 쓰일 DB 전송
        user = User.objects.get(pk=request.session['id'])

        send_data = {"aka":user.aka, "chart": chart_values, "spec": body_values, "account": user.getInfo(), "feed": user.getWorkout()}
    # 세션값이 없을때, 로그인 정보가 맞지않을때
    except(KeyError):
        return render(request, 'main/error.html', error_body(4))
    return render(request, 'main/mypage.html', send_data)


def delete_change(request):
    Change.objects.filter(id=request.POST['id']).delete()
    return HttpResponse("")


def update_change(request):
    data = Change.objects.get(pk=request.POST['id'])
    data.weight  = request.POST['weight']
    data.muscle  = request.POST['muscle']
    data.fat  = request.POST['fat']
    data.water  = request.POST['water']
    data.protein  = request.POST['protein']
    data.mineral  = request.POST['mineral']
    data.date  = request.POST['date']
    data.save()
    return HttpResponse(data.score)


def add_picture(request):
    # 결과값 받아서 dict 형태로 저장
    v = json.loads(request.POST['datas'])
    # 빈 문자열 제거 및 dict형으로 변환
    v = dict((i, j) for i, j in v.items() if j)
    # insert ( **kwargs에 직접 dict형으로 주기위해서 **붙임)
    v['picture'] = request.FILES['photo']
    v['email'] = User.objects.get(pk=request.session['id'])
    send_dict = Picture.objects.create(**v).__dict__
    del(send_dict['_state'])
    return HttpResponse(json.dumps(send_dict))


def delete_picture(request):
    Picture.objects.get(pk=request.POST['id']).delete()
    return HttpResponse("")


def delete_user(request):
    # test아이디는 못지우게
    if(request.session['id'] == 'test'):
        return HttpResponse("error : test account is do not change")

    User.objects.get(pk=request.session['id']).delete()
    auth_logout(request)
    return HttpResponse("")


def update_user(request):
    # test는 닉넴,비번 못바꾸게
    if(request.session['id'] == 'test' and ('pw_check' in request.POST or 'aka' in request.POST)):
        return HttpResponse("error : test account is do not change")
    # value값이 리스트형으로 싸여있어서
    data = {key: value[0] for key, value in dict(request.POST).items() if value[0]}
    # 숫자형으로 넣어야하는데 문자로 되어있어서
    for key, value in data.items():
        try:
            if (key == 'target' or key == 'age'):
                data[key] = int(value)
                if int(value) < 0: raise ValueError
            elif (key == 'height'):
                data[key] = float(value)
                if float(value) < 0: raise ValueError
            elif (key == 'pDay'):
                data[key] = int(value)
                if (int(value) < 0 or int(value) > 7) : raise ValueError
            elif (key == 'way' or key == 'num' or key =='part'):
                data[key] = int(value)

        except ValueError:
            if(key == 'age'):
                return HttpResponse('나이는 양의 정수만 입력해주세요.')
            elif(key == 'height'):
                return HttpResponse('키는 양수만 입력해주세요.')
            elif(key == 'pDay'):
                return HttpResponse('한 주의 운동 가능 일수를 입력해주세요.')

    user = User.objects.filter(email=request.session['id'])

    if('pw_check' in data): # 비밀번호도 바꿀때
        if(bcrypt.checkpw(data['pw_check'].encode('utf8'), user[0].pw.encode('utf8'))): #비밀번호가 맞다면
            data['pw'] = bcrypt.hashpw(data['pw_new'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            del(data['pw_new'])
            del(data['pw_check'])
        else:
            return HttpResponse("error : password is not the same")
    if('height' in data or 'age' in data or 'target' in data ): # 일일대사량에 관여하는게 바뀌면
        weight = User.lately_weight(request.session['id'])
        if(weight):
            data['metabolism'] = User.cal_metabolism(user[0].sex, data.get('height',user[0].height), weight, data.get('age', user[0].age));
        else:
            data['metabolism'] = 0
    user.update(**data)
    return HttpResponse('')




# 유저의 사진(code=1), 부대(2), 칼로리 설정
def update_user_other(request):
    user = User.objects.get(pk=request.session['id'])
    if(request.POST['code'] == '1'):
        user.picture = request.FILES['photo']
    elif(request.POST['code'] == '2'):
        user.army = request.POST['army']
    elif(request.POST['code'] == '3'):
        if(request.POST['metabolism'] == 'up'):
            user.metabolism += 50
        else:
            user.metabolism -= 50
    user.save()
    return HttpResponse('')


def error(request):
    try:
        if(request.method == 'POST'):
            if(request.POST['case'] == '2'):
                return render(request, 'main/error.html', error_body(2, request.POST['m']))

            else:
                return render(request, 'main/error.html', error_body(request.POST['case']))
        else:
            if(request.GET['case'] == '2'):
                return render(request, 'main/error.html', error_body(2, request.GET['m']))
            else:
                return render(request, 'main/error.html', error_body(int(request.GET['case'])))
    except(KeyError):
        pass
    return render(request, 'main/error.html')


# 링크타고 회원가입하러 들어온 view
def signup(request):
    # json데이터 확인
    with open(BASE_DIR+'/signup.json', 'r') as f:
        jf = json.load(f)
    # 1시간 넘은건 삭제
    now = datetime.now()
    for key in list(jf.keys()):
        json_date = datetime.strptime(jf[key]['date'], '%Y-%m-%d %H:%M:%S.%f')
        if((now-json_date).days >= 1 or (now-json_date).seconds/3600 >= 1):
            del(jf[key])
        else:
            break
    with open(BASE_DIR+'/signup.json', 'w') as f:
        json.dump(jf, f)

    # 만약 1시간이 넘은게 있다면 or 없는 링크라면 만료된 링크로
    try:
        email = jf[request.GET['key']]['email']
        pw = jf[request.GET['key']]['pw']
    except(KeyError):
        return render(request, 'main/error.html', error_body(5))

    # 회원가입 폼 마저작성해야할 경우
    try:
        request.POST['pw']
    except(KeyError):
        return render(request, 'main/signup_form.html', {'pw': pw})
    for value in request.POST.dict().values():
        if(value == ''):
            return render(request, 'main/signup_form.html', {'pw': pw,'noneValue':True})

    # 회원가입 폼 및 email을 바탕으로 user 생성
    try:
        user = User.objects.get(pk=email)
    except(KeyError):
        return render(request, 'main/error.html', error_body(1))
    # 없는게 당연해서 실행되야할 공간
    except(User.DoesNotExist):
        user = User()
        user.email = email
        user.pw = bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user.sex = request.POST['sex']
        try:
            user.age = int(request.POST['age'])
            if(user.age < 0):
                raise ValueError
        except ValueError:
            return render(request, 'main/signup_form.html', {'pw': pw,'age':True})
        try:
            user.height = float(request.POST['height'])
            if(user.height < 0):
                raise ValueError
        except ValueError:
            return render(request, 'main/signup_form.html', {'pw': pw,'key':True})
        user.aka = "guest"+str(User.objects.count())
        user.save()
    else:
        return render(request, 'main/error.html', error_body(1))
    
    # 확인된 json 데이터 지우기
    del(jf[request.GET['key']])
    with open(BASE_DIR+'/signup.json', 'w') as f:
        json.dump(jf, f)

    return HttpResponseRedirect(reverse('index'))


# 로그인 버튼 클릭했을때 (id없으면 회원가입이메일보내고 진행)
def login(request):
    try:
        user = User.objects.get(pk=request.POST['id'])
    except(KeyError):
        return render(request, 'main/error.html', error_body(1))
    # 등록된id가 없을때
    except(User.DoesNotExist):
        # 랜덤문자열 json에 넣기
        randomStr = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(10))
        pw = request.POST['pw']
        signup_create(randomStr, create_login_dict(request.POST['id'], pw, randomStr))
        EmailMessage('[체단실] 회원가입 인증을 진행해 주시기 바랍니다.',
                     '비밀번호는 입력하신 것과 동일하며 아래의 링크로 접속하여 인증을 진행해 주시기 바랍니다.  1시간이 지나게될 경우 링크의 유효성은 없어지게됩니다.\n http://' +
                     str(request.get_host())+'/signup/?key='+randomStr
                     , to=[request.POST['id']]).send()

        return HttpResponse()
    # 등록된 id가 있을때
    else:
        # 비번이 맞을때
        if(bcrypt.checkpw(request.POST['pw'].encode('utf-8'), user.pw.encode('utf-8'))):
            request.session['id'] = request.POST['id']
            return HttpResponse(2, request)
        else:
            return HttpResponse(1, request)


def logout(request, to):
    auth_logout(request)
    if(to=='community'):
        to += '/0/0'
    return HttpResponseRedirect('/'+to)


def upload_img(request):
    result = {}
    file = OCR() # 오브젝트 생성
    try:
        file.photo = request.FILES['photo']
        file.owner = request.session['id']
        file.save()
    except(KeyError):
        print("upload_img : KeyError")
        return render(request, 'main/error.html', error_body(4))

    name = str(file.photo)[4:] # photo 값이 ocr/파일이름 으로 되버려서
    path = str(file.photo.path)[:-len(name)]

    output = vision.ocr(path+name)
    text = request.POST['text'].split(',')
    output_result = vision.getImageResult(output.json(), path, name, text)

    # vision.saveImage(path, name, output.json())
    # result['imageSaveTime'] = time.time() - start
    if(not output_result):
        result["result_img"] = ""
        return HttpResponse(json.dumps(result))
    result["result_img"] = "/media/ocr/result/"+name
    for i, j in output_result.items():
        result[i] = j
    return HttpResponse(json.dumps(result))


# 사용자에게 이미지 보여줬으면 지우기(window.onbeforeunload 이벤트)
def del_img(request):
    instance = OCR.objects.filter(owner=request.session['id'])
    # instance는 query set 객체들
    for obj in instance:
        obj.delete_file()
        obj.delete()
    return HttpResponse("")


# change model insert
def upload_change(request):
    # 결과값 받아서 dict 형태로 저장
    v = json.loads(request.POST['dict'])
    # 빈 문자열 제거 및 리스트[{(key, value), (~~, ~~), ...}]로 변환
    v = dict((i, j) for i, j in v.items() if j)
    # insert ( **kwargs에 직접 dict형으로 주기위해서 **붙임)
    v['email'] = User.objects.get(pk=request.session['id'])
    instance = Change.objects.create(**v)
    return HttpResponse(json.dumps({"id": instance.id, "score": instance.score}))


# json파일에 들어갈 dict양식
def create_login_dict(email, pw, randomStr):
    data = {
        "email": email,
        "pw": pw,
        "date": str(datetime.now())
    }
    return data


# 회원가입시  회원가입할 id,pw,시간을 랜덤문자열을 키로 가지는 json설정
def signup_create(randomStr, dictStr):
    # json을 읽어서 1시간 넘은건 삭제
    with open(BASE_DIR+'/signup.json', 'r') as f:
        jf = json.load(f)

    now = datetime.now()
    for key in list(jf.keys()):
        json_date = datetime.strptime(jf[key]['date'], '%Y-%m-%d %H:%M:%S.%f')
        if((now-json_date).days >= 1 or (now-json_date).seconds/3600 >= 1):
            del(jf[key])
        else:
            break
    jf[randomStr] = dictStr
    with open(BASE_DIR+'/signup.json', 'w') as f:
        json.dump(jf, f)


# 병영 식단 공공데이터 가져와서 이번달이 없으면 이번달로 파일 저장
# 최대범위 https://openapi.mnd.go.kr/3732313630343634313931343732303835/json/DS_TB_MNDT_DATEBYMLSVC_8623/1/100000/
# 데이터는 날짜시작한인덱스부터 sum_cal이 있는 인덱스까지(없을수도)가 하루의 데이터, 각 인덱스에는 KEY값이 모두 동일(값이 없으면 ''로 처리)
# 부대명 없이하면 3군단의 부대별로 나오는데 해석하기 힘들어서 나중에
# ['부대코드에 해당하는 거']['row'][index] = {'dinr_cal': '363', 'lunc': '닭고기부추밥 (1)(5)(6)(15)', 'sum_cal': '', 'adspcfd': '우유(백색우유(200ML,연간)) (2)', 'adspcfd_cal': '122', 'dates': '20200702', 'lunc_cal': '661.36', 'brst': '밥', 'dinr': '밥', 'brst_cal': '363'}

def publicData_hostName(name, start=1, end=100000):
    return ARMYDATA_HOST+name+'/'+str(start)+'/'+str(end)+'/'


# 이번달 부대 메뉴가 없다면 False 있다면 True
def foodMenu_isExists():
    # 파일 자체가 없다면
    if(not os.path.isfile(BASE_DIR+'/media/armyFoodMenu.json')):
        return False

    # 파일 데이터 불러오기 및 date 확인
    with open(BASE_DIR+'/media/armyFoodMenu.json', 'r') as f:
        file = json.load(f)
        # 일주일이상 업데이트 안했다면 false로 업데이트하게끔
        return int(datetime.today().strftime("%Y%m%d")) - int(file['date']) < 7


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
            if(insert_data):
                result[armyName] = insert_data

    result['date'] = datetime.today().strftime("%Y%m%d")

    # 한글을 저장하기 위함
    with open(BASE_DIR+'/media/armyFoodMenu.json', 'w', encoding='UTF-8') as f:
        json.dump(result, f, ensure_ascii=False)
    print('이번달', today, '식단 저장 완료, 위치 :', BASE_DIR+'/media/armyFoodMenu.json')


def foodMenu_Process_save():
    if(foodMenu_isExists()): # 이미 식단이 있다면 종료
        return
    foodMenu_thread = threading.Thread(target=publicData_FoodMenu_Save) # 파일작업 하나의 쓰레드로 하기위해서
    foodMenu_thread.setDaemon(True)
    foodMenu_thread.start()


def error_body(case, p2="", h2="", p1=""):
    body = {}
    # 일반적인 에러페이지
    if case == 1:
        body['h2'] = '페이지에 문제가 발생했습니다.'
        body['p1'] = '메인 홈페이지를 이용해주세요.'
    # 회원가입 신청후 메일발송한뒤의 body
    elif case == 2:
        body['h2'] = '이메일을 통해 회원가입을 완료해주세요.'
        body['p1'] = '보내드린 주소'
        body['p2'] = p2
    # 회원가입 링크 두번 클릭
    elif case == 3:
        body['h2'] = '이미 가입된 회원입니다.'
    # 잘못된 접속 방식
    elif case == 4:
        body['h2'] = '잘못된 접속 방식입니다.'
        body['p1'] = '메인 홈페이지를 이용해주세요.'
    # 만료된 링크
    elif case == 5:
        body['h2'] = '만료된 링크입니다.'
        body['p1'] = '메인 홈페이지를 이용해주세요.'
    else:
        body['h2'] = h2
        body['p1'] = p1
        body['p2'] = p2
    return body
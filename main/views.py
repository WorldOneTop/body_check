from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.core.mail import EmailMessage
from .models import User, OCR, Change
import random
import string
import json
import bcrypt
import datetime
import os
from django.contrib.auth import logout as auth_logout
from . import vision
from django.contrib.sessions.models import Session
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def index(request):
    request.session.clear_expired()# 유효하지 않은 세션을 모델에서 지움
    return render(request, 'main/index.html')


def generic(request):
    return render(request, 'main/generic.html')


def elements(request):
    return render(request, 'main/elements.html')


def test(request):
    return render(request, 'main/test.html')


def intro(request):
    return render(request, 'main/intro.html')


def mypage(request):
    try:
        request.session['id']
    except(KeyError):
        return render(request, 'main/error.html', error_body(4))
    return render(request, 'main/mypage.html')


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

    email = jf[request.GET['key']]['email']
    pw = jf[request.GET['key']]['pw']

# 확인된 json 데이터 지우기
    del(jf[request.GET['key']])
    with open(BASE_DIR+'/signup.json', 'w') as f:
        json.dump(jf, f)

    # json파일에 저장된걸 바탕으로 user row 생성
    try:
        user = User.objects.get(pk=email)
    except(KeyError):
        return render(request, 'main/error.html', error_body(1))
# 없는게 당연해서 실행되야할 공간
    except(User.DoesNotExist):
        user = User()
        user.email = email
        user.pw = pw
        user.save()

    # 링크를 또 클릭하던가 해서 이미 회원가입이 된 상황
    else:
        return render(request, 'main/error.html', error_body(3))

    return HttpResponseRedirect(reverse('index'))


# 로그인 버튼 클릭했을때 (id없으면 회원가입이메일보내고 진행)
def login(request):
    try:
        user = User.objects.get(pk=request.POST['id'])
    except(KeyError):
        print("login_Keyerror")
        return render(request, 'main/error.html', error_body(1))
    # 등록된id가 없을때
    except(User.DoesNotExist):
        # 랜덤문자열 json에 넣기
        randomStr = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(10))
        pw = bcrypt.hashpw(request.POST['pw'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        signup_create(randomStr, create_login_dict(request.POST['id'], pw, randomStr))
        EmailMessage('[체단실] 회원가입 인증을 진행해 주시기 바랍니다.',
                     '아래의 링크로 접속하여 인증을 진행해 주시기 바랍니다.  1시간이 지나게될 경우 링크의 유효성은 없어지게됩니다.\n http://' +
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


def logout(request):
    auth_logout(request)
    return HttpResponseRedirect(reverse('index'))


def upload_img(request):
    result = {}
    file = OCR() # 오브젝트 생성
    try:
        file.photo = request.FILES['photo']
        file.owner = request.session['id']
        file.save()
    except(KeyError):
        print("upload_img : KeyError")
        return render(request, 'main/error.html', error_body(1))

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
    Change.objects.create(**v)
    return HttpResponse("")


# json파일에 들어갈 dict양식
def create_login_dict(email, pw, randomStr):
    data = {
        "email": email,
        "pw": pw,
        "date": str(datetime.datetime.now())
    }
    return data


# 회원가입시 json을 읽어서 1시간 넘은건 삭제하고 회원가입할 id,pw,시간을 랜덤문자열을 키로 가지는 json설정
def signup_create(randomStr, dictStr):
    with open(BASE_DIR+'/signup.json', 'r') as f:
        jf = json.load(f)

    now = datetime.datetime.now()
    for key in list(jf.keys()):
        json_date = datetime.datetime.strptime(jf[key]['date'], '%Y-%m-%d %H:%M:%S.%f')
        if((now-json_date).days >= 1 or (now-json_date).seconds/3600 >= 1):
            del(jf[key])
        else:
            break
    jf[randomStr] = dictStr
    with open(BASE_DIR+'/signup.json', 'w') as f:
        json.dump(jf, f)


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
    else:
        body['h2'] = h2
        body['p1'] = p1
        body['p2'] = p2
    return body
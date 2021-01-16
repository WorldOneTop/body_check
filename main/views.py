from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from django.shortcuts import get_object_or_404
from django.core.mail import EmailMessage
from .models import User
import random
import string
import json
import bcrypt
import datetime
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def index(request):
    return render(request, 'main/index.html')


def generic(request):
    return render(request, 'main/generic.html')


def elements(request):
    return render(request, 'main/elements.html')


def signup(request):
    return render(request, 'main/test.html')


@csrf_exempt
def test(request):
    # email.send()
    return render(request, 'main/test.html')



def login(request):
    try:
        user = User.objects.get(pk=request.POST['email'])
    except(KeyError):
        return HttpResponse("페이지에 문제가 발생했습니다. 나중에 시도해주세요.")
    except(User.DoesNotExist):
        # 랜덤문자열 json에 넣기
        randomStr = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(10))
        pw = bcrypt.hashpw(request.POST['pw'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        signup_create(randomStr, create_login_dic(request.POST['email'], pw, randomStr))
        EmailMessage('[체단실] 회원가입 인증을 진행해 주시기 바랍니다.',
                     '아래의 링크로 접속하여 인증을 진행해 주시기 바랍니다.\n http://' +
                     str(request.get_host())+'/signup?key='+randomStr
                     , to=[request.POST['email']]).send();
        return HttpResponseRedirect(reverse('index'))
    
    else: 
        pass
    return HttpResponseRedirect(reverse('index'))


def create_login_dic(email, pw, randomStr):
    data = {}
    data[randomStr] = {
        "email": email,
        "pw": pw,
        "date": str(datetime.datetime.now())
    }
    return data


def signup_create(randomStr, dictStr):
    with open(BASE_DIR+'/signup.json', 'r') as f:
        jf = json.load(f)

    now = datetime.datetime.now()

    for key in jf.keys():
        json_date = datetime.datetime.strptime(jf[key]['date'], '%Y-%m-%d %H:%M:%S.%f')
        if((now-json_date).days > 1 or (now-json_date).seconds/3600 > 1):
            del(jf[key])
            break

    jf[randomStr] = dictStr

    with open(BASE_DIR+'/signup.json', 'w') as f:
        json.dump(jf, f)


def file_delete():
    pass
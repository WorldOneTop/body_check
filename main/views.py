from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from django.shortcuts import get_object_or_404

from .models import User


def index(request):
    return render(request, 'main/index.html')


def generic(request):
    return render(request, 'main/generic.html')


def elements(request):
    return render(request, 'main/elements.html')


@csrf_exempt
def test(request, val):
    return render(request, 'main/test.html', {'val': val} )


def login(request):
    print('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    print(request.POST)
    print(request.POST['input_email'])
    # arg = get_object_or_404(User, pk=request.POST['input_email'])
    return HttpResponseRedirect(reverse('test', args=(request.POST.get('email', ''), )))
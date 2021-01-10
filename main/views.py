from django.shortcuts import render


def index(request):
    return render(request, 'main/index.html')


def generic(request):
    return render(request, 'main/generic.html')


def elements(request):
    return render(request, 'main/elements.html')


def test(request):
    return render(request, 'main/test.html')


def dialog(request):
    return render(request, 'main/dialog.html')



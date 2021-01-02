from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return HttpResponse("hellow world  one top")


# Create your views here.

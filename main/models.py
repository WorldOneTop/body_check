from django.db import models
from django.conf import settings
import os


# User의 기본 값 이름, 비번,(필수)     신장, 나이, 성별, 닉네임
class User(models.Model):
    email = models.CharField(max_length=50, primary_key=True)
    pw = models.CharField(max_length=60)
    height = models.FloatField(null=True)
    age = models.IntegerField(null=True)
    sex = models.BooleanField(null=True)
    aka = models.CharField(max_length=50, null=True)


# 이미지 저장용 DB
class OCR(models.Model):
    photo = models.ImageField(upload_to="ocr/")
    owner = models.CharField(max_length=50)

    def delete_file(self):
        try:
            os.remove(settings.MEDIA_ROOT+"/"+str(self.photo))
            os.remove(settings.MEDIA_ROOT+"/ocr/result/"+str(self.photo)[4:])
        except FileNotFoundError:
            pass


# 이용자의 변화 저장 DB
# 체중, 골격근량, 체지방률, 체수분, 단백질, 무기질, 검사일시, 인바디 점수, 해당되는 사용자
class Change(models.Model):
    weight = models.FloatField(null=True)
    muscle = models.FloatField(null=True)
    fat = models.FloatField(null=True)
    water = models.FloatField(null=True)
    protein = models.FloatField(null=True)
    mineral = models.FloatField(null=True)
    date = models.DateField(auto_now=False, auto_now_add=False, null=True)
    score = models.IntegerField(null=True)
    email = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
    )

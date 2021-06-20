from django.db import models
from django.conf import settings
import os


# 이용자의 id 비번 신장 나이 성별(0이 남자) 닉네임 대표사진, 목표(1:벌크업,2:커팅,3:다이어트) 부대(부대번호)
# 분할 수, 부위(등어깨가슴하체 순), 운동방식(1:보디빌딩 /*, 2:피지크 */,3:파워리프팅,4:크로스핏,5:맨몸운동), 운동가능일수(주단위), 기초대사량
class User(models.Model):
    email = models.CharField(max_length=50, primary_key=True)
    pw = models.CharField(max_length=60)
    height = models.FloatField(null=True)
    age = models.IntegerField(null=True)
    sex = models.BooleanField(null=True)
    aka = models.CharField(max_length=50, null=True)
    picture = models.ImageField(upload_to="profile_picture/", null=True)
    target = models.CharField(max_length=1, default=0)
    army = models.SmallIntegerField(default=0)
    num = models.SmallIntegerField(default=-1)
    part = models.SmallIntegerField(default=0)
    way = models.SmallIntegerField(default=0)
    pDay = models.SmallIntegerField(default=0)
    metabolism = models.IntegerField(default=0)
    
    # 이메일은 유저찾을때 필요하기때문에 이미알고있고, pw는 보안상 키,나이,성,닉넴은 회원가입시 생성이라 무조건 있는정보
    def getInfo(self):
        result = {'height': self.height, 'age': self.age, 'sex': int(self.sex), 'aka': self.aka,'num':self.num, 'part':self.part, 'way':self.way, 'pDay': self.pDay}
        if self.picture:
            result['picture'] = self.picture.url
        result['target'] = self.target
        result['army'] = self.army
        return result

    def getWorkout(self):
        return {'target': self.target, 'army': self.army, 'num': self.num, 'part': self.part, 'way': self.way, 'pDay': self.pDay, 'metabolism':self.metabolism}

    def save(self, *args, **kwargs):
        origin = User.objects.get(pk=self.email)
        if(origin.picture != self.picture):
            # 원래 이미지 지우기
            if os.path.isfile(origin.picture.path):
                os.remove(origin.picture.path)
        super(User, self).save(*args, **kwargs)
    

    def cal_metabolism(sex, height, weight, age):
        if(not sex):
            return int(66 + 13.8 * weight + 5 * height - 6.8 * age)
        else:
            return int(655 + 9.6 * weight + 1.8 * height - 4.7 * age)
    

    def lately_weight(email):
        change = Change.objects.filter(email=email).order_by('date',"id")
        for i in reversed(range(len(change))):
            if(change[i].weight):
                return change[i].weight
        return False
                
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
    weight = models.FloatField(default=0)
    muscle = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    water = models.FloatField(default=0)
    protein = models.FloatField(default=0)
    mineral = models.FloatField(default=0)
    date = models.DateField(auto_now=False, auto_now_add=False)
    score = models.IntegerField(default=0)
    email = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
    )

    def save(self, *args, **kwargs):
        weight = User.lately_weight(self.email.email)
        user = User.objects.get(pk=self.email.email)
        if (not weight and self.weight) or (self.weight and weight != self.weight):
            user.metabolism = User.cal_metabolism(user.sex, user.height, float(self.weight), user.age)
            user.save()
            
        # 점수 계산
        if(self.fat and self.muscle and self.weight):
            if(user.sex == 0):
                avg_muscle = float(self.weight) * 0.4 
                avg_fat = 15
                
            else:
                avg_muscle = float(self.weight) * 0.35 
                avg_fat = 27
            self.score = int(70 +(float(self.muscle)-avg_muscle)*4 + (avg_fat - float(self.fat))*2)

        super(Change, self).save(*args, **kwargs)
        return self

# 이용자의 바디프로필 정보 저장
# 체중 골격근량 체지방률, 배-허벅지-팔-어깨-가슴 둘레 사진 유저아이디
class Picture(models.Model):
    weight = models.FloatField(default=0)
    muscle = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    belly = models.FloatField(default=0)
    thigh = models.FloatField(default=0)
    arm = models.FloatField(default=0)
    shoulder = models.FloatField(default=0)
    chest = models.FloatField(default=0)
    date = models.DateField(auto_now=False, auto_now_add=False)
    picture = models.ImageField(upload_to="body_profile/", null=True)
    email = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='+',
    )

    def delete(self,*args,**kwargs):
        if os.path.isfile(self.picture.path):
            os.remove(self.picture.path)

        super(Picture, self).delete(*args, **kwargs)


# 자유게시판 및 버그 건의 게시판
# 아이디,  제목,내용,작성일시,사진,자유게시판인지 건의게시판인지, 수정이 됐는지, 비밀글인지
class Board(models.Model):
    title = models.CharField(max_length=100, null=False)
    content = models.TextField()
    date = models.DateTimeField(auto_now=False, auto_now_add=True)
    picture = models.ImageField(upload_to="board_content/", null=True)
    isBug = models.BooleanField()
    isRevise = models.BooleanField(default=False)
    isSecret = models.BooleanField(default=False)
    email = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
    )

    # 업데이트
    def custom_update(self, obj):
        if('picture_isDel' in obj):
            #  이미지 파일이 있는데   취소하면 지우기
            if(self.picture and obj['picture_isDel'] == "이미지 업로드"):
                if(os.path.exists(self.picture.path)):
                    os.remove(self.picture.path)
                self.picture = None
        else:
            if(self.picture and os.path.exists(self.picture.path)):
                os.remove(self.picture.path)
            self.picture = obj['picture']

        self.title = obj['title']
        self.content = obj['content']
        self.isRevise = True
        if('isSecret' in obj):
            self.isSecret = obj['isSecret']
        self.save()
        return self


def lately_weight(email):
    change = Change.objects.filter(email=email).order_by('date',"id")
    for i in reversed(range(len(change))):
        if(change[i].weight):
            return change[i].weight
    return False

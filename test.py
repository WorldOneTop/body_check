import json
import cv2
import requests
import os
import numpy as np
from PIL import ImageFont, ImageDraw, Image
import time
from main import vision
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# # print(BASE_DIR+"/test.txt")

file_name = "testimg10"
file_path = "media/ocr/"

with open("similar_str.json", 'r') as f:
    similar = json.loads(f.read())


def get_result(value, json, width, img_path):
    # value 라는 글자 찾기
    data = False
    for f in json['result']:
        if (f['boxes'][0][0] < width/2):          # 원하는 글자가 최소 왼쪽 반에 속해있다고 가정
            if (value in f['recognition_words'][0]): # 원하는 글자가 json 값에 포함되어있는지
                data = f
    if(not data):                                # 원하는 값이 정확한 글자가 아닐때
        for f in json['result']:
            if (f['boxes'][0][0] < width/2):
                try:
                    for s in similar[value]:             # 비슷한 문자와 비교
                        if (s in f['recognition_words'][0]):
                            data = f
                except(KeyError):
                    pass

    # value 글자 원래대로만들기
    try:
        value = similar[value][0]
    except(KeyError):
        pass

    if(not data):
        print('"'+value+'"(이)라는 글자를 찾지못함.')
        return None

    y = data['boxes'][1][1]
    x = data['boxes'][1][0]
    data_list = []

    # 해당 글자의 측정값을 추측되는 위치(x+, 비슷한y)로 1차 필터링
    for j in json['result']:
        # 글자의 위치조건이 맞았을경우
        if(j['boxes'][1][1] in range(y-15, y+25)) and (j['boxes'][0][0] > x):
            numbers = re.findall("\d*\.?\d+", j['recognition_words'][0]) # 문자열 속 숫자 추출
            for i in numbers:
                if(1 <= float(i) < 160): #3~150사이의 값(체중, 골격근량, 체지방률)
                    data_list.append([float(i), j])
    
    if(not data_list):
        print('"'+value+'"의 추정되는 측정 값을 찾지못함.')
        return None
    
    # 만약 추정 값이 2개이상이라면
    if(1 < len(data_list)):
        # 왼쪽의 막대기 있는지 판별로 추정
        index = None
        for i in range(len(data_list)):
            if (isResult(img_path, data_list[i][1]['boxes'][0], data_list[i][1]['boxes'][3])):
                index = i
                break
        # x의 위치가 가까운 값으로  정하기
        if(not index):
            cache = []
            for x in np.array(data_list)[:, 1:]:
                cache.append(list(x)[0]['boxes'][0][0])
            index = np.abs(np.array(cache)-data['boxes'][0][0]).argmin()

        result = data_list[index][0]
        result_box = []
        result_box.append(data_list[index][1])
        result_box.append(data)
    else:
        result = data_list[0][0]
        result_box = []
        result_box.append(data_list[0][1])
        result_box.append(data)

    # 소수점 인식 못했을때
    if(value == '체지방률'):
        if(result > 45):
            result = float(str(result[0]) + '.' + str(result[1]))

    # 결과 전송 하기 전 인식한 글자에 따른 rgb 색상
    if (value == '체중'):
        rgb = [255, 0, 0]
    elif (value == '골격근량'):
        rgb = [0, 255, 0]
    elif (value == '체지방률'):
        rgb = [0, 0, 255]
    else:
        rgb = [255, 255, 255]
    
    # vision.saveImageResult(file_path, file_name+".jpg", result_box, rgb)
    return [result_box, rgb, (value, result)]


def getImageResult(text, json, width, img_path):
    if(type(text) == list):
        send = []
        result = []
        for value in text:
            cache = get_result(value, json, width, img_path)
            if(cache):
                send.append(cache)
                result.append(cache[2])
            else:
                result.append(None)
        vision.saveImageResult(file_path, file_name+".jpg", send)
        return result
    else:
        cache = get_result(text, json, width, img_path)
        if(cache):
            vision.saveImageResult(file_path, file_name+".jpg", cache)
            return cache[2]
        else:
            return None


def isResult(path, x_y1, x_y2):
    # x_y1은 왼쪽위 점[x,y], x_y2는 왼쪾 아래 점[x,y]
    x = x_y1[0]
    y = int((x_y1[1]+x_y2[1])/2)
    img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)

    # 해당 좌표부터 왼쪽 긴막대가 검은색이라면 측정값의 바 라고 추정
    img = img[y-2:y+2, x-50:x]
    img = cv2.threshold(img, 165, 255, cv2.THRESH_BINARY)[1]
    # # 평균색상이 검은색상에 가깝다면 true 반환
    return cv2.mean(img)[0] < 127



start = time.time()

# # json = vision.saveText(file_path, file_name+".jpg")

with open(file_path +"result/"+ file_name+".txt", 'r') as f:
    json = json.loads(f.read())

width = cv2.imread(file_path+file_name+".jpg").shape[1]
# vision.saveImage(file_path, file_name+".jpg", json)

getImageResult(['체중', '근량', '방률'], json, width, file_path+file_name+".jpg")

print("total time :", time.time() - start)
# img = cv2.imread("asdf.png")
# print(cv2.mean(img)[0])

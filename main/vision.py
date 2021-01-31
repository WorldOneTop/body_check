import json
import cv2
import requests
import os
from PIL import ImageFont, ImageDraw, Image
import numpy as np
import re

LIMIT_SIZE = 1024*1024 # 1024 = 1kb, 1024kb = 1mb  즉 1메가바이트 표현
LIMIT_PX = 1024
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# kakao vision을 쓰기위해 이미지 파일 크기 설정
def ocr_resize(image_path: str):
    img = Image.open(image_path)
    width, height = img.size
    if width > LIMIT_PX or height > LIMIT_PX:
        img.thumbnail((LIMIT_PX,LIMIT_PX), Image.LANCZOS)
        img.save(image_path)
    
    size = os.path.getsize(image_path)
    while size > LIMIT_SIZE: # 파일 크기가 1mb가 넘을경우
        image = cv2.imread(image_path)
        cv2.imwrite(image_path, cv2.resize(image, None, fx=0.95, fy=0.95, interpolation = cv2.INTER_AREA))
        size = os.path.getsize(image_path)
    
# kakao vision을 통해서 이미지 결과값을 json 형태로 받아옴
def ocr(image_path: str):
    with open(BASE_DIR+"/secrets.json") as f:
        secrets = json.loads(f.read())

    appkey = secrets['REST_API']
    API_URL = 'https://dapi.kakao.com/v2/vision/text/ocr'
    headers = {'Authorization': 'KakaoAK {}'.format(appkey)}

    ocr_resize(image_path)

    image = cv2.imread(image_path)
    jpeg_image = cv2.imencode(".jpg", image)[1]
    data = jpeg_image.tobytes()

    return requests.post(API_URL, headers=headers, files={"image": data})

# 받아온 json 구조 : 전체는 'result'라는 키 하나와 값, 그 속엔 list,
# 그 list속엔 boxes, recognition_words라는 키와 좌표값, 해석글자 라는 값
# boxes와 words는 각각 리스트형태로 들어가있음
# 구조 : {"result" : [ {"bodxes":"[좌표값]", "recognition_words":"[글자]" }, {...} ] }
# wores는 byte형태로 나오지만 print시 정상작동, 필요시 decode(), output은 응답코드 그대로 나옴


# 인식한 박스 및 텍스트를 그려주고 저장하는 함수
def saveImage(path, name, json_dict):
    # 인식한 box 그리기
    img = cv2.imread(path+name)

    for j in json_dict['result']:
        pts = np.array([j['boxes'][0], j['boxes'][1], j['boxes'][2], j['boxes'][3]], dtype=np.int32)
        cv2.polylines(img, [pts], True, (0, 255, 0))

    cv2.imwrite(path+"result/save_"+name, img)

    # 인식한 글자 넣기
    img = Image.open(path+"result/save_"+name)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(BASE_DIR + "/main/static/main/fonts/korean_font.ttf", 15) 
    
    for j in json_dict['result']:
        text = j['recognition_words'][0].encode().decode()
        draw.text(tuple(j['boxes'][3]), text, font=font, fill=(255, 0, 0))

    img.save(path+"result/save_"+name)
    return path+"result/save_"+name


# ocr의 결과인 json을 파일로 저장하는 함수
def saveText(path, name):
    output = ocr(path+name).json()
    index = name.find(".")
    name = name[:index]
    with open(path+"result/"+name+".txt", 'w') as f:
        f.write(json.dumps(output, sort_keys=True, indent=2))
    # return path+"result/"+name+".txt"
    return output

# 결과이미지인 원하는값, 추정값을 표시해줌
def saveImageResult(path, name, box_and_rgb):
    # box_and_rgb = [ [ [box_dict,word_dict], rgb], [ [box_dict,word_dict], rgb], ... ]
    if(not box_and_rgb):
        print("error : not box_and_rgb()")
        return None
    
    img = cv2.imread(path+name)
    for i in range(len(box_and_rgb)):    # 총 몇개의 세트를 써야하는지
        for box in box_and_rgb[i][0]:     # 한 세트에는 [박스값 두개],컬러값 있음
            pts = np.array([box['boxes'][0], box['boxes'][1],
                            box['boxes'][2], box['boxes'][3]],
                           dtype=np.int32)
            cv2.polylines(img, [pts], True, box_and_rgb[i][1])

    cv2.imwrite(path+"result/"+name, img)

    # 글자의 rgb값은 반대라서 바꿔줌
    for rgb in box_and_rgb:
        rgb[1].reverse() 
    
    # 인식한 글자 넣기
    img = Image.open(path+"result/"+name)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(BASE_DIR + "/main/static/main/fonts/korean_font.ttf", 15) 
    
    for i in range(len(box_and_rgb)):
        for value in box_and_rgb[i][0]:
            text = value['recognition_words'][0].encode().decode()
            draw.text(tuple(value['boxes'][3]), text, font=font, fill=tuple(box_and_rgb[i][1]))

    img.save(path+"result/"+name)
    return path+"result/"+name

# json을 분석해서 추정되는 측정값 찾아서 반환
def get_result(value, json_dict, width, img_path):
    with open(BASE_DIR+"/similar_str.json", 'r') as f:
        similar = json.loads(f.read())
    # value 라는 글자 찾기
    data = False
    try:
        search_value = similar[value][0]
    except(KeyError):
        search_value = value
    
    for f in json_dict['result']:
        if (f['boxes'][0][0] < width/2):          # 원하는 글자가 최소 왼쪽 반에 속해있다고 가정
            if (search_value in f['recognition_words'][0]): # 원하는 글자가 json 값에 포함되어있는지
                data = f
    try: # 정확한 글자가 안나왔을때
        if(not data):                                # 원하는 값이 정확한 글자가 아닐때
            for f in json_dict['result']:
                if (f['boxes'][0][0] < width/2):
                    for s in similar[value][1:]:             # 비슷한 문자와 비교
                        if (s in f['recognition_words'][0]):
                            data = f
    except(KeyError): #찾으려는단어가 다른거일때
        pass
    
    if(not data):
        print('"'+value+'"(이)라는 글자를 찾지못함.')
        return None

    y = data['boxes'][1][1]
    x = data['boxes'][1][0]
    data_list = []

    # 해당 글자의 측정값을 추측되는 위치(x+, 비슷한y)로 1차 필터링
    for j in json_dict['result']:
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
        # 막대 판별 실패 시 x의 위치가 가까운 값으로  정하기
        if(not index):
            cache = []
            for x in np.array(data_list)[:, 1:]:
                cache.append(list(x)[0]['boxes'][0][0])
            index = np.abs(np.array(cache)-data['boxes'][0][0]).argmin()
    else:
        index = 0
        
    result = data_list[index][0]
    result_box = []
    result_box.append(data_list[index][1])
    result_box.append(data)

    # 소수점 인식 못했을때
    if(value == '체지방률'):
        if(result > 45):
            result = result*0.1 

    # 결과 전송 하기 전 인식한 글자에 따른 rgb 색상
    if (value == '체중'):
        rgb = [255, 0, 0]
    elif (value == '골격근량'):
        rgb = [0, 255, 0]
    elif (value == '체지방률'):
        rgb = [0, 0, 255]
    else:
        rgb = [255, 255, 255]

    return [result_box, rgb,  result]

# 왼쪽에 막대기 있는지 판별 있으면 true 반환
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

# 결과(키,추정값)와 이미지 저장
# return : "{"원한값":"측정값"}"
def getImageResult(json_dict, path, name, text=['체중', '골격근량', '체지방률']):
    width = cv2.imread(path+name).shape[1]
    if(type(text) == list):
        send = []
        result = {}
        for value in text:
            cache = get_result(value, json_dict, width, path+name)
            if(cache):
                send.append(cache)
                result[value] = cache[2]
            else:
                result[value] = None
        saveImageResult(path, name, send)
        return result
    else:
        cache = get_result(text, json_dict, width, path+name)
        if(cache):
            saveImageResult(path, name, cache)
            return {text:cache[2]}
        else:
            return {text:None}

# 사용자가 결과지를 올렸을때 실행 해서 모든 결과 보여주기
# def showResult(img_path, img_name, text=['체중', '골격근량', '체지방률']):
#     output = ocr(img_path+img_name).json() # 결과 값 받아서 json dict으로 대입
#     return getImageResult(text, output, img_path, img_name)
    
# 체중, 골격근량, 체지방률, 검사일시의 측정 값을 찾는 함수
# def find_value(find, json):
    
#     return 0

# file_name = "testimg7.jpg"
# file_path = "media/ocr/"
# with open(file_path +"result/"+ "testimg10"+".txt", 'r') as f:
#     json_file = json.loads(f.read())
    
# print("result : ",getImageResult(['체중', '골격근량', '체지방률'], json_file, file_path, file_name))

# output = ocr(path).json()

# saveText(BASE_DIR+"/media/ocr/", "다운로드.jpg")

# with open(BASE_DIR+'/media/ocr/result/다운로드.txt', 'r') as f:
#     js = json.loads(f.read())
# saveImage(BASE_DIR+'/media/ocr/', "다운로드.jpg", js)

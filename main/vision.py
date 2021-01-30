import json
import cv2
import requests
import os
from PIL import ImageFont, ImageDraw, Image
import numpy as np

LIMIT_SIZE = 1024*1024 # 1024 = 1kb, 1024kb = 1mb  즉 1메가바이트 표현
LIMIT_PX = 1024
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


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
def saveImage(path, name, json):
    # 인식한 box 그리기
    img = cv2.imread(path+name)

    for j in json['result']:
        pts = np.array([j['boxes'][0], j['boxes'][1], j['boxes'][2], j['boxes'][3]], dtype=np.int32)
        cv2.polylines(img, [pts], True, (0, 255, 0))

    cv2.imwrite(path+"result/save_"+name, img)

    # 인식한 글자 넣기
    img = Image.open(path+"result/save_"+name)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(BASE_DIR + "/main/static/main/fonts/korean_font.ttf", 15) 
    
    for j in json['result']:
        text = j['recognition_words'][0].encode().decode()
        draw.text(tuple(j['boxes'][3]), text, font=font, fill=(255, 0, 0))

    img.save(path+"result/save_"+name)
    return path+"result/save_"+name


# json파일로 저장하는 함수
def saveText(path, name):
    output = ocr(path+name).json()
    index = name.find(".")
    name = name[:index]
    with open(path+"result/"+name+".txt", 'w') as f:
        f.write(json.dumps(output, sort_keys=True, indent=2))
    # return path+"result/"+name+".txt"
    return output


def saveImageResult(path, name, box_and_rgb):
    # box_and_rgb = [ [ [box_dict,word_dict], rgb], [ [box_dict,word_dict], rgb], ... ]
    if(not box_and_rgb):
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
    
# 체중, 골격근량, 체지방률, 검사일시의 측정 값을 찾는 함수
# def find_value(find, json):
    
#     return 0

# output = ocr(path).json()

# saveText(BASE_DIR+"/media/ocr/", "다운로드.jpg")

# with open(BASE_DIR+'/media/ocr/result/다운로드.txt', 'r') as f:
#     js = json.loads(f.read())
# saveImage(BASE_DIR+'/media/ocr/', "다운로드.jpg", js)

from doctr.models import ocr_predictor
from doctr.io import DocumentFile
# import json
import math
import PIL
import os
from PIL import ImageDraw
import matplotlib.pyplot as plt
from core.utils import generate_random_file_name


def convert_coordinates(geometry, page_dim):
    len_x = page_dim[1]
    len_y = page_dim[0]
    (x_min, y_min) = geometry[0]
    (x_max, y_max) = geometry[1]
    x_min = math.floor(x_min * len_x)
    x_max = math.ceil(x_max * len_x)
    y_min = math.floor(y_min * len_y)
    y_max = math.ceil(y_max * len_y)
    return [x_min, x_max, y_min, y_max]


def get_coordinates(output):
    page_dim = output['pages'][0]["dimensions"]
    text_coordinates = []
    for obj1 in output['pages'][0]["blocks"]:
        for obj2 in obj1["lines"]:
            for obj3 in obj2["words"]:                
                converted_coordinates = convert_coordinates(
                                           obj3["geometry"],page_dim
                                          )
                print("{}: {}".format(converted_coordinates,
                                      obj3["value"]
                                      )
                     )
                text_coordinates.append(converted_coordinates)
    return text_coordinates

def draw_bounds(image, bound):
    draw = ImageDraw.Draw(image)
    for b in bound:
        p0, p1, p2, p3 = [b[0],b[2]], [b[1],b[2]], \
                         [b[1],b[3]], [b[0],b[3]]
        draw.line([*p0,*p1,*p2,*p3,*p0], fill='blue', width=2)
    return image

model = ocr_predictor(pretrained=True)


def get_text(dictionary:dict)->str: 
  dictionary = dictionary.export()
  text = []
  for d in dictionary['pages']:
    for c in d['blocks']:
      #print(c['lines'])
      for b in c['lines']:
        #print(b['words'])
        sentence = ""
        for a in b['words']:
          #print(a)
          sentence = sentence + " " + a['value']
        # if sentence[-1]!=".":
        #   text.append(sentence.strip()+".")
        # else:
        text.append(sentence.strip())

  return ' '.join(text)

def generate_ocr(file_name: str, img_path: str):
    single_img_doc = DocumentFile.from_images(img_path)
    result = model(single_img_doc)
    result_dict = result.export()
    
    data = get_text(result)
    graphical_coordinates = get_coordinates(result_dict)
    image = PIL.Image.open(img_path)
    result_image = draw_bounds(image, graphical_coordinates)
    # plt.figure(figsize=(15,15))
    # plt.imshow(result_image)
    
    rand_file_name = generate_random_file_name(file_name=file_name)
    file_path = os.path.join(os.getcwd(), "files", rand_file_name)
    
    result_image.save(file_path)
    return data, file_path
    
    
from datetime import datetime
AGE_CLASS = ["не более 5 лет", "не более 10 лет", "от 10 до 30 лет", "от 30 и более лет"]
ASSESSMENT = [
  "отличная",
  "хорошая",
  "удовлетворительная",
  "неудовлетворительная",
  "аварийное",
]

DAMAGE = [
  "1 дупло",
  "2 дупла",
  "более 2 дупел",
  "морозобоина",
  "несколько морозобоин",
  "сухобочина",
  "трещина",
  "механическое повреждение ствола",
  "отслойка коры",
  "в стволе инородные предметы",
  "усохшие скелетные ветви",
  "наличие капа или сувеля",
  "наличие плодовых тел",
  "ствол наклонен",
  "ствол искривлен",
  "вершина ствола сломана на высоте",
  "развилка ствола на высоте",
  "повреждение корней",
  "обнажение корневых лап",
  "обтаптывание корней",
  "повреждения при прокладке инженерных сетей",
  "повреждение кроны",
  "изменен цвет листвы/хвои",
  "измельчение листьев/хвои",
  "повреждение вредителями",
  "повреждение болезнями",
  "механические повреждения кроны",
]

SANITARY = [
  "здоровые (без признаков ослабления)",
  "ослабленные",
  "сильно ослабленные",
  "усыхающие",
  "погибшие",
  "свежий сухостой",
  "свежий ветровал",
  "свежий бурелом",
  "старый сухостой",
  "старый ветровал",
  "старый бурелом",
]

RECOMMENDATION = [
  "рубка с последующей корчевкой прикорневого кома",
  "рубка с дроблением пил",
  "обрезка санитарная кроны до 5 сухих сучьев",
  "обрезка санитарная кроны от 6 до 15 сухих сучьев",
  "обрезка санитарная кроны более 15 сухих сучьев",
  "обрезка вершины",
  "обрезка формовочная кроны слабая",
  "обрезка формовочная кроны средняя",
  "обрезка формовочная кроны сильная",
  "лечение ран ствола и корневых лап размером до 1 дм³",
  "лечение ран ствола и корневых лап размером более 1 до 5 дм³",
  "лечение ран ствола и корневых лап размером более 5 до 10 дм³",
  "лечение ран ствола и корневых лап размером более 10 дм³",
  "лечение и пломбирование дупла размером до 10 дм²",
  "лечение и пломбирование дупла размером более 10 до 30 дм ³",
  "лечение и пломбирование дупла размером более 30 дм³",
  "закраска ран ствола и корневых лап размером до 1 дм²",
  "закраска ран ствола и корневых лап размером от 1 до 5 дм³",
  "закраска ран ствола и корневых лап размером более 5 до 10 дм³",
  "закраска ран ствола и корневых лап размером более 10 дм³",
  "санитарная рубка",
  "рубки ухода",
  "удаление поросли",
  "удаление водяных побегов",
  "удаление плодовых тел",
  "крепление ствола подпорками",
  "стягивание ствола (при развале кроны)",
  "засыпка корней",
  "комплексный уход",
  "обработка химикатами",
]


objects = [
    {'id': 0, "cords": [6262893.885318164, 7970131.0922140535], "address": "сад Декабристов"},
    {'id': 1, "cords": [58.010829, 56.253604], "address": "сад имени Любимова"}
]

elements = [
     {
        'trees': [
            {'id': 0, 'cords': [6262893.996637655, 7970140.548852169], 'name':'Лиственица', 'photos': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Sequoiadendron_giganteum_at_Kenilworth_Castle.jpg/450px-Sequoiadendron_giganteum_at_Kenilworth_Castle.jpg'], 'height': 100, 'trunkDiameter': 10, 'age': None, 'typeOfDamage': [0,5], 'crownProjection': 1234, 'assessment': 4, 'comment': "Какой-то комментарий", 'recommendation': [0,1,2,3], 'trunkNumber': 10, 'sanitaryCondition': 3, 'lastChange': datetime.now().isoformat()},
            {'id': 1, 'cords': [6262767.635141125, 7970040.966693438], 'name':'Пихта',  'photos': ['https://gas-kvas.com/grafic/uploads/posts/2023-09/1695808091_gas-kvas-com-p-kartinki-derevo-16.jpg'], 'height': 100, 'trunkDiameter': 10, 'age': 1, 'typeOfDamage': [0,5], 'crownProjection': 2,  'assessment': 0, 'comment': "Какой-то комментарий",'recommendation': [0,1], 'trunkNumber': 10, 'sanitaryCondition': 1},
            {'id': 2, 'cords': [6262825.3227447625, 7970092.685098305], 'name':'Дуб',  'photos': ['https://get.pxhere.com/photo/landscape-tree-nature-branch-plant-meadow-rural-green-botany-head-deciduous-oak-grove-ecosystem-individually-flowering-plant-biome-sommer-head-woody-plant-land-plant-plane-tree-family-708077.jpg'], 'height': 100, 'trunkDiameter': 10, 'age': 2, 'typeOfDamage': [0,5], 'crownProjection': 1234, 'assessment': 0, 'comment': "Какой-то комментарий",'recommendation': [0,1], 'trunkNumber': 10,'sanitaryCondition': 2},
        ],
        'furnitures': [
            {'id': 0, 'cords': [6262937.633878046, 7970171.230471022], 'name':'Будка 1', 'comment': "Какой-то комментарий", 'assessment': 0, 'lastChange': datetime.now().isoformat()},
            {'id': 1, 'cords': [6262886.532084083, 7970123.497430367], 'name':'Будка 2', 'comment': "Какой-то комментарий", 'assessment': 2},
            {'id': 2, 'cords': [6262853.986630516, 7970132.77088164],  'name':'Будка 3', 'comment': "Какой-то комментарий", 'assessment': 3},
        ],
    },
    {
         'trees': [
            {'id': 0, 'cords': [58.010615, 56.253384], 'name':'Дерево 1', 'photos': ['someUrlToPhoto'], 'height': 100, 'trunkDiameter': 10, 'assessment': 0, 'comment': "nice"},
            {'id': 1, 'cords': [58.010615, 56.253394], 'name':'Дерево 1', 'photos': ['someUrlToPhoto'], 'height': 100, 'trunkDiameter': 10, 'assessment': 0, 'comment': "nice"},
        ],
        'furnitures': [
            {'id': 0, 'cords': [58.013582, 56.260926], 'name':'Будка 1', },
            {'id': 1, 'cords': [58.013354859708976, 56.26046694477438], 'name':'Будка 2', },
            {'id': 2, 'cords': [58.01339898804816, 56.2601745839907],  'name':'Будка 3', },        
        ],
    }
]
from datetime import datetime

objects = [
    {'id': 0, "cords": [58.013436, 56.260534], "address": "сад Декабристов"},
    {'id': 1, "cords": [58.010829, 56.253604], "address": "сад имени Любимова"}
]

elements = [
     {
        'trees': [
            {'id': 0, 'cords': [58.013436, 56.260534], 'name':'Лиственица', 'photos': ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Sequoiadendron_giganteum_at_Kenilworth_Castle.jpg/450px-Sequoiadendron_giganteum_at_Kenilworth_Castle.jpg'], 'height': 100, 'trunkDiameter': 10, 'age': 0, 'typeOfDamage': [0,5], 'crownProjection': 1234, 'aestaticAssessment': 4, 'comment': "Какой-то комментарий", 'recommendation': [0,1], 'trunkNumber': 10, 'sanitaryCondition': 2, 'lastChange': datetime.now().isoformat()},
            {'id': 1, 'cords': [58.01296212927088, 56.25939887536343], 'name':'Пихта',  'photos': ['https://gas-kvas.com/grafic/uploads/posts/2023-09/1695808091_gas-kvas-com-p-kartinki-derevo-16.jpg'], 'height': 100, 'trunkDiameter': 10, 'age': 1, 'typeOfDamage': [0,5], 'crownProjection': 1234,  'aestaticAssessment': 0, 'comment': "Какой-то комментарий",'recommendation': [0,1], 'trunkNumber': 10, 'sanitaryCondition': 2},
            {'id': 2, 'cords': [58.01320823677178, 56.259917091923946], 'name':'Дуб',  'photos': ['https://get.pxhere.com/photo/landscape-tree-nature-branch-plant-meadow-rural-green-botany-head-deciduous-oak-grove-ecosystem-individually-flowering-plant-biome-sommer-head-woody-plant-land-plant-plane-tree-family-708077.jpg'], 'height': 100, 'trunkDiameter': 10, 'age': 2, 'typeOfDamage': [0,5], 'crownProjection': 1234, 'aestaticAssessment': 0, 'comment': "Какой-то комментарий",'recommendation': [0,1], 'trunkNumber': 10,'sanitaryCondition': 2},
        ],
        'furnitures': [
            {'id': 0, 'cords': [58.013582, 56.260926], 'name':'Будка 1', },
            {'id': 1, 'cords': [58.013354859708976, 56.26046694477438], 'name':'Будка 2', },
            {'id': 2, 'cords': [58.01339898804816, 56.2601745839907],  'name':'Будка 3', },
        ],
    },
    {
         'trees': [
            {'id': 0, 'cords': [58.010615, 56.253384], 'name':'Дерево 1', 'photos': ['someUrlToPhoto'], 'height': 100, 'trunkDiameter': 10, 'aestaticAssessment': 0, 'comment': "nice"},
            {'id': 1, 'cords': [58.010615, 56.253394], 'name':'Дерево 1', 'photos': ['someUrlToPhoto'], 'height': 100, 'trunkDiameter': 10, 'aestaticAssessment': 0, 'comment': "nice"},
        ],
        'furnitures': [
            {'id': 0, 'cords': [58.013582, 56.260926], 'name':'Будка 1', },
            {'id': 1, 'cords': [58.013354859708976, 56.26046694477438], 'name':'Будка 2', },
            {'id': 2, 'cords': [58.01339898804816, 56.2601745839907],  'name':'Будка 3', },        
        ],
    }
]
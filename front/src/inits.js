import { Map, Overlay, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { ScaleLine, Zoom } from 'ol/control.js';
import store from './store';
import { fetchObjects } from './fetches';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
  getMarkerStyle,
  editingElement,
  exitingElement,
  loadingImageOfElement,
  removingElement,
  selectingElement,
  updateMarkers,
} from './elements';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Style from 'ol/style/Style';
import {
  clickOnSearch,
  clickOnSearchLiElement,
  clickOnSearchOverlay,
} from './search';
import {
  changeSelectedNavItem,
  clickOnNavAdd,
  clickOnNavElement,
  transitionPageEnd,
  updateObjectStatInMenu,
} from './menu';

export function initSubscribers() {
  store.subscribe('currentObjectID', (oldValue, newValue) => {
    const objects = store.get('objects');
    console.log(`currentObjectID ${oldValue} -> ${newValue}`);
    store.get('map').getView().setCenter(objects[newValue].cords);
    if (window.isAndroid) {
      localStorage.setItem('currentObjectID', newValue);
    }
    updateMarkers();
    updateObjectStatInMenu();
  });

  store.subscribe('selectedNavItem', (oldValue, newValue) => {
    console.log(`selectedNavItem ${oldValue} -> ${newValue}`);
    changeSelectedNavItem(oldValue, newValue);
  });
}

export function initControlsForDebug() {
  const checkSubs = document.createElement('button');
  checkSubs.onclick = store.showSubscribes;
  checkSubs.textContent = 'Check subscribes';

  document.getElementById('map').appendChild(checkSubs);

  const checkData = document.createElement('button');
  checkData.onclick = store.showData;
  checkData.textContent = 'Check data';
  document.getElementById('map').appendChild(checkData);
}

export async function initMap() {
  const object = store.get('objects')[store.get('currentObjectID')];
  const map = store.init(
    'map',
    new Map({
      controls: [new ScaleLine(), new Zoom()],
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: document.getElementById('map'),
      view: new View({
        center: object.cords,
        zoom: 19,
      }),
    })
  );

  const elementVectorSource = store.init(
    'elementVectorSource',
    new VectorSource({
      features: [],
    })
  );

  const elementVectorLayer = new VectorLayer({
    source: elementVectorSource,
    style: (marker) => getMarkerStyle(marker),
  });

  map.addLayer(elementVectorLayer);

  updateMarkers();
  updateObjectStatInMenu();

  // Вывод координат в консоль при клике
  map.on('click', (e) => {
    console.log(e.coordinate);
  });
}

export async function initHandlers() {
  document
    .querySelector('.element-card__img')
    .addEventListener('load', loadingImageOfElement);

  document
    .querySelector('.element-card__close')
    .addEventListener('click', exitingElement);

  document
    .querySelector('.element-card__edit')
    .addEventListener('click', editingElement);

  document
    .querySelector('.element-card__remove')
    .addEventListener('click', removingElement);
}

export async function initInteractions() {
  const elementOverlay = store.init(
    'elementOverlay',
    new Overlay({
      element: document.querySelector('.element-card'),
      autoPan: {
        animation: {
          duration: 0,
        },
      },
    })
  );

  const elementSelect = store.init(
    'elementSelect',
    new Select({
      style: (marker) => getMarkerStyle(marker, 'selected'),
    })
  );
  const elementModify = store.init(
    'elementModify',
    new Modify({
      features: elementSelect.getFeatures(),
      style: new Style(),
    })
  );

  elementSelect.addEventListener('select', selectingElement);
  elementModify.setActive(false);
  elementModify.on('modifystart', (e) => {
    elementOverlay.setPosition(undefined);
    store.get('map').getTarget().style.cursor = 'grabbing';
  });
  elementModify.on('modifyend', (e) => {
    var coordinates = e.features.item(0).getGeometry().getCoordinates();
    console.log(coordinates);
    elementOverlay.setPosition(coordinates);
    store.get('map').getTarget().style.cursor = '';
  });

  const map = store.get('map');
  map.addInteraction(elementSelect);
  map.addOverlay(elementOverlay);
  map.addInteraction(elementModify);
}

export async function initStore() {
  if (window.isAndroid) {
    store.init('currentObjectID', 0);
  } else {
    store.init(
      'currentObjectID',
      Number(localStorage.getItem('currentObjectID')) || 0
    );
  }
  store.init('objects', await fetchObjects());
  // Полная информация о выбранном элементе
  store.init('currentElement', '');
}

export async function initSearch() {
  const search = document.querySelector('.search__input');
  const overlay = document.querySelector('.search__overlay');
  const searchInputField = document.querySelector('.search__text');
  const searchElements = document.querySelector('.search__elements');

  const objects = store.get('objects');
  const currentObject = objects[store.get('currentObjectID')];
  searchInputField.textContent = currentObject.address;

  for (let obj of objects) {
    const element = document.createElement('li');
    element.classList.add('search__element');
    element.textContent = obj.address;
    element.dataset.id = obj.id;
    element.tabIndex = 1;
    searchElements.appendChild(element);
  }

  searchElements.addEventListener('click', clickOnSearchLiElement);
  search.addEventListener('click', clickOnSearch);
  overlay.addEventListener('click', clickOnSearchOverlay);

  if (window.isAndroid) {
    document.querySelector('.search').classList.add('search--android');
  }
}

export async function initMenu() {
  store.init('selectedNavItem', 0);

  const navAddButton = document.querySelector('.nav__button-add');
  const nav = document.querySelector('.nav');
  const page = document.querySelector('.page');

  page.addEventListener('transitionend', transitionPageEnd);
  navAddButton.addEventListener('click', clickOnNavAdd);
  nav.addEventListener('click', clickOnNavElement);

  // Иницифлизация конфигурации доступными объектами

  // Создаем фрагмент документа для улучшенной производительности, чтобы множества элементов добавить в DOM один раз
  const fragment = document.createDocumentFragment();

  const containerForObjectsInConfig = document.querySelector(
    '.config .accordion__objects'
  );
  const objectNames = store.get('objects').map((i) => i.address);
  const templateObject = document.getElementById(
    'template-object-config'
  ).content;

  objectNames.forEach((i, index) => {
    const template = templateObject.cloneNode(true);
    const label = template.querySelector('label');
    const input = template.querySelector('input');
    label.textContent = i;

    label.setAttribute('for', `object-values-${index}`);
    input.setAttribute('id', `object-values-${index}`);
    fragment.appendChild(template);
  });

  containerForObjectsInConfig.appendChild(fragment);
}

import { Map, Overlay, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { ScaleLine, defaults as defaultControls } from "ol/control.js";
import store from "./store";
import { fetchObjects } from "./fetches";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {
  getMarkerStyle,
  editingElement,
  exitingElement,
  loadingImageOfElement,
  removingElement,
  selectingElement,
  updateMarkers,
} from "./elements";
import Select from "ol/interaction/Select";
import Modify from "ol/interaction/Modify";
import Style from "ol/style/Style";
import {
  changeSearchInputField,
  clickOnSearch,
  clickOnSearchClear,
  clickOnSearchLiElement,
  clickOnSearchOverlay,
} from "./search";
import { clickOnNavAdd, clickOnNavElement, transitionPageEnd } from "./menu";

export function initSubscribers() {
  store.subscribe("currentObjectID", (oldValue, newValue) => {
    const objects = store.get("objects");
    console.log(`currentObjectID ${oldValue} -> ${newValue}`);
    store.get("map").getView().setCenter(objects[newValue].cords);
    localStorage.setItem("currentObjectID", newValue);
    updateMarkers();
  });

  store.subscribe("selectedNavItem", (oldValue, newValue) => {
    console.log(`selectedNavItem ${oldValue} -> ${newValue}`);

    const navSides = document.querySelectorAll(".nav__side");
    const page = document.querySelector(".page");
    const pageItemOld = document.querySelector(
      `.page__item:nth-of-type(${oldValue}`
    );
    const pageItemNew = document.querySelector(
      `.page__item:nth-of-type(${newValue})`
    );

    let selectedNavLi, willSelectedNavLi;

    if (oldValue === 0 || oldValue === 1) {
      selectedNavLi = navSides[0].querySelectorAll(".nav__item")[oldValue];
    } else {
      selectedNavLi = navSides[1].querySelectorAll(".nav__item")[oldValue - 2];
    }

    if (newValue === 0 || newValue === 1) {
      willSelectedNavLi = navSides[0].querySelectorAll(".nav__item")[newValue];
    } else {
      willSelectedNavLi =
        navSides[1].querySelectorAll(".nav__item")[newValue - 2];
    }

    if (oldValue != 0) {
      page.classList.remove("page--active");
      pageItemOld.classList.add("page__item--hidden");
    } else {
      page.classList.add("page--active");
    }
    pageItemNew.classList.remove("page__item--hidden");

    selectedNavLi.classList.remove("nav__item--active");
    willSelectedNavLi.classList.add("nav__item--active");
  });
}

export function initControlsForDebug() {
  const checkSubs = document.createElement("button");
  checkSubs.onclick = store.showSubscribes;
  checkSubs.textContent = "Check subscribes";

  document.getElementById("map").appendChild(checkSubs);

  const checkData = document.createElement("button");
  checkData.onclick = store.showData;
  checkData.textContent = "Check data";
  document.getElementById("map").appendChild(checkData);
}

export async function initMap() {
  const object = store.get("objects")[store.get("currentObjectID")];
  const map = store.init(
    "map",
    new Map({
      controls: defaultControls().extend([new ScaleLine()]),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: document.getElementById("map"),
      view: new View({
        center: object.cords,
        zoom: 19,
      }),
    })
  );

  const elementVectorSource = store.init(
    "elementVectorSource",
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

  // Вывод координат в консоль при клике
  map.on("click", (e) => {
    console.log(e.coordinate);
  });
}

export async function initHandlers() {
  document
    .querySelector(".element-card__img")
    .addEventListener("load", loadingImageOfElement);

  document
    .querySelector(".element-card__close")
    .addEventListener("click", exitingElement);

  document
    .querySelector(".element-card__edit")
    .addEventListener("click", editingElement);

  document
    .querySelector(".element-card__remove")
    .addEventListener("click", removingElement);
}

export async function initInteractions() {
  const elementOverlay = store.init(
    "elementOverlay",
    new Overlay({
      element: document.querySelector(".element-card"),
      autoPan: {
        animation: {
          duration: 0,
        },
      },
    })
  );

  const elementSelect = store.init(
    "elementSelect",
    new Select({
      style: (marker) => getMarkerStyle(marker, "selected"),
    })
  );
  const elementModify = store.init(
    "elementModify",
    new Modify({
      features: elementSelect.getFeatures(),
      style: new Style(),
    })
  );

  elementSelect.addEventListener("select", selectingElement);
  elementModify.setActive(false);
  elementModify.on("modifystart", (e) => {
    elementOverlay.setPosition(undefined);
    store.get("map").getTarget().style.cursor = "grabbing";
  });
  elementModify.on("modifyend", (e) => {
    var coordinates = e.features.item(0).getGeometry().getCoordinates();
    console.log(coordinates);
    elementOverlay.setPosition(coordinates);
    store.get("map").getTarget().style.cursor = "";
  });

  const map = store.get("map");
  map.addInteraction(elementSelect);
  map.addOverlay(elementOverlay);
  map.addInteraction(elementModify);
}

export async function initStore() {
  store.init(
    "currentObjectID",
    Number(localStorage.getItem("currentObjectID")) || 0
  );
  store.init("objects", await fetchObjects());
  // Полная информация о выбранном элементе
  store.init("currentElement", "");
}

export async function initSearch() {
  const search = document.querySelector(".search__wrapper");
  const overlay = document.querySelector(".overlay");
  const searchInputField = document.querySelector(".search__input-field");
  const searchElements = document.querySelector(".search__elements");
  const searchClear = document.querySelector(".search__clear");

  const objects = store.get("objects");
  const currentObject = objects[store.get("currentObjectID")];
  const addressObjects = objects.map((obj) => ({
    id: obj.id,
    address: obj.address,
  }));
  searchInputField.value = currentObject.address;

  searchElements.addEventListener("click", clickOnSearchLiElement);
  searchClear.addEventListener("click", clickOnSearchClear);
  search.addEventListener("click", (e) => clickOnSearch(e, addressObjects));
  searchInputField.addEventListener("input", (e) =>
    changeSearchInputField(e, addressObjects)
  );
  overlay.addEventListener("click", (e) =>
    clickOnSearchOverlay(e, addressObjects)
  );
}

export async function initMenu() {
  store.init("selectedNavItem", 0);

  const navAddButton = document.querySelector(".nav__button-add");
  const nav = document.querySelector(".nav");
  const page = document.querySelector(".page");

  page.addEventListener("transitionend", transitionPageEnd);
  navAddButton.addEventListener("click", clickOnNavAdd);
  nav.addEventListener("click", clickOnNavElement);
}

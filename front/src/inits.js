import { Feature, Map, Overlay, View } from "ol";
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
import { Polygon } from "ol/geom";

export function initSubscribers() {
  store.subscribe("currentObjectID", (oldValue, newValue) => {
    const objects = store.get("objects");
    console.log(`currentObjectID ${oldValue} -> ${newValue}`);
    store.get("map").getView().setCenter(objects[newValue].cords);
    localStorage.setItem("currentObjectID", newValue);
    updateMarkers();
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
  const searchInput = document.querySelector(".search__input");
  const searchElements = document.querySelector(".search__elements");
  const searchClear = document.querySelector(".search__clear");
  const currentObjectID = store.get("currentObjectID");
  const currentObject = store.get("objects")[currentObjectID];

  searchInputField.value = currentObject.address;

  const objects = store.get("objects");

  let addressObjects = objects.map((obj) => ({
    id: obj.id,
    address: obj.address,
  }));

  const currentInputedAddress = searchInputField.value;
  const correspondingAddress = addressObjects.filter((obj) =>
    currentInputedAddress.includes(obj.address)
  );

  if (correspondingAddress) {
    for (let obj of correspondingAddress) {
      const element = document.createElement("li");
      element.classList.add("search__element");
      element.textContent = obj.address;
      element.dataset.id = obj.id;
      searchElements.appendChild(element);
    }
  }

  searchElements.addEventListener("click", (e) => {
    const target = e.target;
    if (target.dataset.id == store.get("currentObjectID")) {
      searchInputField.value = currentObject.address;
    } else {
      const currentObjectId = store.set("currentObjectID", target.dataset.id);
      searchInputField.value = objects[currentObjectId].address;
    }
    overlay.classList.add("overlay--hide");
    searchElements.classList.add("search__elements--hide");
    searchInput.classList.remove("search__input--showing-elements");
    search.classList.remove("search__wrapper--showing-elements");
    e.stopPropagation();
  });

  searchClear.addEventListener("click", () => {
    searchInputField.focus();
    searchInputField.value = "";
    searchElements.innerHTML = "";
    searchInputField.classList.remove("search__input-field--error");
    for (let obj of objects) {
      const element = document.createElement("li");
      element.classList.add("search__element");
      element.textContent = obj.address;
      element.dataset.id = obj.id;
      searchElements.appendChild(element);
    }
  });

  search.addEventListener("click", () => {
    searchElements.classList.remove("search__elements--hide");
    search.classList.add("search__wrapper--showing-elements");
    searchInput.classList.add("search__input--showing-elements");

    overlay.classList.remove("overlay--hide");
    searchInputField.focus();
  });

  searchInputField.addEventListener("input", () => {
    const currentInputedAddress = searchInputField.value;
    searchElements.innerHTML = "";
    const correspondingAddress = addressObjects.filter((obj) =>
      obj.address.includes(currentInputedAddress)
    );
    console.log(correspondingAddress);

    if (correspondingAddress.length !== 0) {
      searchElements.classList.remove("search__elements--hide");
      searchInputField.classList.remove("search__input-field--error");
      search.classList.add("search__wrapper--showing-elements");
      searchInput.classList.add("search__input--showing-elements");

      for (let obj of correspondingAddress) {
        const element = document.createElement("li");
        element.classList.add("search__element");
        element.textContent = obj.address;
        element.dataset.id = obj.id;
        searchElements.appendChild(element);
      }
    } else {
      searchInputField.classList.add("search__input-field--error");
      searchElements.classList.add("search__elements--hide");
      search.classList.remove("search__wrapper--showing-elements");
      searchInput.classList.remove("search__input--showing-elements");
    }
  });

  overlay.addEventListener("click", () => {
    console.log("overlay");
    if (!overlay.classList.contains("overlay--hide")) {
      overlay.classList.add("overlay--hide");
      searchElements.classList.add("search__elements--hide");
      searchInput.classList.remove("search__input--showing-elements");
      search.classList.remove("search__wrapper--showing-elements");
      searchInputField.value = currentObject.address;

      if (searchInputField.classList.contains("search__input-field--error")) {
        searchElements.innerHTML = "";
        searchInputField.classList.remove("search__input-field--error");
        for (let obj of correspondingAddress) {
          const element = document.createElement("li");
          element.classList.add("search__element");
          element.textContent = obj.address;
          element.dataset.id = obj.id;
          searchElements.appendChild(element);
        }
      }
    }
  });

  // for (const obj of store.get("objects")) {
  //   if (obj.id === store.get("currentObjectID")) {
  //     option.selected = true;
  //   } else {
  //     const element = document.createElement("li");
  //     element.classList.add("search__element");
  //     option.textContent = obj.address;
  //     searchElements.appendChild(option);
  //   }
  // }

  // document.getElementById("map").appendChild(search);

  // search.addEventListener("change", () => {
  //   store.set("currentObjectID", search.value);
  // });
}

import { Map, Overlay, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
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
  const search = document.createElement("select");
  search.classList.add("search-input");

  for (const object of store.get("objects")) {
    const option = document.createElement("option");

    if (object.id === store.get("currentObjectID")) {
      option.selected = true;
    }
    option.value = object.id;
    option.textContent = object.address;
    search.appendChild(option);
  }

  document.getElementById("map").appendChild(search);

  search.addEventListener("change", () => {
    store.set("currentObjectID", search.value);
  });
}

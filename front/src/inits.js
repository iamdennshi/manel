import "../style.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";

import store from "./store";
import { fetchObjects } from "./fetches";
import { updateElements } from "./updates";

export function initSubscribers() {
  store.subscribe("currentObjectID", (oldValue, newValue) => {
    const objects = store.get("objects");
    console.log(`currentObjectID ${oldValue} -> ${newValue}`);
    store.get("map").setCenter(objects[newValue].cords);
    localStorage.setItem("currentObjectID", newValue);
    updateElements();
  });
}

export function initControlsForDebug() {
  const checkSubs = document.createElement("button");
  checkSubs.onclick = store.showSubscribes;
  checkSubs.textContent = "Check subscribes";
  document.body.insertBefore(checkSubs, document.body.firstChild);

  const checkData = document.createElement("button");
  checkData.onclick = store.showData;
  checkData.textContent = "Check data";
  document.body.insertBefore(checkData, document.body.firstChild);
}

export async function initMap() {
  const object = store.get("objects")[store.get("currentObjectID")];
  store.set(
    "map",
    new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [58.013391, 56.260533],
        zoom: 20,
      }),
    })
  );
  updateElements();
}

export async function initStore() {
  store.set(
    "currentObjectID",
    Number(localStorage.getItem("currentObjectID")) || 0
  );
  store.set("objects", await fetchObjects());
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

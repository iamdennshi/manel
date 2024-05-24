import "./src/styles/styles.scss";
import { Map, View, Feature, Overlay } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Style from "ol/style/Style";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import Text from "ol/style/Text"; // Импортируем Text
import { fetchElement, fetchElements } from "./src/fetches";
import Modify from "ol/interaction/Modify.js";
import Select from "ol/interaction/Select.js";
import {
  AGE_CLASS,
  ASSESSMENT,
  DAMAGE,
  RECOMMENDATION,
  SANITARY,
} from "./src/utils";
const target = document.getElementById("map");

const content = document.querySelector(".elem-info");
const closer = document.querySelector(".popup__close");
const popupLoader = document.querySelector(".popup__loader");

const elemInfoName = document.querySelector(".elem-info__name");
const elemInfoContent = document.querySelector(".elem-info__content");
const elemInfoImg = document.querySelector(".elem-info__img");
const elemInfoLoader = document.querySelector(".elem-info__loader");
const elementInfoImgDefault =
  "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";
const elemInfoControlEdit = document.querySelector(".elem-info__edit");
const elemInfoControlRemove = document.querySelector(".elem-info__remove");

let elemInfoCurrent = null;

elemInfoControlEdit.addEventListener("click", (e) => {
  // Если вошли в режим редактирования
  if (elemInfoControlRemove.classList.contains("elem-info__remove--hide")) {
    elemInfoControlEdit.textContent = "Сохранить";
    modify.setActive(true);
    elemInfoControlRemove.classList.remove("elem-info__remove--hide");
    elemInfoName.disabled = false; // Вкл возможность редактировать название элемента

    // Если редактируются - благоустройство
    if (elemInfoControlEdit.classList.contains("elem-info__edit--furniture")) {
      elemInfoContent
        .querySelectorAll("li")
        .forEach((i) => i.classList.toggle("hide"));

      // Установка оценки
      elemInfoContent.querySelector(
        `select > option:nth-of-type(${elemInfoCurrent.assessment + 1})`
      ).selected = true;

      // Установка примечания
      elemInfoContent.querySelector(`textarea`).value = elemInfoCurrent.comment;
    }
  } else {
    console.log("save");

    // Если сохраняется благоустройство
    if (elemInfoControlEdit.classList.contains("elem-info__edit--furniture")) {
      // Порядок важен
      const elemInfoEdited = {
        id: elemInfoCurrent.id,
        cords: select.getFeatures().item(0).getGeometry().getCoordinates(),
        name: elemInfoName.value,
        assessment: parseInt(document.getElementById("assessment-edit").value),
        comment: document.getElementById("comment-edit").value,
        lastChange: elemInfoCurrent.lastChange,
      };

      if (JSON.stringify(elemInfoEdited) !== JSON.stringify(elemInfoCurrent)) {
        console.log("UPDATE");
        console.log(elemInfoEdited);
        elemInfoCurrent = elemInfoEdited;

        const properties = elemInfoContent.querySelectorAll("span");

        properties[0].innerText = `${ASSESSMENT[elemInfoCurrent.assessment]}`;
        properties[1].innerText = `${elemInfoCurrent.comment}`;

        const dateTime = new Date();
        const dateTimeString = `Последнее изменение ${dateTime
          .getDate()
          .toString()
          .padStart(2, "0")}.${dateTime
          .getMonth()
          .toString()
          .padStart(2, "0")}.${dateTime.getFullYear()} ${dateTime
          .getHours()
          .toString()
          .padStart(2, "0")}:${dateTime
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        const elemInfoLastEdit = document.querySelector(
          ".elem-info__last-edit"
        );
        elemInfoLastEdit.innerText = dateTimeString;
        elemInfoLastEdit.classList.remove("elem-info__last-edit--hide");
      }
    }

    elemInfoContent
      .querySelectorAll("li")
      .forEach((i) => i.classList.toggle("hide"));
    exitToEditMode();
  }
});

// Обнулить режим редактирования если находились в нем
function exitToEditMode() {
  if (!elemInfoControlRemove.classList.contains("elem-info__remove--hide")) {
    elemInfoControlEdit.textContent = "Редактировать";
    elemInfoName.disabled = true; // Выкл возможность редактировать название элемента
    modify.setActive(false);
    elemInfoControlRemove.classList.add("elem-info__remove--hide");
  }
}

elemInfoImg.addEventListener("load", () => {
  console.log("img loaded");
  elemInfoLoader.classList.remove("loader");
  elemInfoImg.classList.remove("elem-info__img--hide");
});

var overlay = new Overlay({
  element: document.querySelector(".popup"),
  autoPan: {
    animation: {
      duration: 0,
    },
  },
});

function getMarkerStyle(marker, markerType = "") {
  let stroke = new Stroke({
    color: "#ffffffaa",
  });

  if (markerType === "selected") {
    stroke = new Stroke({
      color: "#FF0000",
      width: 4,
    });
  } else if (markerType === "hover") {
    stroke = new Stroke({
      color: "#fff",
    });
  }

  return new Style({
    image: new CircleStyle({
      radius: 14,
      stroke: stroke,
      fill: new Fill(
        markerType == ""
          ? {
              color: marker.get("type") === "tree" ? "#00A36Caa" : "#ff8c00aa",
            }
          : {
              color: marker.get("type") === "tree" ? "#00A36C" : "#ff8c00",
            }
      ),
    }),
    text: new Text({
      text: marker.get("id").toString(),
      fill: new Fill({
        color: "#fff",
      }),
    }),
  });
}

const elements = await fetchElements(0);
const treeMarks = elements.trees.map((elem) => {
  return new Feature({
    geometry: new Point([elem.cords[0], elem.cords[1]]),
    id: elem.id,
    name: elem.name,
    type: "tree",
  });
});
const furnitureMarks = elements.furnitures.map((elem) => {
  return new Feature({
    geometry: new Point([elem.cords[0], elem.cords[1]]),
    id: elem.id,
    name: elem.name,
    type: "furniture",
  });
});

// Удаление элемента
elemInfoControlRemove.addEventListener("click", () => {
  const currentFeature = select.getFeatures().item(0);
  vectorSource.removeFeature(currentFeature);
  console.log(
    `DELETE ${currentFeature.getProperties().type} with ID - ${
      currentFeature.getProperties().id
    }`
  );
  exitToElement();
});

const vectorSource = new VectorSource({
  features: [...treeMarks, ...furnitureMarks],
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: (marker) => getMarkerStyle(marker),
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer,
  ],
  overlays: [overlay],
  target: target,
  view: new View({
    center: [6262893.885318164, 7970131.0922140535],
    zoom: 19,
  }),
});

const select = new Select({
  style: (marker) => getMarkerStyle(marker, "selected"),
});
map.addInteraction(select);
const modify = new Modify({
  features: select.getFeatures(),
  style: new Style(),
});
map.addInteraction(modify);
modify.setActive(false);

function exitToElement() {
  overlay.setPosition(undefined);
  select.getFeatures().clear();
  exitToEditMode();
}

// Нажимаем крести на элементе
closer.onclick = () => exitToElement();

select.on("select", function () {
  const selectedFeatures = select.getFeatures();

  if (selectedFeatures.getLength() > 0) {
    // Выбираем элемент
    clearStyle();
    exitToEditMode();

    const feature = selectedFeatures.item(0);
    const coordinates = feature.getGeometry().getCoordinates();
    const elemID = feature.getProperties().id;
    const elemType = feature.getProperties().type;

    overlay.setPosition(coordinates);
    popupLoader.classList.add("loader");
    content.classList.add("elem-info--hide");
    fetchElement(0, elemID, elemType).then((elem) => {
      elemInfoCurrent = elem;

      content.classList.remove("elem-info--hide");
      popupLoader.classList.remove("loader");

      const elemInfoType = document.querySelector(".elem-info__type");
      const elemInfoLastEdit = document.querySelector(".elem-info__last-edit");

      if (elem.lastChange) {
        const dateTime = new Date(elem.lastChange);
        const dateTimeString = `Последнее изменение ${dateTime
          .getDate()
          .toString()
          .padStart(2, "0")}.${dateTime
          .getMonth()
          .toString()
          .padStart(2, "0")}.${dateTime.getFullYear()} ${dateTime
          .getHours()
          .toString()
          .padStart(2, "0")}:${dateTime
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        elemInfoLastEdit.innerText = dateTimeString;
        elemInfoLastEdit.classList.remove("elem-info__last-edit--hide");
      } else {
        elemInfoLastEdit.classList.add("elem-info__last-edit--hide");
      }

      elemInfoLoader.classList.add("loader");
      elemInfoImg.classList.add("elem-info__img--hide");
      elemInfoName.value = elem.name;
      elemInfoContent.innerHTML = "";

      if (elemType === "tree") {
        elemInfoType.innerText = "дерево";
        elemInfoType.classList.remove(`elem-info__type--furniture`);
        elemInfoControlEdit.classList.remove(`elem-info__edit--furniture`);
        elemInfoType.classList.add(`elem-info__type--tree`);
        elemInfoControlEdit.classList.add(`elem-info__edit--tree`);

        const templateTree = document
          .getElementById("template-tree")
          .content.cloneNode(true);

        const properties = templateTree.querySelectorAll("span");
        properties[0].innerText = `${elem.height} см`;
        properties[1].innerText = `${elem.trunkDiameter} см`;
        // Сделать для каждого свойства у элемента. Не показывать его если оно null(none)
        if (elem.age) {
          properties[2].innerText = `${AGE_CLASS[elem.age]}`;
        } else {
          properties[2].parentElement.style.display = "none";
        }
        properties[3].innerText = `${elem.crownProjection} см`;
        properties[4].innerText = `${elem.trunkNumber} шт`;
        properties[5].innerText = `${ASSESSMENT[elem.assessment]}`;
        properties[6].innerText = `${SANITARY[elem.sanitaryCondition]}`;
        properties[7].innerText = `${elem.typeOfDamage.map(
          (item) => DAMAGE[item]
        )}`;
        properties[8].innerText = `${elem.recommendation.map(
          (item) => RECOMMENDATION[item]
        )}`;
        properties[9].innerText = `${elem.comment}`;

        elemInfoContent.appendChild(templateTree);
      } else if (elemType === "furniture") {
        elemInfoType.innerText = "благоустройство";
        elemInfoType.classList.remove(`elem-info__type--tree`);
        elemInfoControlEdit.classList.remove(`elem-info__edit--tree`);
        elemInfoType.classList.add(`elem-info__type--furniture`);
        elemInfoControlEdit.classList.add(`elem-info__edit--furniture`);

        const templateFurniture = document
          .getElementById("template-furniture")
          .content.cloneNode(true);
        const properties = templateFurniture.querySelectorAll("span");

        properties[0].innerText = `${ASSESSMENT[elem.assessment]}`;
        properties[1].innerText = `${elem.comment}`;

        elemInfoContent.appendChild(templateFurniture);
      }

      if (elem.photos) {
        elemInfoImg.src = elem.photos;
      } else {
        elemInfoImg.src = elementInfoImgDefault;
      }

      console.log(elem);
    });
  } else {
    // Вышли из элемента кликнув на пустое место на карте
    exitToEditMode();
    clearStyle();
    overlay.setPosition(undefined);
    closer.blur();
  }
});

modify.on("modifystart", function (e) {
  overlay.setPosition(undefined);
  target.style.cursor = "grabbing";
});
modify.on("modifyend", function (e) {
  var coordinates = e.features.item(0).getGeometry().getCoordinates();
  overlay.setPosition(coordinates);
  target.style.cursor = "";
});

map.on("pointermove", function (evt) {
  clearStyle();
  map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    if (!select.getFeatures().getArray().includes(feature)) {
      feature.setStyle((marker) => getMarkerStyle(marker, "hover"));
      return true;
    }
  });
});

function clearStyle() {
  vectorSource.getFeatures().forEach(function (feature) {
    if (!select.getFeatures().getArray().includes(feature)) {
      feature.setStyle((marker) => getMarkerStyle(marker));
    }
  });
}

import { Feature } from "ol";
import { fetchElement, fetchElements } from "./fetches";
import { Point } from "ol/geom";
import store from "./store";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import {
  $,
  AGE_CLASS,
  ASSESSMENT,
  DAMAGE,
  RECOMMENDATION,
  SANITARY,
} from "./utils";

const elementInfoImgDefault =
  "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";
const elemInfoControlRemove = $(".elem-info__remove");
const elemInfoType = $(".elem-info__type");
const elemInfoLastEdit = $(".elem-info__last-edit");
const elemInfoLoader = $(".elem-info__loader");
const elemInfoImg = $(".elem-info__img");
const elemInfoName = $(".elem-info__name");
const elemInfoContent = $(".elem-info__content");
const elemInfoControlEdit = $(".elem-info__edit");

// Обнулить режим редактирования если находились в нем
function exitToEditMode() {
  if (!elemInfoControlRemove.classList.contains("elem-info__remove--hide")) {
    elemInfoControlEdit.textContent = "Редактировать";
    elemInfoName.disabled = true; // Выкл возможность редактировать название элемента
    elemInfoName.classList.remove("editable-field");
    elemInfoName.nextElementSibling.classList.add("hide");
    elemInfoName.classList.remove("editable-field--error");

    store.get("elementModify").setActive(false);
    elemInfoControlRemove.classList.add("elem-info__remove--hide");
  }
}

export function handleRemovingElement() {
  const currentFeature = store.get("elementSelect").getFeatures().item(0);
  store.get("elementVectorSource").removeFeature(currentFeature);
  console.log(
    `DELETE ${currentFeature.getProperties().type} with ID - ${
      currentFeature.getProperties().id
    }`
  );
  handleExitingElement();
}

export function handleEditingElement() {
  const elemInfoCurrent = store.get("elemInfoCurrent");
  // Если вошли в режим редактирования
  if (elemInfoControlRemove.classList.contains("elem-info__remove--hide")) {
    elemInfoControlEdit.textContent = "Сохранить";
    store.get("elementModify").setActive(true);
    elemInfoControlRemove.classList.remove("elem-info__remove--hide");
    elemInfoName.disabled = false; // Вкл возможность редактировать название элемента
    elemInfoName.classList.add("editable-field");

    elemInfoContent
      .querySelectorAll("li")
      .forEach((i) => i.classList.toggle("hide"));

    // Если редактируются - благоустройство
    if (elemInfoControlEdit.classList.contains("elem-info__edit--furniture")) {
      // Установка оценки
      elemInfoContent.querySelector(
        `#assessment-edit > option:nth-of-type(${
          elemInfoCurrent.assessment + 1
        })`
      ).selected = true;

      // Установка примечания
      elemInfoContent.querySelector(`#comment-edit`).value =
        elemInfoCurrent.comment;
    }
    // Если редактируются - дерево
    else if (elemInfoControlEdit.classList.contains("elem-info__edit--tree")) {
      // Установка высоты
      elemInfoContent.querySelector(`#height-edit`).value =
        elemInfoCurrent.height;

      // Установка диаметра ствола
      elemInfoContent.querySelector(`#trunkDiameter-edit`).value =
        elemInfoCurrent.trunkDiameter;

      // Установка возраста
      elemInfoContent.querySelector(
        `#age-edit > option:nth-of-type(${elemInfoCurrent.age + 1})`
      ).selected = true;

      // Установка проекции кроны
      elemInfoContent.querySelector(`#crownProjection-edit`).value =
        elemInfoCurrent.crownProjection;

      // Установка стволов
      elemInfoContent.querySelector(`#trunkNumber-edit`).value =
        elemInfoCurrent.trunkNumber;

      // Установка оценки
      elemInfoContent.querySelector(
        `#assessment-edit > option:nth-of-type(${
          elemInfoCurrent.assessment + 1
        })`
      ).selected = true;

      // Установка санитарного состояния
      elemInfoContent.querySelector(
        `#sanitaryCondition-edit > option:nth-of-type(${
          elemInfoCurrent.sanitaryCondition + 1
        })`
      ).selected = true;

      // Повреждения
      const typeOfDamage = document.getElementById("typeOfDamage-edit");
      // Чтобы измежать повторного добавления
      if (
        elemInfoCurrent.typeOfDamage !== 0 &&
        typeOfDamage.querySelectorAll(".selected-option-edit").length === 0
      ) {
        // Установка повреждений и удаление уже из из select
        elemInfoCurrent.typeOfDamage.forEach((i) => {
          insertDamageById(i);
        });
      }

      // Рекомендации
      const recommendation = document.getElementById("recommendation-edit");
      // Чтобы измежать повторного добавления
      if (
        elemInfoCurrent.recommendation !== 0 &&
        recommendation.querySelectorAll(".selected-option-edit").length === 0
      ) {
        elemInfoCurrent.recommendation.forEach((i) => {
          insertRecommendationById(i);
        });
      }

      // Установка примечания
      elemInfoContent.querySelector(`#comment-edit`).value =
        elemInfoCurrent.comment;
    }
  } else {
    console.log("save");

    // Если сохраняется благоустройство
    if (elemInfoControlEdit.classList.contains("elem-info__edit--furniture")) {
      // Проверка на корректность дилны названия
      if (elemInfoName.value.length < 2 || elemInfoName.value.length > 16) {
        elemInfoName.nextElementSibling.classList.remove("hide");
        startAnimation(elemInfoName.nextElementSibling, "shake");
        elemInfoName.classList.add("editable-field--error");
        return;
      }
      // Порядок важен
      const elemInfoEdited = {
        id: elemInfoCurrent.id,
        cords: store
          .get("elementSelect")
          .getFeatures()
          .item(0)
          .getGeometry()
          .getCoordinates(),
        name: elemInfoName.value,
        assessment: parseInt(document.getElementById("assessment-edit").value),
        comment: document.getElementById("comment-edit").value,
        lastChange: elemInfoCurrent.lastChange,
      };

      console.log(JSON.stringify(elemInfoEdited));
      console.log(JSON.stringify(elemInfoCurrent));
      if (JSON.stringify(elemInfoEdited) !== JSON.stringify(elemInfoCurrent)) {
        console.log("UPDATE furn");
        console.log(elemInfoEdited);
        store.set("elemInfoCurrent", elemInfoEdited);

        const properties = elemInfoContent.querySelectorAll("span");

        properties[0].innerText = `${ASSESSMENT[elemInfoEdited.assessment]}`;
        properties[0].parentElement.style.display = "";

        if (
          elemInfoEdited.comment !== "" &&
          elemInfoEdited.comment != undefined
        ) {
          properties[1].innerText = `${elemInfoEdited.comment}`;
          properties[1].parentElement.style.display = "";
        } else {
          properties[1].parentElement.style.display = "none";
        }

        const elemInfoLastEdit = $(".elem-info__last-edit");
        elemInfoLastEdit.innerText = `Последнее изменение ${dateTimeToString(
          new Date()
        )}`;
        elemInfoLastEdit.classList.remove("elem-info__last-edit--hide");
      }
    }
    // Если сохраняется - дерево
    else if (elemInfoControlEdit.classList.contains("elem-info__edit--tree")) {
      const heihgt = document.querySelector("#height-edit");
      const trunkDiameter = document.querySelector("#trunkDiameter-edit");
      const crownProjection = document.querySelector("#crownProjection-edit");
      const trunkNumber = document.querySelector("#trunkNumber-edit");

      let isCorrect = true;

      // Проверка на корректность дилны названия
      if (elemInfoName.value.length < 2 || elemInfoName.value.length > 16) {
        elemInfoName.nextElementSibling.classList.remove("hide");
        startAnimation(elemInfoName.nextElementSibling, "shake");
        elemInfoName.classList.add("editable-field--error");
        isCorrect = false;
      } else {
        elemInfoName.nextElementSibling.classList.add("hide");
        elemInfoName.classList.remove("editable-field--error");
      }
      // Проверка на корректность высоты
      if (heihgt.value < 1) {
        heihgt.parentElement.nextElementSibling.classList.remove("hide");
        startAnimation(heihgt.parentElement.nextElementSibling, "shake");
        heihgt.classList.add("editable-field--error");
        isCorrect = false;
      } else {
        heihgt.parentElement.nextElementSibling.classList.add("hide");
        heihgt.classList.remove("editable-field--error");
      }
      // Проверка на корректность диаметра ствола
      if (trunkDiameter.value < 1) {
        trunkDiameter.parentElement.nextElementSibling.classList.remove("hide");
        startAnimation(trunkDiameter.parentElement.nextElementSibling, "shake");
        trunkDiameter.classList.add("editable-field--error");
        isCorrect = false;
      } else {
        trunkDiameter.parentElement.nextElementSibling.classList.add("hide");
        trunkDiameter.classList.remove("editable-field--error");
      }
      // Проверка на корректность проекции кроны
      if (crownProjection.value < 1) {
        crownProjection.parentElement.nextElementSibling.classList.remove(
          "hide"
        );
        startAnimation(
          crownProjection.parentElement.nextElementSibling,
          "shake"
        );
        crownProjection.classList.add("editable-field--error");
        isCorrect = false;
      } else {
        crownProjection.parentElement.nextElementSibling.classList.add("hide");
        crownProjection.classList.remove("editable-field--error");
      }
      // Проверка на корректность стволов
      if (trunkNumber.value < 1) {
        startAnimation(trunkNumber.parentElement.nextElementSibling, "shake");
        trunkNumber.parentElement.nextElementSibling.classList.remove("hide");
        trunkNumber.classList.add("editable-field--error");
        isCorrect = false;
      } else {
        trunkNumber.parentElement.nextElementSibling.classList.add("hide");
        trunkNumber.classList.remove("editable-field--error");
      }

      if (isCorrect) {
        console.log("correct");
        //  Получение установелнных ИД повреждений
        const typeOfDamageSelect = document.querySelector(
          "#typeOfDamage-edit .editable-field"
        );
        const damagesId = [];
        Array.from(typeOfDamageSelect.options).forEach((i, index) => {
          if (i.classList.contains("hide")) {
            damagesId.push(index - 1);
          }
        });

        //  Получение установелнных ИД рекомендаций
        const recommendationSelect = document.querySelector(
          "#recommendation-edit .editable-field"
        );
        const recomendationsId = [];
        Array.from(recommendationSelect.options).forEach((i, index) => {
          if (i.classList.contains("hide")) {
            recomendationsId.push(index - 1);
          }
        });

        const elemInfoEdited = {
          id: elemInfoCurrent.id,
          cords: store
            .get("elementSelect")
            .getFeatures()
            .item(0)
            .getGeometry()
            .getCoordinates(),
          name: elemInfoName.value,
          photos: elemInfoCurrent.photos,
          height: parseInt(heihgt.value),
          trunkDiameter: parseInt(trunkDiameter.value),
          assessment: parseInt(
            document.getElementById("assessment-edit").value
          ),
          comment: document.getElementById("comment-edit").value,
          age: parseInt(document.getElementById("age-edit").value),
          crownProjection: parseInt(crownProjection.value),
          typeOfDamage: damagesId,
          recommendation: recomendationsId,
          trunkNumber: parseInt(trunkNumber.value),
          sanitaryCondition: parseInt(
            document.getElementById("sanitaryCondition-edit").value
          ),
          lastChange: elemInfoCurrent.lastChange,
        };
        console.log(JSON.stringify(elemInfoCurrent));
        console.log(JSON.stringify(elemInfoEdited));
        if (
          JSON.stringify(elemInfoEdited) !== JSON.stringify(elemInfoCurrent)
        ) {
          console.log("update tree");
          console.log(elemInfoEdited);
          store.set("elemInfoCurrent", elemInfoEdited);

          const properties = elemInfoContent.querySelectorAll("span");
          properties[0].innerText = `${elemInfoEdited.height} см`;
          properties[1].innerText = `${elemInfoEdited.trunkDiameter} см`;
          properties[2].innerText = `${AGE_CLASS[elemInfoEdited.age]}`;
          properties[3].innerText = `${elemInfoEdited.crownProjection} см`;
          properties[4].innerText = `${elemInfoEdited.trunkNumber} шт`;
          properties[5].innerText = `${ASSESSMENT[elemInfoEdited.assessment]}`;
          properties[6].innerText = `${
            SANITARY[elemInfoEdited.sanitaryCondition]
          }`;
          if (elemInfoEdited.typeOfDamage.length !== 0) {
            properties[7].innerText = `${elemInfoEdited.typeOfDamage.map(
              (item) => DAMAGE[item]
            )}`;
            properties[7].parentElement.style.display = "";
          } else {
            properties[7].parentElement.style.display = "none";
          }
          if (elemInfoEdited.recommendation.length !== 0) {
            properties[8].innerText = `${elemInfoEdited.recommendation.map(
              (item) => RECOMMENDATION[item]
            )}`;
            properties[8].parentElement.style.display = "";
          } else {
            properties[8].parentElement.style.display = "none";
          }
          if (
            elemInfoEdited.comment !== "" &&
            elemInfoEdited.comment != undefined
          ) {
            properties[9].innerText = `${elemInfoEdited.comment}`;
            properties[9].parentElement.style.display = "";
          } else {
            properties[9].parentElement.style.display = "none";
          }

          const elemInfoLastEdit = $(".elem-info__last-edit");
          elemInfoLastEdit.innerText = `Последнее изменение ${dateTimeToString(
            new Date()
          )}`;
          elemInfoLastEdit.classList.remove("elem-info__last-edit--hide");
        }
      } else {
        console.log("not correct");
        return;
      }
    }
    // Общий выход из режима редактирования
    elemInfoContent
      .querySelectorAll("li")
      .forEach((i) => i.classList.toggle("hide"));

    exitToEditMode();
  }
}

export function handleExitingElement() {
  store.get("elementOverlay").setPosition(undefined);
  store.get("elementSelect").getFeatures().clear();
  exitToEditMode();
}

export function handleLoadingImageOfElement() {
  const elemInfoLoader = $(".elem-info__loader");
  console.log("img loaded");
  elemInfoLoader.classList.remove("loader");
  elemInfoImg.classList.remove("elem-info__img--hide");
}

export function getMarkerStyle(marker, markerType = "") {
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

export function selectElement(e) {
  const selectedElement = e.target.getFeatures().item(0);

  if (selectedElement) {
    // Выбираем элемент
    exitToEditMode();

    const coordinates = selectedElement.getGeometry().getCoordinates();
    const elemID = selectedElement.getProperties().id;
    const elemType = selectedElement.getProperties().type;
    const popupLoader = $(".popup__loader");
    const content = $(".elem-info");

    store.get("elementOverlay").setPosition(coordinates);
    popupLoader.classList.add("loader");
    content.classList.add("elem-info--hide");
    fetchElement(store.get("currentObjectID"), elemID, elemType).then(
      (elem) => {
        store.set("elemInfoCurrent", elem);

        content.classList.remove("elem-info--hide");
        popupLoader.classList.remove("loader");

        if (elem.lastChange) {
          elemInfoLastEdit.innerText = `Последнее изменение ${dateTimeToString(
            new Date(elem.lastChange)
          )}`;
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
          properties[2].innerText = `${AGE_CLASS[elem.age]}`;
          properties[3].innerText = `${elem.crownProjection} см`;
          properties[4].innerText = `${elem.trunkNumber} шт`;
          properties[5].innerText = `${ASSESSMENT[elem.assessment]}`;
          properties[6].innerText = `${SANITARY[elem.sanitaryCondition]}`;
          if (elem.typeOfDamage.length !== 0) {
            properties[7].innerText = `${elem.typeOfDamage.map(
              (item) => DAMAGE[item]
            )}`;
            properties[7].parentElement.style.display = "";
          } else {
            properties[7].parentElement.style.display = "none";
          }

          if (elem.recommendation.length !== 0) {
            properties[8].innerText = `${elem.recommendation.map(
              (item) => RECOMMENDATION[item]
            )}`;
            properties[8].parentElement.style.display = "";
          } else {
            properties[8].parentElement.style.display = "none";
          }
          if (elem.comment !== "" && elem.comment != undefined) {
            properties[9].innerText = `${elem.comment}`;
            properties[9].parentElement.style.display = "";
          } else {
            properties[9].parentElement.style.display = "none";
          }

          elemInfoContent.appendChild(templateTree);

          // Повреждения
          const typeOfDamage = document.getElementById("typeOfDamage-edit");
          // Обработчик события select повреждений
          typeOfDamage
            .querySelector(".editable-field")
            .addEventListener("change", (i) => {
              const damageId = i.currentTarget.selectedIndex;
              insertDamageById(damageId - 1);

              i.currentTarget.value = "выбирите";
            });

          // Обработчик события удаления повреждения
          typeOfDamage.addEventListener("click", (i) => {
            if (i.target instanceof HTMLButtonElement) {
              const optionIndex =
                i.target.previousElementSibling.dataset.optionIndex;
              i.target.parentElement.remove();
              typeOfDamage
                .querySelector(".editable-field")
                .options[optionIndex].classList.remove("hide");
            }
          });

          // Рекомендации
          const recommendation = document.getElementById("recommendation-edit");
          // Обработчик события select рекомендаций
          recommendation
            .querySelector(".editable-field")
            .addEventListener("change", (i) => {
              const recommendationId = i.currentTarget.selectedIndex;
              insertRecommendationById(recommendationId - 1);

              i.currentTarget.value = "выбирите";
            });

          // Обработчик события удаления повреждения
          recommendation.addEventListener("click", (i) => {
            if (i.target instanceof HTMLButtonElement) {
              const optionIndex =
                i.target.previousElementSibling.dataset.optionIndex;
              i.target.parentElement.remove();
              recommendation
                .querySelector(".editable-field")
                .options[optionIndex].classList.remove("hide");
            }
          });
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

          if (elem.assessment) {
            properties[0].innerText = `${ASSESSMENT[elem.assessment]}`;
          } else {
            properties[0].parentElement.style.display = "none";
          }

          if (elem.comment !== "" && elem.comment != undefined) {
            properties[1].innerText = `${elem.comment}`;
          } else {
            properties[1].parentElement.style.display = "none";
          }

          elemInfoContent.appendChild(templateFurniture);
        }

        if (elem.photos) {
          elemInfoImg.src = elem.photos;
        } else {
          elemInfoImg.src = elementInfoImgDefault;
        }

        console.log(elem);
      }
    );
  } else {
    // Вышли из элемента кликнув на пустое место на карте
    exitToEditMode();
    store.get("elementOverlay").setPosition(undefined);
  }
}

export async function updateElements() {
  const elements = await fetchElements(store.get("currentObjectID"));
  const elementVectorSource = store.get("elementVectorSource");
  elementVectorSource.clear();

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

  elementVectorSource.addFeatures([...treeMarks, ...furnitureMarks]);
}

function dateTimeToString(dateTime) {
  return `${dateTime.getDate().toString().padStart(2, "0")}.${dateTime
    .getMonth()
    .toString()
    .padStart(2, "0")}.${dateTime.getFullYear()} ${dateTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${dateTime.getMinutes().toString().padStart(2, "0")}`;
}

function startAnimation(elem, animationName) {
  elem.classList.remove(animationName); // удалене анимации тряски
  elem.offsetWidth; // Принудительная переоценка, чтобы сбросить анимацию
  elem.classList.add(animationName); // анимация тряски
}

function insertDamageById(damageId) {
  const typeOfDamage = document.getElementById("typeOfDamage-edit");
  const templateSelectedOption = document
    .getElementById("template-selected-option")
    .content.cloneNode(true);
  const pElem = templateSelectedOption.querySelector("p");
  pElem.textContent = DAMAGE[damageId];
  pElem.dataset.optionIndex = damageId + 1;

  typeOfDamage.appendChild(templateSelectedOption);

  const typeOfDamageOptions =
    typeOfDamage.querySelector(".editable-field").options;
  // + 1 исключает первый option "выбрать"
  typeOfDamageOptions[damageId + 1].classList.add("hide");
}

function insertRecommendationById(recommendationId) {
  const recommendation = document.getElementById("recommendation-edit");
  const templateSelectedOption = document
    .getElementById("template-selected-option")
    .content.cloneNode(true);
  const pElem = templateSelectedOption.querySelector("p");
  pElem.textContent = RECOMMENDATION[recommendationId];
  pElem.dataset.optionIndex = recommendationId + 1;

  recommendation.appendChild(templateSelectedOption);

  const recommendationOptions =
    recommendation.querySelector(".editable-field").options;
  // + 1 исключает первый option "выбрать"
  recommendationOptions[recommendationId + 1].classList.add("hide");
}

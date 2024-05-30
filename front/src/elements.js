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
const elementCardControlRemove = $(".element-card__remove");
const elementCardType = $(".element-card__type");
const elementCardLastEdit = $(".element-card__last-edit");
const elementCardLoader = $(".element-card__loader");
const elementCardImg = $(".element-card__img");
const elementCardImgLoader = $(".element-card__img-loader");
const elementCardName = $(".element-card__name");
const elementCardContent = $(".element-card__content");
const elementCardControlEdit = $(".element-card__edit");

// Обнулить режим редактирования если находились в нем
function exitToEditMode() {
  if (!elementCardControlRemove.classList.contains("hide")) {
    elementCardControlEdit.textContent = "Редактировать";
    elementCardName.disabled = true; // Выкл возможность редактировать название элемента
    elementCardName.classList.remove("element-card__editable-field");
    elementCardName.nextElementSibling.classList.add("hide");
    elementCardName.classList.remove("element-card__editable-field--error");

    store.get("elementModify").setActive(false);
    elementCardControlRemove.classList.add("hide");
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
  const currentElement = store.get("currentElement");
  // Если вошли в режим редактирования
  if (elementCardControlRemove.classList.contains("hide")) {
    elementCardControlEdit.textContent = "Сохранить";
    store.get("elementModify").setActive(true);
    elementCardControlRemove.classList.remove("hide");
    elementCardName.disabled = false; // Вкл возможность редактировать название элемента
    elementCardName.classList.add("element-card__editable-field");

    elementCardContent
      .querySelectorAll("li")
      .forEach((i) => i.classList.toggle("hide"));

    // Если редактируются - благоустройство
    if (
      elementCardControlEdit.classList.contains("element-card__edit--furniture")
    ) {
      // Установка оценки
      elementCardContent.querySelector(
        `#assessment > option:nth-of-type(${currentElement.assessment + 1})`
      ).selected = true;

      // Установка примечания
      elementCardContent.querySelector(`#comment`).value =
        currentElement.comment;
    }
    // Если редактируются - дерево
    else if (
      elementCardControlEdit.classList.contains("element-card__edit--tree")
    ) {
      // Установка высоты
      elementCardContent.querySelector(`#height`).value = currentElement.height;

      // Установка диаметра ствола
      elementCardContent.querySelector(`#trunk-diameter`).value =
        currentElement.trunkDiameter;

      // Установка возраста
      elementCardContent.querySelector(
        `#age > option:nth-of-type(${currentElement.age + 1})`
      ).selected = true;

      // Установка проекции кроны
      elementCardContent.querySelector(`#crown-projection`).value =
        currentElement.crownProjection;

      // Установка стволов
      elementCardContent.querySelector(`#trunk-number`).value =
        currentElement.trunkNumber;

      // Установка оценки
      elementCardContent.querySelector(
        `#assessment > option:nth-of-type(${currentElement.assessment + 1})`
      ).selected = true;

      // Установка санитарного состояния
      elementCardContent.querySelector(
        `#sanitary-condition > option:nth-of-type(${
          currentElement.sanitaryCondition + 1
        })`
      ).selected = true;

      // Повреждения
      const typeOfDamage = document.getElementById("damage");
      // Чтобы измежать повторного добавления
      if (
        currentElement.typeOfDamage !== 0 &&
        typeOfDamage.querySelectorAll(".element-card__selected-option")
          .length === 0
      ) {
        // Установка повреждений и удаление уже из из select
        currentElement.typeOfDamage.forEach((i) => {
          insertDamageById(i);
        });
      }

      // Рекомендации
      const recommendation = document.getElementById("recommendation");
      // Чтобы измежать повторного добавления
      if (
        currentElement.recommendation !== 0 &&
        recommendation.querySelectorAll(".element-card__selected-option")
          .length === 0
      ) {
        currentElement.recommendation.forEach((i) => {
          insertRecommendationById(i);
        });
      }

      // Установка примечания
      elementCardContent.querySelector(`#comment`).value =
        currentElement.comment;
    }
  } else {
    console.log("save");

    // Если сохраняется благоустройство
    if (
      elementCardControlEdit.classList.contains("element-card__edit--furniture")
    ) {
      // Проверка на корректность дилны названия
      if (
        elementCardName.value.length < 2 ||
        elementCardName.value.length > 16
      ) {
        elementCardName.nextElementSibling.classList.remove("hide");
        startAnimation(elementCardName.nextElementSibling, "shake");
        elementCardName.classList.add("element-card__editable-field--error");
        return;
      }
      // Порядок важен
      const editedElement = {
        id: currentElement.id,
        cords: store
          .get("elementSelect")
          .getFeatures()
          .item(0)
          .getGeometry()
          .getCoordinates(),
        name: elementCardName.value,
        assessment: parseInt(document.getElementById("assessment").value),
        comment: document.getElementById("comment").value,
        lastChange: currentElement.lastChange,
      };

      console.log(JSON.stringify(editedElement));
      console.log(JSON.stringify(currentElement));
      if (JSON.stringify(editedElement) !== JSON.stringify(currentElement)) {
        console.log("UPDATE furn");
        console.log(editedElement);
        store.set("currentElement", editedElement);

        const properties = elementCardContent.querySelectorAll("span");

        properties[0].innerText = `${ASSESSMENT[editedElement.assessment]}`;
        properties[0].parentElement.style.display = "";

        if (
          editedElement.comment !== "" &&
          editedElement.comment != undefined
        ) {
          properties[1].innerText = `${editedElement.comment}`;
          properties[1].parentElement.style.display = "";
        } else {
          properties[1].parentElement.style.display = "none";
        }

        const elementCardLastEdit = $(".element-card__last-edit");
        elementCardLastEdit.innerText = `Последнее изменение ${dateTimeToString(
          new Date()
        )}`;
        elementCardLastEdit.classList.remove("hide");
      }
    }
    // Если сохраняется - дерево
    else if (
      elementCardControlEdit.classList.contains("element-card__edit--tree")
    ) {
      const heihgt = document.querySelector("#height");
      const trunkDiameter = document.querySelector("#trunk-diameter");
      const crownProjection = document.querySelector("#crown-projection");
      const trunkNumber = document.querySelector("#trunk-number");

      let isCorrect = true;

      // Проверка на корректность дилны названия
      if (
        elementCardName.value.length < 2 ||
        elementCardName.value.length > 16
      ) {
        elementCardName.nextElementSibling.classList.remove("hide");
        startAnimation(elementCardName.nextElementSibling, "shake");
        elementCardName.classList.add("element-card__editable-field--error");
        isCorrect = false;
      } else {
        elementCardName.nextElementSibling.classList.add("hide");
        elementCardName.classList.remove("element-card__editable-field--error");
      }
      // Проверка на корректность высоты
      if (heihgt.value < 1) {
        heihgt.parentElement.nextElementSibling.classList.remove("hide");
        startAnimation(heihgt.parentElement.nextElementSibling, "shake");
        heihgt.classList.add("element-card__editable-field--error");
        isCorrect = false;
      } else {
        heihgt.parentElement.nextElementSibling.classList.add("hide");
        heihgt.classList.remove("element-card__editable-field--error");
      }
      // Проверка на корректность диаметра ствола
      if (trunkDiameter.value < 1) {
        trunkDiameter.parentElement.nextElementSibling.classList.remove("hide");
        startAnimation(trunkDiameter.parentElement.nextElementSibling, "shake");
        trunkDiameter.classList.add("element-card__editable-field--error");
        isCorrect = false;
      } else {
        trunkDiameter.parentElement.nextElementSibling.classList.add("hide");
        trunkDiameter.classList.remove("element-card__editable-field--error");
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
        crownProjection.classList.add("element-card__editable-field--error");
        isCorrect = false;
      } else {
        crownProjection.parentElement.nextElementSibling.classList.add("hide");
        crownProjection.classList.remove("element-card__editable-field--error");
      }
      // Проверка на корректность стволов
      if (trunkNumber.value < 1) {
        startAnimation(trunkNumber.parentElement.nextElementSibling, "shake");
        trunkNumber.parentElement.nextElementSibling.classList.remove("hide");
        trunkNumber.classList.add("element-card__editable-field--error");
        isCorrect = false;
      } else {
        trunkNumber.parentElement.nextElementSibling.classList.add("hide");
        trunkNumber.classList.remove("element-card__editable-field--error");
      }

      if (isCorrect) {
        console.log("correct");
        //  Получение установелнных ИД повреждений
        const typeOfDamageSelect = document.querySelector(
          "#damage .element-card__editable-field"
        );
        const damagesId = [];
        Array.from(typeOfDamageSelect.options).forEach((i, index) => {
          if (i.classList.contains("hide")) {
            damagesId.push(index - 1);
          }
        });

        //  Получение установелнных ИД рекомендаций
        const recommendationSelect = document.querySelector(
          "#recommendation .element-card__editable-field"
        );
        const recomendationsId = [];
        Array.from(recommendationSelect.options).forEach((i, index) => {
          if (i.classList.contains("hide")) {
            recomendationsId.push(index - 1);
          }
        });

        const editedElement = {
          id: currentElement.id,
          cords: store
            .get("elementSelect")
            .getFeatures()
            .item(0)
            .getGeometry()
            .getCoordinates(),
          name: elementCardName.value,
          photos: currentElement.photos,
          height: parseInt(heihgt.value),
          trunkDiameter: parseInt(trunkDiameter.value),
          assessment: parseInt(document.getElementById("assessment").value),
          comment: document.getElementById("comment").value,
          age: parseInt(document.getElementById("age").value),
          crownProjection: parseInt(crownProjection.value),
          typeOfDamage: damagesId,
          recommendation: recomendationsId,
          trunkNumber: parseInt(trunkNumber.value),
          sanitaryCondition: parseInt(
            document.getElementById("sanitary-condition").value
          ),
          lastChange: currentElement.lastChange,
        };
        console.log(JSON.stringify(currentElement));
        console.log(JSON.stringify(editedElement));
        if (JSON.stringify(editedElement) !== JSON.stringify(currentElement)) {
          console.log("update tree");
          console.log(editedElement);
          store.set("currentElement", editedElement);

          const properties = elementCardContent.querySelectorAll("span");
          properties[0].innerText = `${editedElement.height} см`;
          properties[1].innerText = `${editedElement.trunkDiameter} см`;
          properties[2].innerText = `${AGE_CLASS[editedElement.age]}`;
          properties[3].innerText = `${editedElement.crownProjection} см`;
          properties[4].innerText = `${editedElement.trunkNumber} шт`;
          properties[5].innerText = `${ASSESSMENT[editedElement.assessment]}`;
          properties[6].innerText = `${
            SANITARY[editedElement.sanitaryCondition]
          }`;
          if (editedElement.typeOfDamage.length !== 0) {
            properties[7].innerText = `${editedElement.typeOfDamage.map(
              (item) => DAMAGE[item]
            )}`;
            properties[7].parentElement.style.display = "";
          } else {
            properties[7].parentElement.style.display = "none";
          }
          if (editedElement.recommendation.length !== 0) {
            properties[8].innerText = `${editedElement.recommendation.map(
              (item) => RECOMMENDATION[item]
            )}`;
            properties[8].parentElement.style.display = "";
          } else {
            properties[8].parentElement.style.display = "none";
          }
          if (
            editedElement.comment !== "" &&
            editedElement.comment != undefined
          ) {
            properties[9].innerText = `${editedElement.comment}`;
            properties[9].parentElement.style.display = "";
          } else {
            properties[9].parentElement.style.display = "none";
          }

          const elementCardLastEdit = $(".element-card__last-edit");
          elementCardLastEdit.innerText = `Последнее изменение ${dateTimeToString(
            new Date()
          )}`;
          elementCardLastEdit.classList.remove("hide");
        }
      } else {
        console.log("not correct");
        return;
      }
    }
    // Общий выход из режима редактирования
    elementCardContent
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
  console.log("img loaded");
  elementCardImgLoader.classList.remove("loader");
  elementCardImg.classList.remove("hide");
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
    const content = $(".element-card__main");

    store.get("elementOverlay").setPosition(coordinates);
    elementCardLoader.classList.add("loader");
    content.classList.add("hide");
    fetchElement(store.get("currentObjectID"), elemID, elemType).then(
      (elem) => {
        store.set("currentElement", elem);

        content.classList.remove("hide");
        elementCardLoader.classList.remove("loader");

        if (elem.lastChange) {
          elementCardLastEdit.innerText = `Последнее изменение ${dateTimeToString(
            new Date(elem.lastChange)
          )}`;
          elementCardLastEdit.classList.remove("hide");
        } else {
          elementCardLastEdit.classList.add("hide");
        }

        elementCardImgLoader.classList.add("loader");
        elementCardImg.classList.add("hide");
        elementCardName.value = elem.name;
        elementCardContent.innerHTML = "";

        if (elemType === "tree") {
          elementCardType.innerText = "дерево";
          elementCardType.classList.remove(`element-card__type--furniture`);
          elementCardControlEdit.classList.remove(
            `element-card__edit--furniture`
          );
          elementCardType.classList.add(`element-card__type--tree`);
          elementCardControlEdit.classList.add(`element-card__edit--tree`);

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

          elementCardContent.appendChild(templateTree);

          // Повреждения
          const typeOfDamage = document.getElementById("damage");
          // Обработчик события select повреждений
          typeOfDamage
            .querySelector(".element-card__editable-field")
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
                .querySelector(".element-card__editable-field")
                .options[optionIndex].classList.remove("hide");
            }
          });

          // Рекомендации
          const recommendation = document.getElementById("recommendation");
          // Обработчик события select рекомендаций
          recommendation
            .querySelector(".element-card__editable-field")
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
                .querySelector(".element-card__editable-field")
                .options[optionIndex].classList.remove("hide");
            }
          });
        } else if (elemType === "furniture") {
          elementCardType.innerText = "благоустройство";
          elementCardType.classList.remove(`element-card__type--tree`);
          elementCardControlEdit.classList.remove(`element-card__edit--tree`);
          elementCardType.classList.add(`element-card__type--furniture`);
          elementCardControlEdit.classList.add(`element-card__edit--furniture`);

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

          elementCardContent.appendChild(templateFurniture);
        }

        if (elem.photos) {
          elementCardImg.src = elem.photos;
        } else {
          elementCardImg.src = elementInfoImgDefault;
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
  const typeOfDamage = document.getElementById("damage");
  const templateSelectedOption = document
    .getElementById("template-selected-option")
    .content.cloneNode(true);
  const pElem = templateSelectedOption.querySelector("p");
  pElem.textContent = DAMAGE[damageId];
  pElem.dataset.optionIndex = damageId + 1;

  typeOfDamage.appendChild(templateSelectedOption);

  const typeOfDamageOptions = typeOfDamage.querySelector(
    ".element-card__editable-field"
  ).options;
  // + 1 исключает первый option "выбрать"
  typeOfDamageOptions[damageId + 1].classList.add("hide");
}

function insertRecommendationById(recommendationId) {
  const recommendation = document.getElementById("recommendation");
  const templateSelectedOption = document
    .getElementById("template-selected-option")
    .content.cloneNode(true);
  const pElem = templateSelectedOption.querySelector("p");
  pElem.textContent = RECOMMENDATION[recommendationId];
  pElem.dataset.optionIndex = recommendationId + 1;

  recommendation.appendChild(templateSelectedOption);

  const recommendationOptions = recommendation.querySelector(
    ".element-card__editable-field"
  ).options;
  // + 1 исключает первый option "выбрать"
  recommendationOptions[recommendationId + 1].classList.add("hide");
}

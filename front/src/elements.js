import { Feature } from "ol";
import { fetchElement, fetchElements } from "./fetches";
import { Point } from "ol/geom";
import store from "./store";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import { $, AGE, ASSESSMENT, DAMAGE, RECOMMENDATION, SANITARY } from "./utils";

const elementCardImgDefault =
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
function exitEditMode() {
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

export function removingElement() {
  const currentFeature = store.get("elementSelect").getFeatures().item(0);
  store.get("elementVectorSource").removeFeature(currentFeature);
  console.log(
    `DELETE ${currentFeature.getProperties().type} with ID - ${
      currentFeature.getProperties().id
    }`
  );
  exitingElement();
}

export function editingElement() {
  const currentElement = store.get("currentElement");
  // Если вошли в режим редактирования
  if (elementCardControlRemove.classList.contains("hide")) {
    elementCardControlEdit.textContent = "Сохранить";
    elementCardControlRemove.classList.remove("hide");

    elementCardName.disabled = false; // Вкл возможность редактировать название элемента
    elementCardName.classList.add("element-card__editable-field");

    store.get("elementModify").setActive(true);

    elementCardContent
      .querySelectorAll("li")
      .forEach((li) => li.classList.toggle("hide"));

    // Если редактуриуется - общее
    // Установка примечания
    elementCardContent.querySelector(`#comment`).value = currentElement.comment;
    // Установка оценки
    elementCardContent.querySelector(
      `#assessment > option:nth-of-type(${currentElement.assessment + 1})`
    ).selected = true;

    // Если редактируются - дерево
    if (elementCardControlEdit.classList.contains("element-card__edit--tree")) {
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

      // Установка санитарного состояния
      elementCardContent.querySelector(
        `#sanitary-condition > option:nth-of-type(${
          currentElement.sanitaryCondition + 1
        })`
      ).selected = true;

      // Повреждения
      const damage = document.getElementById("damage");
      // Чтобы измежать повторного добавления
      if (
        currentElement.damage !== 0 &&
        damage.querySelectorAll(".element-card__selected-option").length === 0
      ) {
        // Установка повреждений в карточку элемента и удаление их из select
        currentElement.damage.forEach((i) => {
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
    }
  } else {
    console.log("save");

    // Если сохраняется благоустройство
    if (
      elementCardControlEdit.classList.contains("element-card__edit--furniture")
    ) {
      // Валидация названия
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
      const height = $("#height");
      const trunkDiameter = $("#trunk-diameter");
      const crownProjection = $("#crown-projection");
      const trunkNumber = $("#trunk-number");

      let isCorrect = true;

      // Валидация названия
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
      // Валидация высоты
      if (height.value < 1) {
        height.parentElement.nextElementSibling.classList.remove("hide");
        startAnimation(height.parentElement.nextElementSibling, "shake");
        height.classList.add("element-card__editable-field--error");
        isCorrect = false;
      } else {
        height.parentElement.nextElementSibling.classList.add("hide");
        height.classList.remove("element-card__editable-field--error");
      }
      // Валидация диаметра ствола
      if (trunkDiameter.value < 1) {
        trunkDiameter.parentElement.nextElementSibling.classList.remove("hide");
        startAnimation(trunkDiameter.parentElement.nextElementSibling, "shake");
        trunkDiameter.classList.add("element-card__editable-field--error");
        isCorrect = false;
      } else {
        trunkDiameter.parentElement.nextElementSibling.classList.add("hide");
        trunkDiameter.classList.remove("element-card__editable-field--error");
      }
      // Валидация проекции кроны
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
      // Валидация стволов
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
        const selectedDamages = document.querySelector(
          "#damage .element-card__editable-field"
        );
        const damage = [];
        Array.from(selectedDamages.options).forEach((i, index) => {
          if (i.classList.contains("hide")) {
            damage.push(index - 1);
          }
        });

        //  Получение установелнных ИД рекомендаций
        const selectedRecommendations = document.querySelector(
          "#recommendation .element-card__editable-field"
        );
        const recommendation = [];
        Array.from(selectedRecommendations.options).forEach((i, index) => {
          if (i.classList.contains("hide")) {
            recommendation.push(index - 1);
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
          height: parseInt(height.value),
          trunkDiameter: parseInt(trunkDiameter.value),
          assessment: parseInt(document.getElementById("assessment").value),
          comment: document.getElementById("comment").value,
          age: parseInt(document.getElementById("age").value),
          crownProjection: parseInt(crownProjection.value),
          damage: damage,
          recommendation: recommendation,
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
          properties[2].innerText = `${AGE[editedElement.age]}`;
          properties[3].innerText = `${editedElement.crownProjection} см`;
          properties[4].innerText = `${editedElement.trunkNumber} шт`;
          properties[5].innerText = `${ASSESSMENT[editedElement.assessment]}`;
          properties[6].innerText = `${
            SANITARY[editedElement.sanitaryCondition]
          }`;
          if (editedElement.damage.length !== 0) {
            properties[7].innerText = `${editedElement.damage.map(
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
      .forEach((li) => li.classList.toggle("hide"));

    exitEditMode();
  }
}

export function exitingElement() {
  store.get("elementOverlay").setPosition(undefined);
  store.get("elementSelect").getFeatures().clear();
  exitEditMode();
}

export function loadingImageOfElement() {
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

export async function selectElement(e) {
  const selectedMarker = e.target.getFeatures().item(0);

  if (selectedMarker) {
    // Выбираем элемент
    exitEditMode();

    const selectedMarkerCoords = selectedMarker.getGeometry().getCoordinates();
    const selectedElementId = selectedMarker.getProperties().id;
    const selectedElementType = selectedMarker.getProperties().type;
    const elementCardMain = $(".element-card__main");

    store.get("elementOverlay").setPosition(selectedMarkerCoords);
    elementCardLoader.classList.add("loader");
    elementCardMain.classList.add("hide");

    const selectedElement = await fetchElement(
      store.get("currentObjectID"),
      selectedElementId,
      selectedElementType
    );

    store.set("currentElement", selectedElement);
    elementCardMain.classList.remove("hide");
    elementCardLoader.classList.remove("loader");

    if (selectedElement.lastChange) {
      elementCardLastEdit.innerText = `Последнее изменение ${dateTimeToString(
        new Date(selectedElement.lastChange)
      )}`;
      elementCardLastEdit.classList.remove("hide");
    } else {
      elementCardLastEdit.classList.add("hide");
    }

    elementCardImgLoader.classList.add("loader");
    elementCardImg.classList.add("hide");
    elementCardName.value = selectedElement.name;
    elementCardContent.innerHTML = "";

    if (selectedElementType === "tree") {
      elementCardType.innerText = "дерево";
      elementCardType.classList.remove(`element-card__type--furniture`);
      elementCardControlEdit.classList.remove(`element-card__edit--furniture`);
      elementCardType.classList.add(`element-card__type--tree`);
      elementCardControlEdit.classList.add(`element-card__edit--tree`);

      const templateTree = document
        .getElementById("template-tree")
        .content.cloneNode(true);

      const properties = templateTree.querySelectorAll("span");
      properties[0].innerText = `${selectedElement.height} см`;
      properties[1].innerText = `${selectedElement.trunkDiameter} см`;
      properties[2].innerText = `${AGE[selectedElement.age]}`;
      properties[3].innerText = `${selectedElement.crownProjection} см`;
      properties[4].innerText = `${selectedElement.trunkNumber} шт`;
      properties[5].innerText = `${ASSESSMENT[selectedElement.assessment]}`;
      properties[6].innerText = `${
        SANITARY[selectedElement.sanitaryCondition]
      }`;
      if (selectedElement.damage.length !== 0) {
        properties[7].innerText = `${selectedElement.damage.map(
          (item) => DAMAGE[item]
        )}`;
        properties[7].parentElement.style.display = "";
      } else {
        properties[7].parentElement.style.display = "none";
      }

      if (selectedElement.recommendation.length !== 0) {
        properties[8].innerText = `${selectedElement.recommendation.map(
          (item) => RECOMMENDATION[item]
        )}`;
        properties[8].parentElement.style.display = "";
      } else {
        properties[8].parentElement.style.display = "none";
      }
      if (
        selectedElement.comment !== "" &&
        selectedElement.comment != undefined
      ) {
        properties[9].innerText = `${selectedElement.comment}`;
        properties[9].parentElement.style.display = "";
      } else {
        properties[9].parentElement.style.display = "none";
      }

      elementCardContent.appendChild(templateTree);

      // Повреждения
      const damage = document.getElementById("damage");
      // Обработчик события select повреждений
      damage
        .querySelector(".element-card__editable-field")
        .addEventListener("change", (i) => {
          const damageId = i.currentTarget.selectedIndex;
          insertDamageById(damageId - 1);

          i.currentTarget.value = "выбирите";
        });

      // Обработчик события удаления повреждения
      damage.addEventListener("click", (i) => {
        if (i.target instanceof HTMLButtonElement) {
          const optionIndex =
            i.target.previousElementSibling.dataset.optionIndex;
          i.target.parentElement.remove();
          damage
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
    } else if (selectedElementType === "furniture") {
      elementCardType.innerText = "благоустройство";
      elementCardType.classList.remove(`element-card__type--tree`);
      elementCardControlEdit.classList.remove(`element-card__edit--tree`);
      elementCardType.classList.add(`element-card__type--furniture`);
      elementCardControlEdit.classList.add(`element-card__edit--furniture`);

      const templateFurniture = document
        .getElementById("template-furniture")
        .content.cloneNode(true);
      const properties = templateFurniture.querySelectorAll("span");

      properties[0].innerText = `${ASSESSMENT[selectedElement.assessment]}`;

      if (
        selectedElement.comment !== "" &&
        selectedElement.comment != undefined
      ) {
        properties[1].innerText = `${selectedElement.comment}`;
        properties[1].parentElement.style.display = "";
      } else {
        properties[1].parentElement.style.display = "none";
      }

      elementCardContent.appendChild(templateFurniture);
    }

    if (selectedElement.photos) {
      elementCardImg.src = selectedElement.photos;
    } else {
      elementCardImg.src = elementCardImgDefault;
    }

    console.log(selectedElement);
  } else {
    // Вышли из элемента кликнув на пустое место на карте
    exitEditMode();
    store.get("elementOverlay").setPosition(undefined);
  }
}

export async function updateMarkers() {
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

function startAnimation(elementHtml, animationName) {
  elementHtml.classList.remove(animationName); // удалене анимации тряски
  elementHtml.offsetWidth; // Принудительная переоценка, чтобы сбросить анимацию
  elementHtml.classList.add(animationName); // анимация тряски
}

function insertDamageById(damageId) {
  const damage = document.getElementById("damage");
  const templateSelectedOption = document
    .getElementById("template-selected-option")
    .content.cloneNode(true);
  const pElem = templateSelectedOption.querySelector("p");
  pElem.textContent = DAMAGE[damageId];
  pElem.dataset.optionIndex = damageId + 1;

  damage.appendChild(templateSelectedOption);

  const damageOptions = damage.querySelector(
    ".element-card__editable-field"
  ).options;
  // + 1 исключает первый option "выбрать"
  damageOptions[damageId + 1].classList.add("hide");
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

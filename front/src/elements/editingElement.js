import store from "../store";
import { dateTimeToString, startAnimation } from "../utils";
import { exitEditMode } from "./exitEditMode";
import { updateProperties } from "./updateProperies";
import { insertDamageById, insertRecommendationById } from "./utils";

export function editingElement() {
  const elementCardControlRemove = document.querySelector(
    ".element-card__remove"
  );
  const elementCardName = document.querySelector(".element-card__name");
  const elementCardContent = document.querySelector(".element-card__content");
  const elementCardControlEdit = document.querySelector(".element-card__edit");

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

        updateProperties("furniture", elementCardContent, editedElement);

        const elementCardLastEdit = document.querySelector(
          ".element-card__last-edit"
        );
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
      const height = document.querySelector("#height");
      const trunkDiameter = document.querySelector("#trunk-diameter");
      const crownProjection = document.querySelector("#crown-projection");
      const trunkNumber = document.querySelector("#trunk-number");

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

          updateProperties("tree", elementCardContent, editedElement);

          const elementCardLastEdit = document.querySelector(
            ".element-card__last-edit"
          );
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

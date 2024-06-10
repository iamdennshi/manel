import { exitEditMode } from "./exitEditMode";
import store from "./../store";
import { fetchElement } from "../fetches";
import { dateTimeToString } from "../utils";
import { insertDamageById, insertRecommendationById } from "./utils";
import { elementCardImgDefault } from "./image";
import { updateProperties } from "./updateProperies";

export async function selectingElement(e) {
  const elementCardType = document.querySelector(".element-card__type");
  const elementCardLastEdit = document.querySelector(
    ".element-card__last-edit"
  );
  const elementCardLoader = document.querySelector(".element-card__loader");
  const elementCardImg = document.querySelector(".element-card__img");
  const elementCardImgLoader = document.querySelector(
    ".element-card__img-loader"
  );
  const elementCardName = document.querySelector(".element-card__name");
  const elementCardContent = document.querySelector(".element-card__content");
  const elementCardControlEdit = document.querySelector(".element-card__edit");
  const selectedMarker = e.target.getFeatures().item(0);

  if (selectedMarker) {
    // Выбираем элемент
    exitEditMode();

    const selectedMarkerCoords = selectedMarker.getGeometry().getCoordinates();
    const selectedElementId = selectedMarker.getProperties().id;
    const selectedElementType = selectedMarker.getProperties().type;
    const elementCardMain = document.querySelector(".element-card__main");

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

      updateProperties("tree", templateTree, selectedElement);

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

      updateProperties("furniture", templateFurniture, selectedElement);

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

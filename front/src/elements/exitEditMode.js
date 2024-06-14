import store from "./../store";
import { getMarkerStyle } from "./markers";

const elementCardControlRemove = document.querySelector(
  ".element-card__remove"
);
const elementCardName = document.querySelector(".element-card__name");
const elementCardControlEdit = document.querySelector(".element-card__edit");

// Обнулить режим редактирования если находились в нем
export function exitEditMode() {
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

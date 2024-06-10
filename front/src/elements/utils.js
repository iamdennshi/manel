import { DAMAGE, RECOMMENDATION } from "../utils";

export function insertDamageById(damageId) {
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

export function insertRecommendationById(recommendationId) {
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

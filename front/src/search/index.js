import { hideNav, showNav } from "../menu";
import store from "../store";

const searchInputField = document.querySelector(".search__input-field");
const overlay = document.getElementById("search-overlay");
const searchElements = document.querySelector(".search__elements");
const searchInput = document.querySelector(".search__input");
const search = document.querySelector(".search__wrapper");

export function showSearch() {
  const search = document.querySelector(".search");
  search.classList.remove("search--hide");
}

export function hideSearch() {
  const search = document.querySelector(".search");
  search.classList.add("search--hide");
}

export function clickOnSearchLiElement(e) {
  const objects = store.get("objects");
  const currentObject = objects[store.get("currentObjectID")];
  const target = e.target;

  showNav();

  // Если выбрана li с уже выбранным объектом
  if (target.dataset.id == store.get("currentObjectID")) {
    searchInputField.value = currentObject.address;
  } else {
    const currentObjectId = store.set("currentObjectID", target.dataset.id);
    searchInputField.textContent = objects[currentObjectId].address;
  }
  overlay.classList.add("overlay--hide");
  searchElements.classList.add("search__elements--hide");
  searchInput.classList.remove("search__input--showing-elements");
  search.classList.remove("search__wrapper--showing-elements");
  e.stopPropagation(); // prevent clickOnSearch
}

export function clickOnSearch() {
  hideNav();
  searchElements.classList.remove("search__elements--hide");
  search.classList.add("search__wrapper--showing-elements");
  searchInput.classList.add("search__input--showing-elements");

  overlay.classList.remove("overlay--hide");
  searchInputField.focus();
}

export function clickOnSearchOverlay() {
  if (!overlay.classList.contains("overlay--hide")) {
    overlay.classList.add("overlay--hide");
    searchElements.classList.add("search__elements--hide");
    searchInput.classList.remove("search__input--showing-elements");
    search.classList.remove("search__wrapper--showing-elements");

    showNav();
    if (searchInputField.classList.contains("search__input-field--error")) {
      searchInputField.classList.remove("search__input-field--error");
    }
  }
}

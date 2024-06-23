import { hideMenu, showMenu } from "../menu";
import store from "../store";

const searchInputField = document.querySelector(".search__input-field");
const overlay = document.querySelector(".overlay");
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

  showMenu();

  // Если выбрана li с уже выбранным объектом
  if (target.dataset.id == store.get("currentObjectID")) {
    searchInputField.value = currentObject.address;
  } else {
    const currentObjectId = store.set("currentObjectID", target.dataset.id);
    searchInputField.value = objects[currentObjectId].address;
  }
  overlay.classList.add("overlay--hide");
  searchElements.classList.add("search__elements--hide");
  searchInput.classList.remove("search__input--showing-elements");
  search.classList.remove("search__wrapper--showing-elements");
  e.stopPropagation(); // prevent clickOnSearch
}

export function clickOnSearchClear(e) {
  searchInputField.value = "";
  searchInputField.dispatchEvent(new Event("input"));
  overlay.classList.remove("overlay--hide");
  searchInputField.focus();
  hideMenu();
  e.stopPropagation(); // prevent clickOnSearch
}

export function clickOnSearch(e, addressObjects) {
  hideMenu();
  searchElements.classList.remove("search__elements--hide");
  search.classList.add("search__wrapper--showing-elements");
  searchInput.classList.add("search__input--showing-elements");

  overlay.classList.remove("overlay--hide");
  searchInputField.focus();
  updateSearchLiElements(addressObjects);
}

export function changeSearchInputField(e, addressObjects) {
  const currentInputedAddress = searchInputField.value;
  const correspondingAddress = addressObjects.filter((obj) =>
    obj.address.includes(currentInputedAddress)
  );

  if (overlay.classList.contains("overlay--hide")) {
    overlay.classList.remove("overlay--hide");
  }

  if (correspondingAddress.length !== 0) {
    searchElements.classList.remove("search__elements--hide");
    searchInputField.classList.remove("search__input-field--error");
    search.classList.add("search__wrapper--showing-elements");
    searchInput.classList.add("search__input--showing-elements");
    updateSearchLiElements(addressObjects, correspondingAddress);
  } else {
    searchInputField.classList.add("search__input-field--error");
    searchElements.classList.add("search__elements--hide");
    search.classList.remove("search__wrapper--showing-elements");
    searchInput.classList.remove("search__input--showing-elements");
  }
}

export function clickOnSearchOverlay(e, addressObjects) {
  if (!overlay.classList.contains("overlay--hide")) {
    const objects = store.get("objects");
    const currentObject = objects[store.get("currentObjectID")];

    overlay.classList.add("overlay--hide");
    searchElements.classList.add("search__elements--hide");
    searchInput.classList.remove("search__input--showing-elements");
    search.classList.remove("search__wrapper--showing-elements");

    searchInputField.value = currentObject.address;

    showMenu();
    if (searchInputField.classList.contains("search__input-field--error")) {
      searchInputField.classList.remove("search__input-field--error");
      updateSearchLiElements(addressObjects);
    }
  }
}

export function updateSearchLiElements(addressObjects, listOfAddress) {
  const addresses =
    listOfAddress ??
    addressObjects.filter((obj) =>
      searchInputField.value.includes(obj.address)
    );
  searchElements.innerHTML = "";

  for (let obj of addresses) {
    const element = document.createElement("li");
    element.classList.add("search__element");
    element.textContent = obj.address;
    element.dataset.id = obj.id;
    searchElements.appendChild(element);
  }
}

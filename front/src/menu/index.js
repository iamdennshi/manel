import { toLonLat } from "ol/proj";
import store from "../store";

const nav = document.querySelector(".nav");

export function hideAddElements() {
  const elementsToAdd = document.querySelector(".nav__add-elements");
  if (!elementsToAdd.classList.contains("nav__add-elements--hidden")) {
    const addButton = document.querySelector(".nav__button-add");
    elementsToAdd.classList.add("nav__add-elements--hidden");
    addButton.classList.remove("nav__button-add--active");
  }
}

export function hideNav() {
  nav.classList.add("nav--hide");
  if (store.get("selectedNavItem") !== 0) {
    store.set("selectedNavItem", 0);
  }

  // Если происходит выбор элемента для добавления, возвращаем по умолчанию
  hideAddElements();

  const elementsToDisableTab = nav.querySelectorAll("button");
  elementsToDisableTab.forEach((elem) => {
    elem.tabIndex = -1;
  });
}

export function showNav() {
  nav.classList.remove("nav--hide");
  const elementsToEnableTab = nav.querySelectorAll("button");
  elementsToEnableTab.forEach((elem) => {
    elem.tabIndex = 1;
  });
}

export function clickOnNavAdd(e) {
  if (store.get("selectedNavItem") !== 0) {
    store.set("selectedNavItem", 0);
  }
  const addButton = e.currentTarget;
  const elementsToAdd = document.querySelector(".nav__add-elements");
  elementsToAdd.classList.toggle("nav__add-elements--hidden");
  addButton.classList.toggle("nav__button-add--active");
}

export function clickOnNavElement(e) {
  const target = e.target;
  let elementId;
  if (target.tagName === "IMG") {
    elementId = target.parentElement.parentElement.dataset.id;
  } else if (target.tagName === "BUTTON") {
    elementId = target.dataset.id;
  } else if (target.parentElement.tagName === "BUTTON") {
    elementId = target.parentElement.dataset.id;
  }

  if (elementId) {
    if (Number(elementId) !== store.get("selectedNavItem")) {
      store.set("selectedNavItem", Number(elementId));
    }
  }
}

export function changeSelectedNavItem(oldValue, newValue) {
  const navSides = document.querySelectorAll(".nav__side");
  const page = document.querySelector(".page");
  const pageItem = document.querySelector(
    `.page__item:nth-of-type(${newValue}`
  );

  let selectedNavLi, willSelectedNavLi;

  if (oldValue === 0 || oldValue === 1) {
    selectedNavLi = navSides[0].querySelectorAll(".nav__item")[oldValue];
  } else {
    selectedNavLi = navSides[1].querySelectorAll(".nav__item")[oldValue - 2];
  }

  if (newValue === 0 || newValue === 1) {
    willSelectedNavLi = navSides[0].querySelectorAll(".nav__item")[newValue];
  } else {
    willSelectedNavLi =
      navSides[1].querySelectorAll(".nav__item")[newValue - 2];
  }

  if (oldValue != 0) {
    page.classList.remove("page--active");
  } else {
    page.classList.add("page--active");
    pageItem.classList.remove("page__item--hidden");
  }

  hideAddElements();

  // Нажали на уведомление
  if (newValue === 2) {
    document
      .querySelector("[data-id='2']")
      .classList.remove("nav__button--noticed");
  }

  selectedNavLi.classList.remove("nav__item--active");
  willSelectedNavLi.classList.add("nav__item--active");
}

export function transitionPageEnd(e) {
  const selectedNav = store.get("selectedNavItem");
  if (selectedNav !== 0) {
    const page = document.querySelector(".page");
    page.classList.add("page--active");
  }
  document.querySelectorAll(".page__item").forEach((item, index) => {
    if (selectedNav > 0 && index === selectedNav - 1) {
      item.classList.remove("page__item--hidden");
    } else {
      item.classList.add("page__item--hidden");
    }
  });
}

export function updateObjectStatInMenu() {
  const currentObject = store.get("currentObjectID");
  const currentObjectInfo = store.get("objects")[currentObject];
  const elementsOfStats = {
    name: document.getElementById("object-name"),
    totalArea: document.getElementById("object-total-area"),
    coords: document.getElementById("object-coords"),

    greenTotalArea: document.getElementById("green-total-area"),
    treeNumber: document.getElementById("tree-number"),
    treeTotalArea: document.getElementById("tree-total-area"),
    damagedTreeNumber: document.getElementById("damaged-tree-number"),
    damagedTreeTotalArea: document.getElementById("damaged-tree-total-area"),
    shrubNumber: document.getElementById("shrub-number"),
    shrubTotalArea: document.getElementById("shrubTotalArea"),
    damagedShrubNumber: document.getElementById("damaged-shrub-number"),
    damagedShrubTotalArea: document.getElementById("damaged-shrub-total-area"),
    flowerNumber: document.getElementById("flower-number"),
    flowerTotalArea: document.getElementById("flower-total-area"),
    damagedFlowerNumber: document.getElementById("damaged-flower-number"),
    damagedFlowerTotalArea: document.getElementById(
      "damaged-flower-total-area"
    ),
    grassNumber: document.getElementById("grass-number"),
    grassTotalArea: document.getElementById("grass-total-area"),
    damagedGrassNumber: document.getElementById("damaged-grass-number"),
    damagedGrassTotalArea: document.getElementById("damaged-grass-total-area"),

    orangeTotalArea: document.getElementById("orange-total-area"),
    mafNumber: document.getElementById("maf-number"),
    damagedMafNumber: document.getElementById("damaged-maf-number"),
    walkNumber: document.getElementById("walk-number"),
    walkTotalArea: document.getElementById("walk-total-area"),
    damagedWalkNumber: document.getElementById("damaged-walk-number"),
    damagedWalkTotalArea: document.getElementById("damaged-walk-total-area"),
  };
  const normalCoords = toLonLat(currentObjectInfo.cords).map((i) =>
    i.toFixed(4)
  );
  const totalTrees = (elementsOfStats.name.textContent =
    currentObjectInfo.address);
  elementsOfStats.totalArea.textContent = currentObjectInfo.totalArea;
  elementsOfStats.coords.textContent = `${normalCoords[1]}, ${normalCoords[0]}`;

  console.log(currentObjectInfo);

  if (currentObject == 0) {
    elementsOfStats.treeNumber.textContent = 2;
    elementsOfStats.treeTotalArea.textContent = 2.5;
    elementsOfStats.greenTotalArea.textContent = 2.5;
    elementsOfStats.walkNumber.textContent = 2;
    elementsOfStats.walkTotalArea.textContent = 678.24 + 1339.77;
    elementsOfStats.orangeTotalArea.textContent = 678.24 + 1339.77;
    elementsOfStats.mafNumber.textContent = 1;
  }
}

import store from "../store";

const nav = document.querySelector(".nav");

export function hideNav() {
  nav.classList.add("nav--hide");
  if (store.get("selectedNavItem") !== 0) {
    store.set("selectedNavItem", 0);
  }
}

export function showNav() {
  nav.classList.remove("nav--hide");
}

export function clickOnNavAdd(e) {
  console.log("click add");
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

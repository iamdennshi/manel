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

export function transitionPageEnd(e) {
  const selectedNav = store.get("selectedNavItem");
  if (selectedNav !== 0) {
    const page = document.querySelector(".page");
    page.classList.add("page--active");
  }
}

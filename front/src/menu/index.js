import store from "../store";

const menu = document.querySelector(".menu");

export function hideMenu() {
  menu.classList.add("menu--hide");
  store.set("selectedMenuItem", 0);
}

export function showMenu() {
  menu.classList.remove("menu--hide");
}

export function clickOnMenuAdd(e) {
  console.log("click add");
}

export function clickOnMenuElement(e) {
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
    if (Number(elementId) !== store.get("selectedMenuItem")) {
      store.set("selectedMenuItem", Number(elementId));
    }
  }
}

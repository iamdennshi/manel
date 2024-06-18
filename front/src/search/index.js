export function showSearch() {
  const search = document.querySelector(".search");
  search.classList.remove("search--hide");
}

export function hideSearch() {
  const search = document.querySelector(".search");
  search.classList.add("search--hide");
}

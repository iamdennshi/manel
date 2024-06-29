export function showControls() {
  const controls = document.querySelector(".ol-zoom");
  controls.classList.remove("ol-zoom--hidden");
}

export function hideControls() {
  const controls = document.querySelector(".ol-zoom");
  controls.classList.add("ol-zoom--hidden");
}

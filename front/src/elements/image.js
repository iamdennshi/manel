export const elementCardImgDefault =
  "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";

export function loadingImageOfElement() {
  const elementCardImg = document.querySelector(".element-card__img");
  const elementCardImgLoader = document.querySelector(
    ".element-card__img-loader"
  );
  elementCardImgLoader.classList.remove("loader");
  elementCardImg.classList.remove("hide");
}

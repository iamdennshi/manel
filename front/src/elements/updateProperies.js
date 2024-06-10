import { AGE, ASSESSMENT, DAMAGE, RECOMMENDATION, SANITARY } from "../utils";

export function updateProperties(type, elementHtml, data) {
  const properties = elementHtml.querySelectorAll("span");
  if (type === "tree") {
    properties[0].innerText = `${data.height} см`;
    properties[1].innerText = `${data.trunkDiameter} см`;
    properties[2].innerText = `${AGE[data.age]}`;
    properties[3].innerText = `${data.crownProjection} см`;
    properties[4].innerText = `${data.trunkNumber} шт`;
    properties[5].innerText = `${ASSESSMENT[data.assessment]}`;
    properties[6].innerText = `${SANITARY[data.sanitaryCondition]}`;
    if (data.damage.length !== 0) {
      properties[7].innerText = `${data.damage.map((item) => DAMAGE[item])}`;
      properties[7].parentElement.style.display = "";
    } else {
      properties[7].parentElement.style.display = "none";
    }
    if (data.recommendation.length !== 0) {
      properties[8].innerText = `${data.recommendation.map(
        (item) => RECOMMENDATION[item]
      )}`;
      properties[8].parentElement.style.display = "";
    } else {
      properties[8].parentElement.style.display = "none";
    }
    if (data.comment !== "" && data.comment != undefined) {
      properties[9].innerText = `${data.comment}`;
      properties[9].parentElement.style.display = "";
    } else {
      properties[9].parentElement.style.display = "none";
    }
  } else if (type === "furniture") {
    properties[0].innerText = `${ASSESSMENT[data.assessment]}`;
    if (data.comment !== "" && data.comment != undefined) {
      properties[1].innerText = `${data.comment}`;
      properties[1].parentElement.style.display = "";
    } else {
      properties[1].parentElement.style.display = "none";
    }
  }
}

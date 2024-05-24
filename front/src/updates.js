import { fetchElements, fetchElement } from "./fetches";
import store from "./store";
import { $ } from "./utils";

export async function updateElements() {
  const currentObjectID = store.get("currentObjectID");
  const elements = await fetchElements(currentObjectID);
  console.log(elements);
  const geoObjects = store.get("map").geoObjects;
  geoObjects.getLength() && geoObjects.removeAll();

  const BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
    `<div class="card">
      <div class="card__img-container">
        <img class="card__img" src="{{ properties.photos[0] }}"/>
      </div>
      <div class="card__info-container">
        <input type="text" maxlength="18" class="card__input card__input--title" disabled value="{{ properties.name }}" />
        {% if (properties.type === "tree") %}<p class="card__type card__type--tree">дерево</p>{% else %}<p class="card__type card__type--furniture">МАФ</p>{% endif %}
        
      </div>
      <div class="card__control-container">
        <button class="card__button card_button--edit">Редактировать</button>
        <button class="card__button card__button--remove card__button--disabled">Удалить</button>
      </div>
    <div>`,
    {
      build: function () {
        this.constructor.superclass.build.call(this);
        const editBtn = this.getElement().querySelector(".card_button--edit");
        const removeBtn = this.getElement().querySelector(
          ".card__button--remove"
        );
        const title = this.getElement().querySelector(".card__input--title");
        const element = this._data.geoObject;
        let oldData = null;

        // Редактирование элемента
        editBtn.addEventListener("click", () => {
          if (element.options.get("draggable")) {
            const currentObjectID = store.get("currentObjectID");
            const elementID = element.properties.get("id");
            const elementType = element.properties.get("type");
            const newData = { name: title.value };

            if (newData.name === "") {
              title.classList.add("card__input--error");
              return;
            }

            title.classList.remove("card__input--error");

            title.disabled = true;
            editBtn.textContent = "Редактировать";
            element.options.set("draggable", false);

            console.log(oldData, title.value);
            if (oldData !== title.value) {
              element.properties.set("hintContent", title.value);

              // Update element
              fetch(
                `http://192.168.0.13:8000/objects/${currentObjectID}/elements/${elementType}s/${elementID}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-type": "application/json",
                  },
                  body: JSON.stringify(newData),
                }
              );
            }
          } else {
            oldData = title.value;
            title.disabled = false;
            element.options.set("draggable", true);
            editBtn.textContent = "Сохранить";
          }
          removeBtn.classList.toggle("card__remove--disabled");
        });

        // Удаление элемента
        removeBtn.addEventListener("click", () => {
          geoObjects.remove(element);
        });
      },
    }
  );

  // Добавление деревьев
  for (const element of elements.trees) {
    geoObjects.add(createMark(element, "tree", BalloonContentLayout));
  }

  // Добавление МАФ
  for (const element of elements.furnitures) {
    geoObjects.add(createMark(element, "furniture", BalloonContentLayout));
  }
}

function createMark(element, type, layout) {
  const mark = new ymaps.Placemark(
    element.cords,
    {
      type: type,
      hintContent: element.name,
      iconContent: element.id,
    },
    {
      preset:
        type === "tree"
          ? "islands#darkGreenCircleIcon"
          : "islands#darkOrangeCircleIcon",
      // Заставляем балун открываться даже если в нем нет содержимого.
      openEmptyBalloon: true,
      hideIconOnBalloonOpen: false,
      iconOffset: [2, 14],
      balloonContentLayout: layout,
    }
  );

  mark.events.add("balloonopen", async function () {
    const currentObjectID = store.get("currentObjectID");
    const data = await fetchElement(currentObjectID, element.id, type);
    mark.properties.set("id", data.id);
    mark.properties.set("name", data.name);
    mark.properties.set("photos", data.photos);
  });

  mark.events.add("balloonclose", function () {
    if (mark.options.get("draggable")) {
      mark.options.set("draggable", false);
    }
  });

  return mark;
}

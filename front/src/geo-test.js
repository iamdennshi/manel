import { Feature, Map, Tile, View } from "ol";
import { Circle, Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { OSM, Vector } from "ol/source";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import store from "./store";
import { changeSelectedNavItem } from "./menu";

// Функция для получения координат пользователя
export default function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const map = store.get("map");
        const userLon = position.coords.longitude;
        const userLat = position.coords.latitude;
        console.log(userLon, userLat);

        // Обновление центра карты на координаты пользователя
        map.getView().setCenter(fromLonLat([userLon, userLat]));
        map.getView().setZoom(20); // Увеличить масштаб

        // Создание маркера для пользователя
        const userMarker = new Feature({
          geometry: new Point(fromLonLat([userLon, userLat])),
        });

        // Создание слоя для маркера
        const vectorSource = new Vector({
          features: [userMarker],
        });

        const vectorLayer = new Vector({
          source: vectorSource,
          style: new Style({
            image: new Circle({
              radius: 10,
              fill: new Fill({ color: "red" }),
              stroke: new Stroke({ color: "white", width: 2 }),
            }),
          }),
        });

        // Добавление слоя маркера на карту
        // map.addLayer(vectorLayer);
      },
      function () {
        alert("Ошибка получения местоположения.");
      }
    );
  } else {
    alert("Геолокация не поддерживается вашим браузером.");
  }
}

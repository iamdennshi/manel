import { Feature } from "ol";
import { fetchElements } from "../fetches";
import store from "../store";
import { MultiPoint, Point, Polygon } from "ol/geom";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";

export async function updateMarkers() {
  const elements = await fetchElements(store.get("currentObjectID"));
  const elementVectorSource = store.get("elementVectorSource");
  elementVectorSource.clear();

  const points = [...elements.trees, ...elements.furnitures];
  const pointMarks = points.map((elem) => {
    return new Feature({
      geometry: new Point([elem.cords[0], elem.cords[1]]),
      id: elem.id,
      name: elem.name,
      type: elem.type ? "furniture" : "tree",
    });
  });

  const areaMarks = elements.areas.map((elem) => {
    const oldCords = elem.cords;
    let newCords = [];

    if (oldCords.length % 2 !== 0)
      throw new Error("Fetched polygon cords from backend are incorrect");

    for (let i = 0; i < oldCords.length; i += 2) {
      newCords.push([oldCords[i], oldCords[i + 1]]);
    }
    newCords.push([oldCords[0], oldCords[1]]);

    return new Feature({
      geometry: new Polygon([newCords]),
      id: elem.id,
      name: elem.name,
      type: "area",
      areaType: elem.type,
    });
  });

  elementVectorSource.addFeatures([...pointMarks, ...areaMarks]);
}

export function getMarkerStyle(marker, markerType = "") {
  if (marker.getGeometry().getType() === "Point") {
    let stroke = new Stroke({
      color: "#ffffffaa",
    });

    if (markerType === "selected") {
      stroke = new Stroke({
        color: "#FF0000",
        width: 4,
      });
    } else if (markerType === "hover") {
      stroke = new Stroke({
        color: "#fff",
      });
    }

    return new Style({
      image: new CircleStyle({
        radius: 14,
        stroke: stroke,
        fill: new Fill(
          markerType == ""
            ? {
                color:
                  marker.get("type") === "tree" ? "#00A36Caa" : "#ff8c00aa",
              }
            : {
                color: marker.get("type") === "tree" ? "#00A36C" : "#ff8c00",
              }
        ),
      }),
      text: new Text({
        text: marker.get("id").toString(),
        fill: new Fill({
          color: "#fff",
        }),
      }),
    });
  } else {
    if (markerType === "editing") {
      return [
        new Style({
          stroke: new Stroke({
            color: "#FF0000",
            width: 4,
          }),
          fill: new Fill({
            color: marker.get("areaType") === 0 ? "#00A36C33" : "#ff8c0033",
          }),
        }),
        new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({
              color: "#FF0000",
            }),
          }),
          geometry: function (feature) {
            return new MultiPoint(feature.getGeometry().getCoordinates()[0]);
          },
        }),
      ];
    } else if (markerType === "selected") {
      return new Style({
        stroke: new Stroke({
          color:
            markerType === "selected"
              ? "#FF0000"
              : marker.get("areaType") === 0
              ? "#00A36Cff"
              : "#ff8c00ff",
          width: markerType === "selected" ? 4 : 2,
        }),
        fill: new Fill({
          color: marker.get("areaType") === 0 ? "#00A36C33" : "#ff8c0033",
        }),
      });
    } else {
      return new Style({
        stroke: new Stroke({
          color: marker.get("areaType") === 0 ? "#00A36Cff" : "#ff8c00ff",
          width: 2,
        }),
        fill: new Fill({
          color: marker.get("areaType") === 0 ? "#00A36C33" : "#ff8c0033",
        }),
      });
    }
  }
}

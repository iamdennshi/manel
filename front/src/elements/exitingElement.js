import store from "../store";
import { exitEditMode } from "./exitEditMode";

export function exitingElement() {
  store.get("elementOverlay").setPosition(undefined);
  store.get("elementSelect").getFeatures().clear();
  exitEditMode();
}
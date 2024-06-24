import { showNav } from "../menu";
import { showSearch } from "../search";
import store from "../store";
import { exitEditMode } from "./exitEditMode";

export function exitingElement() {
  store.get("elementOverlay").setPosition(undefined);
  store.get("elementSelect").getFeatures().clear();
  showSearch();
  showNav();
  exitEditMode();
}

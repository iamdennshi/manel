import "./src/styles/styles.scss";
import {
  initControlsForDebug,
  initStore,
  initMap,
  initSearch,
  initSubscribers,
  initHandlers,
  initInteractions,
  initMenu,
} from "./src/inits";
import store from "./src/store";

const __DEBUG__ = true;

(async function main() {
  // Определяем, запущено ли приложение через webview (Android)
  try {
    window.isAndroid = Android && true;
  } catch {
    window.isAndroid = false;
  }
  // Инициализация хранилища текущим ид объекта и списком всех объектов
  await initStore();
  // Инициализируем поиск
  await initSearch();
  // Инициализация меню
  await initMenu();
  // Дебаг для проверки сабов и данных в хранилище
  __DEBUG__ && initControlsForDebug();
  // Инициализируем карту и наполняем карту элементами
  await initMap();
  // Инициализируем Select, Overlay, Modify
  await initInteractions();
  // Инициализируем обработчики
  await initHandlers();
  // Подписываемся на изменения
  initSubscribers();
  // Чтобы не показывались вначале призрачные элементы
  store.get("map").getTarget().style.display = "";
})();

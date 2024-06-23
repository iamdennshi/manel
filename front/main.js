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

const __DEBUG__ = false;

(async function main() {
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
})();

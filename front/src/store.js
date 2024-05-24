// Модуль общего хранилища
export default (() => {
  let data = {}; // Хранилище данных
  let subscribes = {}; // Подписчики

  // Получение значения по ключу
  const get = (key) => {
    return data[key];
  };

  // Установка значения по ключу
  const set = (key, value) => {
    const oldValue = data[key];
    data[key] = value;
    subscribes[key] && subscribes[key](oldValue, value);
    return value;
  };

  // Удаление значения по ключу
  const remove = (key) => {
    delete data[key];
  };

  const subscribe = (key, callback) => {
    subscribes[key] = callback;
  };

  const showData = () => {
    console.dir(data);
  };

  const showSubscribes = () => {
    console.dir(subscribes);
  };

  // Возврат публичного интерфейса модуля
  return {
    get,
    set,
    remove,
    subscribe,
    showData,
    showSubscribes,
  };
})();

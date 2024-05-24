// Модуль общего хранилища
export default (() => {
  let data = {}; // Хранилище данных
  let subscribes = {}; // Подписчики

  // Получение значения по ключу
  const get = (key) => {
    return data[key];
  };

  // Инициализировать значение
  const init = (key, value) => {
    const oldValue = data[key];
    if (oldValue == undefined) {
      data[key] = value;
    } else {
      throw new Error(`key - ${key} is already init`);
    }
    return value;
  };

  // Изменить значение по ключу
  const set = (key, value) => {
    const oldValue = data[key];
    if (oldValue == undefined) {
      throw new Error(`key - ${key} is not init`);
    }
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
    init,
    get,
    set,
    remove,
    subscribe,
    showData,
    showSubscribes,
  };
})();

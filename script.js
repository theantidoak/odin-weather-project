const APIkey = 'e9a6614f553731a73dd13cc17e5ff8d9';
const newKey = 'a81219b80ce1a5beedb2640415a59cca';
const city = "London";
let weatherData;


const weatherFetchAPI = (async () => {
  await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`)
  .then(async (response) => console.log( await response.json() ))
  .catch((error) => console.log(error))
})();

const weatherAwaitAPI = (async () => {
  const apiCall = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`);

  try {
    weatherData = await apiCall.json();
    console.log(weatherData)
  } catch (error) {
    console.log(error);
  }
})();

const weatherResolvePromiseAPI = (() => {
  const apiPromise = Promise.resolve(fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`));
  const apiResponse = apiPromise.then((response) => response.json())
  apiResponse.then((response) => console.log( response )).catch((error) => console.log(error));
})();

const weatherNewPromiseAPI = (() => {
  return new Promise((resolve) => {
    resolve(fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`))
  })
  .then((response) => response.json())
  .then((response) => console.log( response ))
  .catch((error) => console.log(error))
})();
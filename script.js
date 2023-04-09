const weatherForm = (() => document.getElementById('weather-form'))();
const box = (() => document.querySelector(".box"))();
window.addEventListener("load", addFormListener)

function addFormListener() {
  weatherForm.addEventListener("submit", submitForm);
}

function loadScreenON() {
  box.classList.remove("load-off");
  box.classList.add("load-on");
}

function loadScreenOFF() {
  box.classList.remove("load-on");
  box.classList.add("load-off");
}

function renderGif(tempDepictionGif) {
  const imageElement = document.createElement("img");
  imageElement.src = tempDepictionGif;
  imageElement.setAttribute('style', 'height: 100%; width: 100%;')
  box.firstElementChild.replaceWith(imageElement);
}

const callGif = (tempDepiction) => {
  const giphyKey = 'aeev1OHOzg63e4CLueZKdGec1jr2ZmDr';
  const gifCall = Promise.resolve(fetch(`https://api.giphy.com/v1/gifs/translate?api_key=${giphyKey}&s=${tempDepiction}&limit=1&weirdness=5`));
  const gifData = gifCall.then((res) => res.json());
  
  gifData.then((res) => renderGif(res.data.images.original.url));
}

function handleGif(weatherData) {
  if (weatherData.weather[0].description.split(" ").length > 1) {
    return callGif(weatherData.weather[0].main);
  }

  return callGif(weatherData.weather[0].description);
}

function renderWeather(weatherData) {
  console.log(weatherData);
  console.log("Celcius", weatherData.main.temp_max - 273.15);
  console.log("Fahrenheit", ((weatherData.main.temp_max - 273.15) * 1.8) + 32);
}

async function callAltCountries(city) {
  const weatherKey = 'e9a6614f553731a73dd13cc17e5ff8d9';
  const geoCall = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${weatherKey}`);
  const geoData = await geoCall.json();

  return geoData;
}

async function callWeather(location) {
  const weatherKey = 'e9a6614f553731a73dd13cc17e5ff8d9';
  const weatherCall = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherKey}`);
  const weatherData = await weatherCall.json();
  const altLocations = await callAltCountries(weatherData.name);
  if (altLocations.length > 1) {
    return callWeatherByCoords(altLocations)
  }

  return weatherData;
}

async function callWeatherByCoords(altLocations) {
  console.log(altLocations);
  const lat = altLocations[0].lat;
  const lon = altLocations[0].lon;
  const weatherKey = 'e9a6614f553731a73dd13cc17e5ff8d9';
  const weatherCall = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}`);
  const weatherData = await weatherCall.json();

  return weatherData;
}

function handleFormSubmit() {
  const inputValue = document.querySelector("input[type=search]").value;
  
  new Promise((resolve) => {
    return setTimeout(() => resolve(callWeather(inputValue), 500));
  })
  .then((weatherData) => {
    renderWeather(weatherData);
    handleGif(weatherData);
  })
  .catch((error) => console.error(error))
  .finally(() => {
    weatherForm.reset();
    loadScreenOFF();
  })
}

function submitForm(e) {
  e.preventDefault();
  loadScreenON();
  handleFormSubmit();

  return false;
}
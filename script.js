const weatherForm = (() => document.getElementById('weather-form'))();
const box = (() => document.querySelector(".box"))();
const weatherSection = document.querySelector(".weather-info");
const altSection = document.querySelector(".alt-locations");
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

function renderAltCountries(weatherData) {
  console.log(weatherData);
  for (let i = 1; i < weatherData.length; i++) {
    const card = document.createElement('div');
    const text = document.createElement('p');
    const content = document.createTextNode(weatherData[i].name + ', ' + weatherData[i].country);
    text.appendChild(content)
    if (weatherData[i].state) {
      const stateContent = document.createTextNode(` (${weatherData[i].state})`);
      text.appendChild(stateContent);
    }
    card.appendChild(text);
    card.lat = weatherData[i].lat;
    card.lon = weatherData[i].lon;
    card.addEventListener('click', handleFormSubmit)
    altSection.appendChild(card)
  }
}

async function callAltCountries(city) {
  const weatherKey = 'e9a6614f553731a73dd13cc17e5ff8d9';
  const geoCall = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${weatherKey}`);
  const geoData = await geoCall.json();

  return geoData;
}

async function callWeatherByCoords(altLocations, otherLocation=false) {
  const lat = otherLocation ? altLocations : altLocations[0].lat;
  const lon = otherLocation ? otherLocation : altLocations[0].lon;
  console.log("lan", lat)
  console.log("lon", lon)
  const weatherKey = 'e9a6614f553731a73dd13cc17e5ff8d9';
  const weatherCall = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}`);
  const weatherData = await weatherCall.json();

  renderAltCountries(altLocations);

  return weatherData;
}

async function callWeather(location, e) {
  const weatherKey = 'e9a6614f553731a73dd13cc17e5ff8d9';
  const weatherCall = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherKey}`);
  const weatherData = await weatherCall.json();
  const altLocations = await callAltCountries(weatherData.name);
  if (altLocations.length > 1) {
    return callWeatherByCoords(altLocations);
  }

  return weatherData;
}

function handleWeather(e) {
  const inputValue = document.querySelector("input[type=search]").value;
  let promise;
  if (e && e.currentTarget.parentElement === altSection) {
    const coords = e.currentTarget;
    promise = new Promise((resolve) => {
      return setTimeout(() => resolve(callWeatherByCoords(coords.lat, coords.lon), 500));
    })
  } else {
    promise = new Promise((resolve) => {
      return setTimeout(() => resolve(callWeather(inputValue, e), 500));
    })
  }

  return promise;
}

function handleFormSubmit(e) {
  
  const promise = handleWeather(e);

  promise
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
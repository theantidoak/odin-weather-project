const weatherForm = (() => document.getElementById('weather-form'))();
const gifBtn = (() => document.querySelector(".gif-btn"))();
const box = (() => document.querySelector(".box"))();
const weatherSection = (() => document.querySelector(".weather-info"))();
const altSection = (() => document.querySelector(".alt-locations"))();
const degreesBtn = (() => document.querySelector(".degrees"))();
const speedBtn = (() => document.querySelector(".speed"))();
window.addEventListener("load", addEventHandlers)

// Global

function addEventHandlers() {
  weatherForm.addEventListener("submit", submitForm);
  gifBtn.addEventListener("click", toggleGif);
  degreesBtn.addEventListener("click", changeTempMetric);
  speedBtn.addEventListener("click", changeSpeedMetric);
}

function loadScreenON() {
  weatherSection.classList.remove("load-off");
  weatherSection.classList.add("load-on");
}

function loadScreenOFF() {
  weatherSection.classList.remove("load-on");
  weatherSection.classList.add("load-off");
}

function renderOtherTemp() {
  const feelsLike = document.getElementById("feelsLike");
  const temp = document.getElementById("temp");

  if (temp.textContent === "") return;

  const targetTemp = document.querySelector(".metric");
  const feelsLikeTemp = feelsLike.textContent.replace(/\D/g, '');
  const tempTemp = temp.textContent.replace(/\D/g, '');

  feelsLike.textContent = targetTemp.id === "fahr" ? 
    Math.round((+feelsLikeTemp - 32) * (5 / 9)) + "°C" :
    Math.round((+feelsLikeTemp * (9 / 5)) + 32) + "°F";

  temp.textContent = targetTemp.id === "fahr" ? 
    Math.round((+tempTemp - 32) * (5 / 9)) + "°C" :
    Math.round((+tempTemp * (9 / 5)) + 32) + "°F";

}

function renderOtherSpeed() {
  const wind = document.getElementById("wind");
  const targetSpeed = document.querySelector(".metric-speed");
  if (wind.textContent === "") return;
  const windSpeed = wind.textContent.replace(/\D/g, '');

  wind.textContent = targetSpeed.id === "mph" ? 
  Math.round(+windSpeed * 1.609) + " KM/H" :
  Math.round(+windSpeed / 1.609) + " MPH";
}

function toggleDegrees(e) {
  const spans = e.currentTarget.querySelectorAll("span");
  spans.forEach((span) => span.classList.toggle("metric"));
}

function toggleSpeed(e) {
  const spans = e.currentTarget.querySelectorAll("span");
  spans.forEach((span) => span.classList.toggle("metric-speed"));
}

function changeTempMetric(e) {
  renderOtherTemp();
  toggleDegrees(e);
}

function changeSpeedMetric(e) {
  renderOtherSpeed();
  toggleSpeed(e);

}

// Gif

function toggleGif(e) {
  const closedGif = e.currentTarget.textContent === "Show Gif" ? true : false;
  closedGif ? showGif(e) : hideGif(e);
}

function showGif(e) {
  box.style.display = "block";
  e.currentTarget.textContent = "Hide Gif";
}

function hideGif(e) {
  box.style.display = "none";
  e.currentTarget.textContent = "Show Gif";
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

// Cities with same names

function deleteDuplicates(altLocations) {
  return altLocations.filter((location, i, arr) => {
    const states = arr.map((location) => location.state).indexOf(location.state);
    const countries = arr.map((location) => location.country).indexOf(location.country);

    if (!(states !== i && countries !== i)) {
      return location;
    } 
  });
}

function updateSelectedCity(target) {
  [...altSection.firstElementChild.children].forEach((div) => {
    if (div === target) {
      div.classList.add("selected");
    } else {
      div.classList.remove("selected");
    }
  })
}

function removeDuplicates(cardContainer) {
  const duplicates = [...cardContainer.children].filter((card, i , arr) => i !== 0 && Math.round(card.lat) === Math.round(arr[0].lat));

  if (duplicates.length < 1) {
    return;
  } else {
    cardContainer.removeChild(cardContainer.firstElementChild);
  }
}

function renderAltCountries(weatherData) {
  const cardContainer = document.createElement('div');

  for (let i = 0; i < weatherData.length; i++) {
    const card = document.createElement('div');
    const text = document.createElement('p');
    const loc = `${weatherData[i].name}${weatherData[i].state ? ', ' + weatherData[i].state : ''} (${weatherData[i].country ? weatherData[i].country : weatherData[i].sys.country})`;
    const content = document.createTextNode(loc); 
    text.appendChild(content)
    card.appendChild(text);
    card.lat = i === 0 ? weatherData[i].coord.lat : weatherData[i].lat;
    card.lon = i === 0 ? weatherData[i].coord.lon : weatherData[i].lon;
    card.addEventListener('click', handleFormSubmit);
    cardContainer.appendChild(card);
  }

  removeDuplicates(cardContainer);
  altSection.firstElementChild.replaceWith(cardContainer);
  updateSelectedCity(cardContainer.firstElementChild);
}

async function callAltCountries(city) {
  const weatherKey = 'e9a6614f553731a73dd13cc17e5ff8d9';
  const geoCall = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${weatherKey}`);
  const geoData = await geoCall.json();

  return geoData;
}

async function handleAltCountries(weatherData, cityCall) {
  if (!cityCall) return;
  const altLocations = await callAltCountries(weatherData.name);
  const filteredLocations = deleteDuplicates(altLocations);

  if (filteredLocations.length > 1) {
    filteredLocations.unshift(weatherData);
    renderAltCountries(filteredLocations);
  }
}

// Weather

function createWeatherObject(args) {
  const temp = { id: 'temp', val: args[0] };
  const feelsLike = { id: 'feelsLike', val: args[1] };
  const humidity = { id: 'humidity', val: args[2] };
  const wind = { id: 'wind', val: args[3] };
  const description = { id: 'description', val: args[4] };
  const icon = { id: 'icon', val: args[5] };

  return [temp, feelsLike, humidity, wind, description, icon];
}

function addTextContent(...args) {
  const objects = createWeatherObject(args);

  for (let i = 0; i < objects.length; i++) {
    const element = document.querySelector(`#${objects[i].id}`);
    if (i === objects.length - 1) {
      element.src = `https://openweathermap.org/img/wn/${objects[i].val}.png`
    } else {
      element.textContent = objects[i].val;
    }
    
  }
}

function clearAll() {
  const emptyDiv = document.createElement("div");
  altSection.firstElementChild.replaceWith(emptyDiv);
  addTextContent("", "", "", "", "", "");
}

function convertToC(value) {
  return Math.round(value - 273.15) + "°C";
}

function convertToF(value) {
  return Math.round(((value - 273.15) * 1.8) + 32) + "°F";
}

function convertToMPH(value) {
  return Math.round(value * 2.237) + " MPH";
}

function convertToKMH(value) {
  return Math.round(value * 3.6) + " KMH";
}

function capFirstLetter(description) {
  return description.charAt(0).toUpperCase() + description.slice(1);
}

function renderWeather(weatherData, notInput, value) {
  notInput ? updateSelectedCity(value) : null;

  const targetTemp = document.querySelector(".metric");
  const targetSpeed = document.querySelector(".metric-speed");
  const convertTemp = targetTemp.id === "celc" ? convertToC : convertToF;
  const convertSpeed = targetSpeed.id === "kmh" ? convertToKMH : convertToMPH;
  const temp = convertTemp(weatherData.main.temp);
  const feelsLike = convertTemp(weatherData.main.feels_like);
  const humidity = weatherData.main.humidity + "%";
  const wind = convertSpeed(weatherData.wind.speed);
  const description = capFirstLetter(weatherData.weather[0].description);
  const icon = weatherData.weather[0].icon;

  addTextContent(temp, feelsLike, humidity, wind, description, icon);
}

async function callWeather(...args) {
  const weatherKey = 'e9a6614f553731a73dd13cc17e5ff8d9';
  const cityCall = args[1] === 'city';
  const cityAPI = `https://api.openweathermap.org/data/2.5/weather?q=${args[0]}&appid=${weatherKey}`;
  const coordsAPI = `https://api.openweathermap.org/data/2.5/weather?lat=${args[0]}&lon=${args[1]}&appid=${weatherKey}`;
  const weatherCall = cityCall ? await fetch(cityAPI) : await fetch(coordsAPI);
  const weatherData = await weatherCall.json();

  if (weatherData.cod != '200') {
    clearAll();
    throw weatherData.message;
  }

  handleAltCountries(weatherData, cityCall);

  return weatherData;
}

function handleWeather(notInput, value) {
  const params = notInput ? [value.lat, value.lon] : [value, 'city'];

  return new Promise((resolve) => {
    return setTimeout(() => resolve(callWeather.apply(null, params), 500));
  })
}

function handleFormSubmit(e) {
  const notInput = e && altSection.contains(e.currentTarget);
  const value = notInput ? e.currentTarget : document.querySelector("input[type=search]").value;
  const promise = handleWeather(notInput, value);
  
  promise
    .then((weatherData) => {
      renderWeather(weatherData, notInput, value);
      handleGif(weatherData);
    })
    .catch((error) => console.error(error))
    .finally(() => {
      weatherForm.reset();
      loadScreenOFF();
    });
}

function submitForm(e) {
  e.preventDefault();
  loadScreenON();
  handleFormSubmit();

  return false;
}
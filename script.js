const weatherForm = document.getElementById('weather-form');
weatherForm.addEventListener("submit", submitForm)

function loadScreenON() {
  const box = document.querySelector(".box");
  box.classList.remove("load-off");
  box.classList.add("load-on");
}

function loadScreenOFF() {
  const box = document.querySelector(".box");
  box.classList.remove("load-on");
  box.classList.add("load-off");
}

// Practice with Async/Await
const getWeather = async (location) => { 
  const APIkey = 'e9a6614f553731a73dd13cc17e5ff8d9';
  const apiCall = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${APIkey}`);
  const weatherData = await apiCall.json();
  
  return weatherData;
};

// Practice with Promise
function submitForm(e) {
  e.preventDefault();
  loadScreenON();
  const searchInput = document.querySelector("input[type=search]")
  const location = searchInput.value;
  const weatherData = new Promise((resolve) => {
    return setTimeout(() => resolve(getWeather(location)), 500);
  });

  weatherData.then((weatherData) => {
    console.log(weatherData);
    console.log("Celcius", weatherData.main.temp_max - 273.15);
    console.log("Fahrenheit", ((weatherData.main.temp_max - 273.15) * 1.8) + 32);
  }).catch((error) => {
    console.error(error)
  }).finally(() => loadScreenOFF())

  return false;
}

// Other Promise Options

// With Async/Await
// const weatherFetchAPI = async () => {
//   await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`)
//   .then(async (response) => weatherData = await response.json() )
//   .catch((error) => console.error(error))

//   console.log(weatherData);
//   return weatherData;
// };

// Without Async/Await
// const weatherResolvePromiseAPI = () => {
//   const apiPromise = Promise.resolve(fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`));
//   const apiResponse = apiPromise.then((response) => response.json())
//   apiResponse.then((response) => console.log( response )).catch((error) => console.error(error));
// };

// const weatherNewPromiseAPI = () => {
//   return new Promise((resolve) => {
//     resolve(fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`))
//   })
//   .then((response) => response.json())
//   .then((response) => console.log( response ))
//   .catch((error) => console.error(error))
// };
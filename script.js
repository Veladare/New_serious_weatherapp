$(document).ready(function() {
  showcities();
  getCurrentConditions();
});

var owmAPI = "788d5638d7c8e354a162d6c9747d1bdf";
var currentCity = "";
var lastCity = "";

function formatDate(date) {
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var year = date.getFullYear().toString();
  return `${month}/${day}/${year}`;
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

function getCurrentConditions(event) {
  var city = $('#search-city').val().toLowerCase();
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + owmAPI;
  fetch(queryURL)
    .then(handleErrors)
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      console.log(response)
      storecity(city);
      $('#search-error').text("");
      var currentTimeUTC = response.dt;
      var currentTimeZoneOffset = response.timezone;
      var currentMoment = new Date((currentTimeUTC + currentTimeZoneOffset) * 1000);
      showcities();
      getForecast(event);
      var presentWeatherHTML = `
        <h3>${city} ${formatDate(currentMoment)}<img src="https://openweathermap.org/img/w/${response.weather[0].icon}.png"></h3>
        <div>
            <div>Temperature: ${response.main.temp}&#8457;</div>
            <div>Humidity: ${response.main.humidity}%</div>
            <div>Wind Speed: ${response.wind.speed} mph</div>
        </div>`;
      $('#present-weather').html(presentWeatherHTML);
    });
}

function getForecast(event) {
  var city = $('#search-city').val();
  var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + owmAPI;

  fetch(queryURL)
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      var fiveDayForecastHTML = `
      <h2>5-Day Forecast: ${city}</h2>
      <div id="fiveDayForecastUl" class="d-md-inline-flex flex-wrap">`;

      var filteredList = response.list.filter(function(dayData) {
        var thisMoment = new Date((dayData.dt + response.city.timezone) * 1000);
        return [17].includes(thisMoment.getUTCHours());
      });

      for (var i = 0; i < filteredList.length && i < 5; i++) {
        var dayData = filteredList[i];
        var dayTimeUTC = dayData.dt;
        var timeZoneOffset = response.city.timezone;
        var thisMoment = new Date(dayTimeUTC * 1000 + timeZoneOffset * 1000);
  

        fiveDayForecastHTML += `
          <div class="weather text-white bg-dark mb-3">
            <div class="list-unstyled p-2">
              <div>${thisMoment.toLocaleString()}</div>
              <div><img src="https://openweathermap.org/img/w/${dayData.weather[0].icon}.png"></div>
              <div>Temp: ${dayData.main.temp}&#8457;</div>
              <div>Humidity: ${dayData.main.humidity}%</div>
              <div>Wind Speed: ${dayData.wind.speed} mph</div>
            </div>
          </div>`;
      }
       
      $('#forecast').html(fiveDayForecastHTML);
    });
}

function storecity(newCity) {
  var cities = Object.values(localStorage);
  var cityExists = cities.includes(newCity);
  if (!cityExists) {
    var key = 'cities' + cities.length;
    localStorage.setItem(key, newCity);
  }
}

function showcities() {
  $('#city-results').empty();
  var citiesArray = []; 
  if (localStorage.length) {
    var lastCityKey = "cities" + (localStorage.length - 1);
    lastCity = localStorage.getItem(lastCityKey);
    $('#search-city').attr("value", lastCity);
    for (var i = 0; i < localStorage.length; i++) {
      var city = localStorage.getItem("cities" + i);
      citiesArray.push(city); 
    }
  } else {
    var defaultCity = lastCity ? lastCity : "New York";
    $('#search-city').val(defaultCity);
  }
  
  
  for (var i = 0; i < citiesArray.length; i++) {
    var city = citiesArray[i];
    var cityButton = `<button type="button">${city}</button></li>`;
    if (currentCity === "") {
      currentCity = lastCity;
    }
    if (city === currentCity) {
      cityButton = `<button type="button" class="active">${city}</button></li>`;
    }
    $('#city-results').append(cityButton);
  }
}


$('#search-button').on("click", function(event) {
  event.preventDefault();
  getCurrentConditions(event);
});


$('#city-results').on("click", function(event) {
  event.preventDefault();
  $('#search-city').val($(event.target).text());
  currentCity = $('#search-city').val();
  getCurrentConditions(event);
});


$("#wipe-storage").on("click", function(event) {
  localStorage.clear();
  showcities();
});


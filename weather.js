#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const axios = require("axios");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const chalk = require("chalk");

const argv = yargs(hideBin(process.argv)).argv;

const weatherSymbols = {
  Clear: "☀️",
  Rain: "☔",
  Clouds: "☁️",
  Snow: "❄️",
  Drizzle: "🌧️",
  Thunderstorm: "⛈️",
};

const DEFAULT_LOCATION = process.env.DEFAULT_LOCATION;
const BORDER = chalk.greenBright("*".repeat(80));

const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

const displayCurrentAlerts = (alerts) => {
  if (!alerts) {
    console.log(chalk.red("No Alerts"));
    return;
  } else {
    console.log();
    console.log(chalk.redBright("---ALERTS---"));
    console.log();
    for (let alert of alerts) {
      console.log(chalk.yellowBright(alert.event));
      console.log(alert.description);
    }
  }
};

const degToDirection = (degrees) => {
  const sector = Math.floor(degrees / 45 + 0.5);
  const directions = [
    "North",
    "Northeast",
    "East",
    "Souteast",
    "South",
    "Soutwest",
    "West",
    "Northwest",
  ];
  return directions[sector % 8];
};

const displayCurrentWeather = (weatherData) => {
  let description = weatherData.current.weather[0].main;
  let symbol = weatherSymbols[description];

  console.log(BORDER);
  console.log(
    chalk.whiteBright(
      `CURRENT WEATHER FOR ${chalk.cyan(
        capitalize(weatherData.city)
      )}, ${chalk.cyan(weatherData.state)}:`
    )
  );
  console.log(`Current Temperature: ${Math.floor(weatherData.current.temp)}°F`);
  console.log(
    `Low: ${chalk.blueBright(
      Math.floor(weatherData.daily[0].temp.min)
    )} / High: ${chalk.redBright(Math.floor(weatherData.daily[0].temp.max))}`
  );
  console.log(
    `Wind Speed: ${Math.round(
      weatherData.current.wind_speed
    )} mph ${degToDirection(weatherData.current.wind_deg)}`
  );
  console.log(`Humidity: ${weatherData.current.humidity}%`);
  console.log("Description: " + symbol + "  " + description);
  displayCurrentAlerts(weatherData.alerts || null);
  console.log(BORDER);
  console.log;
};

const displayForecast = (weatherData) => {
  const dateDisplayOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
  };

  console.log(`\nDaily forecast:`);

  for (let day of weatherData.daily.slice(0, 7)) {
    const date = new Date(day.dt * 1000);
    const dateFormatted = date.toLocaleDateString("en-US", dateDisplayOptions);
    const description = day.weather[0].main;
    const symbol = weatherSymbols[description];

    console.log(BORDER);
    console.log(`Date: ${dateFormatted}`);
    console.log(
      `Low: ${chalk.blueBright(
        Math.floor(day.temp.min)
      )}°F / High: ${chalk.redBright(Math.floor(day.temp.max))}`
    );
    console.log(`Humidity: ${day.humidity}%`);
    console.log(
      "Description: " +
        symbol +
        "  " +
        description +
        " - " +
        day.weather[0].description
    );
    console.log("");
  }
};

const getCoords = async (city, state) => {
  let response;
  let url;

  if (state) {
    url = `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&appid=${process.env.OPENWEATHER_API_KEY}`;
  } else {
    url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}`;
  }

  response = await axios.get(url);
  if (response.data.length === 0) throw new Error("Invalid city/state");

  const data = response.data[0] || response.data;
  return [data.lat, data.lon];
};

const getWeather = async (lat, lon, city, state, forecast) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const weatherData = response.data;
    weatherData.city = city;
    weatherData.state = state;

    displayCurrentWeather(weatherData);
    if (forecast) displayForecast(weatherData);
  } catch (error) {
    console.error(`Error getting weather data: ${error}`);
  }
};

const main = async (cityState = DEFAULT_LOCATION, forecast = false) => {
  let state;
  let city;
  const cityStatePattern = /^[a-z. ]+\s*,\s*[a-z]{2}$/i;

  if (cityState.toLowerCase() === "forecast") {
    city = "Fritch";
    state = "tx";
    forecast = true;
  } else if (!cityStatePattern.test(cityState)) {
    throw new Error("You must submit your location in format of 'city,state' ");
  } else {
    [city, state] = cityState.split(",");
  }

  try {
    const [lat, lon] = await getCoords(city, state);
    getWeather(lat, lon, city, state, forecast);
  } catch (error) {
    console.log(error);
  }
};

main(argv._[0], argv._[1]);

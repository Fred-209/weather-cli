# Weather CLI

A simple command line tool to check weather stats from [IOpenWeatherMap](https://openweathermap.org).

## Installation Instructions

OpenWeatherMap API key required for usage.

1. Clone this repo
2. Change to cloned repo directory and run `npm install`
3. Create a `.env` file in root directory and add entry for your API key: `OPENWEATHER_API_KEY=<API Key Here>`
4. Add entry for DEFAULT_LOCATION in form of "city_name, state" like "Houston, Tx" in `.env` file: `DEFAULT_LOCATION="Houston, Tx"`

- This is the location that will be used when you type `weather` in the console with no extra arguments, so set it to a location you'd like this shortcut to

5. Make this program executable in Linux by running `chmod +x weather.js`
6. Create a symbolic link to this file with `sudo ln -s weather.js /usr/local/bin/weather`

## Usage

The program will fetch local weather data for the DEFAULT_LOCATION in your `.env` file, or you can pass in a location when running the program with `weather "New York, Ny"`

You can also get a 5 day forecast with `weather forecast "New York, Ny"`.
If you just type `weather forecast`, it will output the forecast for your DEFAULT_LOCATION

Currently only works in the USA and the "city, state" format is mandatory

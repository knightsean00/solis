import * as Location from "expo-location";
import { DateTime } from "luxon";

export function cToF(celsius) {
    return celsius * (9 / 5) + 32;
}

export function fToC(fahrenheit) {
    return (fahrenheit - 32) * (5 / 9);
}

export function formatTime12(date, includeDate) {
    let hour = date.hour;
    let timeOfDay = " am";
    if (hour > 11) {
        timeOfDay = " pm";
    }

    if (hour > 12) {
        hour -= 12;
    }

    if (hour === 0) {
        hour = 12;
    }

    if (includeDate)
        return `${date.month}/${date.day} ${hour}${timeOfDay}`;
    return `${hour}${timeOfDay}`;
}

export function takeEveryN(array, n) {
    const newArray = [];
    for (let i = 0; i < array.length; i += n)
        newArray.push(array[i]);
    return newArray;
}

// Given a forecast object and a number of days, return an object which represents a 
// general forecast the specified amount of days.
// Each day contains information about the date, the min temp, the max temp
// will need to add stuff for forecast

export function getForecast(forecast) {
    const data = {};

    for (const period of forecast) {
        const key = period.startTime.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
        if (key in data === false) {
            data[key] = {
                date: period.startTime,
                temps: [],
                forecastCount: {},
                temperatureUnit: period.temperatureUnit
            };
        }

        data[key].temps.push(period.temperature);
        if (period.shortForecast in data[key].forecastCount === false) {
            data[key].forecastCount[period.shortForecast] = 0;
        }
        if (!period.shortForecast.includes("Clear")) {
            data[key].forecastCount[period.shortForecast]++;
        }
        data[key].forecastCount[period.shortForecast]++;
    }

    const sortedData = Object.values(data).sort((a, b) => a.date.toMillis() - b.date.toMillis());
    sortedData.forEach((period) => {
        period.forecast = Object.keys(period.forecastCount).reduce((accumulator, currentValue) => {
            if (period.forecastCount[accumulator] < period.forecastCount[currentValue])
                return currentValue;
            if (period.forecastCount[accumulator] === period.forecastCount[currentValue] && accumulator.includes("Clear") && !currentValue.includes("Clear"))
                return currentValue;
            return accumulator;
        });

        period.minTemp = Math.min(...period.temps);
        period.maxTemp = Math.max(...period.temps);
    });
    return sortedData;
}

export async function getNOAALocation(latitude, longitude) {
    try {
        const response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`, {
            method: "GET",
            headers: {
                "User-Agent": "(knightsean00.github.io, knightsean00@gmail.com)"
            }
        });
        const pointInfo = await response.json();
        if (pointInfo) {
            return {
                wfo: pointInfo.properties.gridId,
                x: pointInfo.properties.gridX,
                y: pointInfo.properties.gridY
            };
        }
    } catch (err) {
        console.log(err);
    }
}

export async function getLocationInformation(latitude, longitude) {
    const [noaa, reverseRes] = await Promise.all([
        getNOAALocation(latitude, longitude),
        Location.reverseGeocodeAsync({latitude: latitude, longitude: longitude})
    ]);
    return {
        city: reverseRes[0].city,
        region: reverseRes[0].region,
        country: reverseRes[0].country,
        postalCode: reverseRes[0].postalCode,
        wfo: noaa.wfo,
        x: noaa.x,
        y: noaa.y,
        latitude: latitude,
        longitude: longitude
    };
}

export async function getWeatherConditions(locationInfo) {
    try {
        const response = await fetch(`https://api.weather.gov/gridpoints/${locationInfo.wfo}/${locationInfo.x},${locationInfo.y}/forecast/hourly`, {
            method: "GET",
            headers: {
                "User-Agent": "(knightsean00.github.io, knightsean00@gmail.com)",
                // "Feature-Flags": ["forecast_temperature_qv", "forecast_wind_speed_qv"]
            }
        });
        const gridInfo = await response.json();
        
        if (gridInfo) {
            return gridInfo.properties.periods.map((period) => {
                return {
                    temperature: period.temperature,
                    temperatureUnit: period.temperatureUnit,
                    probabilityOfPrecipitation: period.probabilityOfPrecipitation,
                    windSpeed: period.windSpeed,
                    windDirection: period.windDirection,
                    shortForecast: period.shortForecast,
                    humidity: period.relativeHumidity.value,
                    startTime: DateTime.fromISO(period.startTime, {setZone: true}),
                    endTime: DateTime.fromISO(period.endTime, {setZone: true}),
                };
            });
        }
        
    } catch (err) {
        console.log(`Error getting information for ${locationInfo.city}`);
        console.log(err);
    }
}

export async function getAllWeatherConditions(locations) {
    try {
        const res = await Promise.all(locations.map(location => getWeatherConditions(location)));
        const output = {};
        res.forEach((val, idx) => {
            if (val) {
                output[`${locations[idx].city}-${locations[idx].wfo}-${locations[idx].x}-${locations[idx].y}`] = val;
            }
        });
        return output;
    } catch (err) {
        console.log("Error getting new weather conditions.");
        console.log(err);
    }
}
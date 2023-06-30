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

export function formatTimeLabel(dates) {
    const seen = new Set();
    return dates.map(date => {
        // if (seen.has(date.getDate())) {
        //     return formatTime12(date, false);
        // } else {
        //     seen.add(date.getDate());
        //     return formatTime12(date, true);
        // }
        return formatTime12(date, true);
    });
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
    const newArray = [];

    let curHour = forecast[0].startTime.hour;
    let timeToNextDay = 24 - curHour;

    const slicedForcast = forecast.slice(timeToNextDay);

    for (let day = 0; day < 5; day++) {
        newArray.push({"date": forecast[day * 24].startTime.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY), "temps" : []});
        for (let hour = 0; hour < 24; hour++) {
            newArray[day]["temps"].push(slicedForcast[day * 24 + hour].temperature);
        }
    }

    return newArray.map((day) => {
        return {
            date: day["date"], 
            maxTemp: Math.max(...day["temps"]),
            minTemp: Math.min(...day["temps"])
            // maxTemp: day["temps"].reduce((x1, x2) => x1 > x2 ? x1 : x2),
            // minTemp: day["temps"].reduce((x1, x2) => x1 < x2 ? x1 : x2)
        };
    });
    
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
                    startTime: DateTime.fromISO(period.startTime),
                    endTime: DateTime.fromISO(period.endTime),
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
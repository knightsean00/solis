import * as Location from "expo-location";

export function cToF(celsius) {
    return celsius * (9 / 5) + 32;
}

export function fToC(fahrenheit) {
    return (fahrenheit - 32) * (5 / 9);
}

export function formatTime12(date, includeDate) {
    let hour = date.hour;
    let timeOfDay = "am";
    if (hour > 11) {
        timeOfDay = "pm";
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
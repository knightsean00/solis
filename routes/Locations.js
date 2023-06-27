import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, ScrollView } from "react-native";
import LocationTile from "../components/LocationTile";
import LookUp from "../components/LookUp";
import Forecast from "./Forecast";

import { DateTime } from "luxon";

export default function Locations(props) {
    const [locationInformation, setLocationInformation] = useState([props.locationInformation]);
    const [forecastInformation, setForecastInformation] = useState({});
    const [chosenLocation, setChosenLocation] = useState(null);

    const getStoredLocations = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("locations");
            if (jsonValue != null) {
                setLocationInformation([
                    locationInformation[0],
                    ...jsonValue
                ]);
                // console.log(locationInformation);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const getWeatherConditions = async (locationInfo) => {
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
            // console.log(err);
        }
    };

    useEffect(() => {
        getStoredLocations();
    }, []);

    useEffect(() => {
        Promise.all(locationInformation.map(location => getWeatherConditions(location))).then(res => {
            const output = {};
            res.forEach((val, idx) => {
                output[`${locationInformation[idx].city}-${locationInformation[idx].wfo}-${locationInformation[idx].x}-${locationInformation[idx].y}`] = val;
            });
            setForecastInformation(output);
        });
    }, [locationInformation]);

    // locationInformation is a list of the following object
    // city: reverseRes[0].city,
    // region: reverseRes[0].region,
    // country: reverseRes[0].country,
    // postalCode: reverseRes[0].postalCode,
    // wfo: noaa.wfo,
    // x: noaa.x,
    // y: noaa.y,
    // latitude: location.coords.latitude,
    // longitude: location.coords.longitude

    // const xd = [locationInformation, locationInformation];

    if (chosenLocation) {
        return (
            <Forecast 
                locationInformation={chosenLocation}
                forecast={forecastInformation[`${chosenLocation.city}-${chosenLocation.wfo}-${chosenLocation.x}-${chosenLocation.y}`]}
                return={() => setChosenLocation(null)}
            />
        );
    }

    return ( 
        <ScrollView style={styles.container}>
            <LookUp/>
            {   
                locationInformation.map((val, idx) => {
                    const key = `${val.city}-${val.wfo}-${val.x}-${val.y}`;
                    if (forecastInformation[key]) {
                        return (
                            <LocationTile 
                                key={key} 
                                locationInformation={val}
                                temperature={forecastInformation[key][0].temperature} 
                                temperatureType={`°${forecastInformation[key][0].temperatureUnit}`} 
                                weather={forecastInformation[key][0].shortForecast}
                                currentLocation={idx === 0}
                                chooseLocation={setChosenLocation}
                            />
                        );
                    }
                    return (
                        <LocationTile 
                            key={key} 
                            locationInformation={val}
                            temperature={0} 
                            currentLocation={idx === 0}
                            chooseLocation={setChosenLocation}
                        />
                    );
                })
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: "2%"
    }
});


Locations.propTypes = {
    locationInformation: PropTypes.object.isRequired
};
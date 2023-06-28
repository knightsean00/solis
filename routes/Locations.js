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

    const addLocation = (newLocation) => {
        for (const location of locationInformation.slice(1)) {
            if (location.city === newLocation.city && location.wfo === newLocation.wfo && location.x === newLocation.x && location.y === newLocation.y) {
                return;
            }
        }

        // add to state and add to async storage
        console.log("Changing location Information");
        const locationInformationNew = locationInformation.concat([newLocation]);
        setLocationInformation(locationInformationNew);

        storeLocations(locationInformationNew.slice(1)).then(() => {
            console.log(`Successfully added ${newLocation.city} to storage`);
        }).catch(err => {
            console.log(`Error adding ${newLocation.city}`);
            console.log(err);
        });
    };

    const removeLocation = (locationIndex) => {
        const cityName = locationInformation[locationIndex].city;
        const newLocationInformation = locationInformation.slice(0, locationIndex).concat(locationInformation.slice(locationIndex + 1));
        setLocationInformation(newLocationInformation);
        storeLocations(locationInformation.slice(1)).then(() => {
            console.log(`Successfully removed ${cityName}`);
        }).catch(err => {
            console.log(`Error removing ${cityName}`);
            console.log(err);
        });
    };

    const storeLocations = async (locations) => {
        const jsonValue = JSON.stringify(locations);
        return await AsyncStorage.setItem("locations", jsonValue);
    };
    
    const getStoredLocations = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("locations");
            if (jsonValue != null) {
                const storedValue = JSON.parse(jsonValue);
                if (storedValue.length > 0) {
                    const newLocationInformation = [locationInformation[0]].concat(storedValue);
                    setLocationInformation(newLocationInformation);
                }
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
            console.log(`Error getting information for ${locationInfo.city}`);
            console.log(err);
        }
    };

    useEffect(() => {
        getStoredLocations();
        // AsyncStorage.clear();
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

    if (chosenLocation != null) {
        const key = `${locationInformation[chosenLocation].city}-${locationInformation[chosenLocation].wfo}-${locationInformation[chosenLocation].x}-${locationInformation[chosenLocation].y}`
        return (
            <Forecast 
                locationInformation={locationInformation[chosenLocation]}
                forecast={forecastInformation[key]}
                return={() => setChosenLocation(null)}
                removeLocation={
                    chosenLocation > 0 ?
                        () => removeLocation(chosenLocation) :
                        null
                }
            />
        );
    }

    return ( 
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LookUp 
                addLocation={addLocation}
            />
            {   
                locationInformation.map((val, idx) => {
                    const key = `${val.city}-${val.wfo}-${val.x}-${val.y}`;
                    if (forecastInformation[key]) {
                        return (
                            <LocationTile 
                                key={key} 
                                locationInformation={val}
                                locationIndex={idx}
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
                            locationIndex={idx}
                            temperature={null} 
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
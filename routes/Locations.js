import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, ScrollView, RefreshControl, } from "react-native";
import LocationTile from "../components/LocationTile";
import LookUp from "../components/LookUp";
import Forecast from "./Forecast";

import { DateTime } from "luxon";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getAllWeatherConditions, getLocationInformation } from "../common/helper";

export default function Locations(props) {
    const [locationInformation, setLocationInformation] = useState([props.locationInformation]);
    const [forecastInformation, setForecastInformation] = useState({});
    const [chosenLocation, setChosenLocation] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

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
        storeLocations(newLocationInformation.slice(1)).then(() => {
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

    const onRefresh = () => {
        getAllWeatherConditions(locationInformation).then(res => {
            setForecastInformation(res);
            setRefreshing(false);
        });
    };

    useEffect(() => {
        getStoredLocations();
        // AsyncStorage.clear();
    }, []);

    useEffect(() => {
        getAllWeatherConditions(locationInformation).then(res => {
            setForecastInformation(res);
        });
    }, [locationInformation]);

    if (chosenLocation != null) {
        const key = `${locationInformation[chosenLocation].city}-${locationInformation[chosenLocation].wfo}-${locationInformation[chosenLocation].x}-${locationInformation[chosenLocation].y}`;
        return (
            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
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
            </ScrollView>
        );
    }

    return ( 
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
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
                                removeLocation={removeLocation}
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
                            removeLocation={removeLocation}
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
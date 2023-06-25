import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, SafeAreaView, ScrollView} from "react-native";
import { formatTime12, takeEveryN, formatTimeLabel } from "../common/helper";

// Graph component
import Graph from "../components/Graph";
import CurrentWeather from "../components/CurrentWeather";

export default function Forecast(props) {
    const [errorMsg, setErrorMsg] = useState(null);
    const [forecast, setForecast] = useState([]);
  

    const getLocationInformation = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`, {
                method: "GET",
                headers: {
                    "User-Agent": "(knightsean00.github.io, knightsean00@gmail.com)"
                }
            });
            const pointInfo = await response.json();
            if (pointInfo) {
                const wfo = pointInfo.properties.gridId;
                const x = pointInfo.properties.gridX;
                const y = pointInfo.properties.gridY;
                await getWeatherConditions(wfo, x, y);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const getWeatherConditions = async (wfo, x, y) => {
        try {
            const response = await fetch(`https://api.weather.gov/gridpoints/${wfo}/${x},${y}/forecast/hourly`, {
                method: "GET",
                headers: {
                    "User-Agent": "(knightsean00.github.io, knightsean00@gmail.com)",
                    // "Feature-Flags": ["forecast_temperature_qv", "forecast_wind_speed_qv"]
                }
            });
            const gridInfo = await response.json();
            if (gridInfo) {
                setForecast(gridInfo.properties.periods.map((period) => {
                    return {
                        temperature: period.temperature,
                        temperatureUnit: period.temperatureUnit,
                        probabilityOfPrecipitation: period.probabilityOfPrecipitation,
                        windSpeed: period.windSpeed,
                        windDirection: period.windDirection,
                        shortForecast: period.shortForecast,
                        humidity: period.relativeHumidity.value,
                        startTime: new Date(period.startTime),
                        endTime: new Date(period.endTime),
                    };
                }));
            }
            
        } catch (err) {
            // console.log(err);
        }
    };

    useEffect(() => {
        if (props.latitude && props.longitude) {
            getLocationInformation(props.latitude, props.longitude);
        }
    }, [props.latitude, props.longitude]);


    let text = "";
    if (errorMsg) {
        text = errorMsg;
    } else if (props.locationInformation) {
        // console.log(props.locationInformation);
        text = `${props.locationInformation.city}, ${props.locationInformation.region}`;
    }

    if (forecast.length === 0) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    const plotEveryN = 6;
    const maxSlice = 64;

    return (
        <View style={styles.container}>
            <Text style={styles.headerText} numberOfLines={1} adjustsFontSizeToFit>{text}</Text>
            <CurrentWeather weather={forecast[0]}/>
            <Graph 
                title = {"Temperature"}
                yLabel={forecast[0].temperatureUnit}
                xData={formatTimeLabel(takeEveryN(forecast.map(period => period.endTime).slice(0, maxSlice), plotEveryN))} 
                yData={takeEveryN(forecast.map(period => period.temperature).slice(0, maxSlice), plotEveryN)} />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        marginHorizontal: "2%"
    },
    headerText: {
        fontSize: 32,
        fontWeight: "bold"
    }
}); 

Forecast.propTypes = {
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    locationInformation: PropTypes.object
};

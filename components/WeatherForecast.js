import React from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import { getForecast } from "../common/helper";


// temperature: period.temperature,
// temperatureUnit: period.temperatureUnit,
// probabilityOfPrecipitation: period.probabilityOfPrecipitation,
// windSpeed: period.windSpeed,
// windDirection: period.windDirection,
// shortForecast: period.shortForecast,
// humidity: period.relativeHumidity.value,
// startTime: DateTime.fromISO(period.startTime),
// endTime: DateTime.fromISO(period.endTime),
// forecastData = forecast.map(period => period.endTime).slice(0, maxSlice),'


export default function WeatherForecast(props) {

    const forecastData = getForecast(props.forecast);

    return (
        <View>
            <Text style={styles.title}>5 Day Forecast</Text>
            {/* <FlatList 
                data={forecastData}
                renderItem={({item}) => <Text>Min Temperature: {item["minTemp"]} - Max Temperature {item["maxTemp"]}</Text>}
            /> */}
            {
                forecastData.map((val, idx) => {
                    return (
                        <View key={idx}>
                            <Text>Date {val["date"]} Min Temp {val["minTemp"]} - Max Temp {val["maxTemp"]}</Text>
                        </View>
                    );
                })
            }
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        marginVertical: "5%"
    },
    title: {
        fontSize: 16,
        marginBottom: "2%"
    },
    tileContainer: {
        flexDirection: "row",
        // width: "200%",
        columnGap: 10,
    }
});

WeatherForecast.propTypes = {
    forecast: PropTypes.array.isRequired
};


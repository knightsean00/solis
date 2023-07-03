import React from "react";
import { StyleSheet, View, Text, FlatList, useColorScheme } from "react-native";
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import { getForecast } from "../common/helper";
import WeatherTile from "./WeatherTile";


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
    const colorScheme = useColorScheme();
    const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";

    const forecastData = getForecast(props.forecast);
    return (
        <View style={styles.container}>
            <Text style={[styles.title, {color: textColor}]}>Day Forecast</Text>
            <FlatList 
                data={forecastData}
                renderItem={({item}) =>
                    <WeatherTile 
                        title={item.date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                        shortForecast={item.forecast}
                        listedInformation={[
                            `High ${item.maxTemp}°${item.temperatureUnit}`,
                            `Low ${item.minTemp}°${item.temperatureUnit}`,
                        ]}
                    />
                }
                horizontal
                showsHorizontalScrollIndicator={false}
            />
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


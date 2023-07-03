import React from "react";
import { StyleSheet, View, Text, FlatList, useColorScheme } from "react-native";
import PropTypes from "prop-types";
import WeatherTile from "./WeatherTile";
import { formatTime12 } from "../common/helper";

export default function HourlyWeather(props) {
    const colorScheme = useColorScheme();
    const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";

    return (
        <View style={styles.container}>
            <Text style={[styles.title, {color: textColor}]}>Hourly Forecast</Text>
            <FlatList 
                data={props.forecast}
                renderItem={({item}) => 
                    <WeatherTile 
                        shortForecast={item.shortForecast} 
                        title={formatTime12(item.startTime, false)}
                        listedInformation={[
                            `${item.temperature}°${item.temperatureUnit}`,
                            `${item.probabilityOfPrecipitation.value}% Precipitation`,
                            `${item.humidity}% Humidity`,
                            `${item.windSpeed.split(" ").join("")} ${item.windDirection}`
                        ]}
                    />
                }
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
}

HourlyWeather.propTypes = {
    forecast: PropTypes.array.isRequired
};

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
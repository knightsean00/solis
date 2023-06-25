import React from "react";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { View, Text } from "react-native";

export default function CurrentWeather(props) {
    console.log(props.weather);
    console.log(props.weather.endTime.getHours());
    return (
        <View style={styles.parentContainer}>
            <View style={styles.childContainer}>
                <Text style={[styles.tempText]}>{props.weather.temperature}°{props.weather.temperatureUnit}  </Text>
            </View>
            <View style={styles.childContainer}>
                <Text style={styles.rightText}>Humidity: {props.weather.humidity}%</Text>
                <Text style={styles.rightText}>Precipitation: {props.weather.probabilityOfPrecipitation.value}%</Text>
                <Text style={styles.rightText}>Wind: {props.weather.windSpeed} {props.weather.windDirection} </Text>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    parentContainer: {
        flexDirection: "row",
        marginVertical: "3%",
        

    },
    childContainer: {
        flex: 1,
        justifyContent: "center",
    },
    tempText: {
        fontSize: 32,
        // fontWeight: "bold"
    },
    rightText: {
        textAlign: "right",
    },
}); 
CurrentWeather.propTypes = {
    weather: PropTypes.object
};
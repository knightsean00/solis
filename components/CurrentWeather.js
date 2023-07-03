import React from "react";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { View, Text, useColorScheme } from "react-native";

export default function CurrentWeather(props) {
    const colorScheme = useColorScheme();
    const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";
    
    return (
        <View style={styles.parentContainer}>
            <View style={styles.childContainer}>
                <Text style={[styles.tempText, {color: textColor}]}>{props.weather.temperature}°{props.weather.temperatureUnit}  </Text>
            </View>
            <View style={styles.childContainer}>
                <Text style={[styles.rightText, {color: textColor}]}>Humidity: {props.weather.humidity}%</Text>
                <Text style={[styles.rightText, {color: textColor}]}>Precipitation: {props.weather.probabilityOfPrecipitation.value}%</Text>
                <Text style={[styles.rightText, {color: textColor}]}>Wind: {props.weather.windSpeed.split(" ").join("")} {props.weather.windDirection} </Text>
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
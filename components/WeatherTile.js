import React from "react";
import { StyleSheet, View, Text } from "react-native";
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import SunIcon from "../common/icons/SunIcon";
import MoonIcon from "../common/icons/MoonIcon";
import CloudIcon from "../common/icons/CloudIcon";
import RainIcon from "../common/icons/RainIcon";
import ThunderIcon from "../common/icons/ThunderIcon";
import RainAndThunderIcon from "../common/icons/RainAndThunderIcon";
import { formatTime12 } from "../common/helper";

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

export default function WeatherTile(props) {
    if (props.forecast) {
        let Icon = SunIcon;
        const short = props.forecast.shortForecast;
        console.log(short);
        if (["Mostly Clear", "Clear"].includes(short)){
            Icon=MoonIcon;
        } else if (["Sunny", "Mostly Sunny", "Partly Sunny"].includes(short)){
            Icon=SunIcon;
        } else if (["Chance Showers And Thunderstorms", "Slight Chance Showers And Thunderstorms then Sunny","Showers And Thunderstorms Likely then Chance Showers And Thunderstorms", "Slight Chance Showers And Thunderstorms", "Showers And Thunderstorms Likely"].includes(short)){
            Icon=RainAndThunderIcon;
        } else if (short.toLowerCase().includes("thunder")) {
            Icon=ThunderIcon;
        } else if (["Cloudy", "Mostly Cloudy", "Partly Cloudy", "Patchy Fog", "Fog", "Haze"].includes(short)){
            Icon=CloudIcon; 
        } else if (["Rain", "Mostly Rain", "Slight Chance Rain Showers", "Chance Rain Showers", "Rain Showers", "Rain Showers Likely"].includes(short)){
            Icon=RainIcon;
        }
        // console.log(props.forecast.shortForecast);
        return (
            <View style={styles.tile}>
                <Text style={{fontWeight: "bold", textAlign: "center", marginVertical: 10}}>{formatTime12(props.forecast.endTime, false)}</Text>
                <Icon width={60} height={60} style={{marginHorizontal: 20}}/>
                {/* <Text>{short}</Text> */}
                <Text style={{textAlign: "center", marginVertical: 10}}>{props.forecast.temperature}°{props.forecast.temperatureUnit}</Text>
            </View>
        );
    }
    return (
        <></>
    );
}

const styles = StyleSheet.create({
    tile: {
        // margin: "5%",
        // flex: 1,
        borderRadius: 5,
        borderColor: "#cccccc",
        borderWidth: 1,
        // marginRight: 1,
        // paddingVertical: "10%",
        // width: "200%",
        // marginHorizontal: 10
        marginRight: 10
    },
});

WeatherTile.propTypes = {
    forecast: PropTypes.object.isRequired
};


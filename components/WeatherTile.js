import React, {useState} from "react";
import { StyleSheet, Text, Pressable, useColorScheme } from "react-native";
import PropTypes from "prop-types";
import SunIcon from "../common/icons/SunIcon";
import MostlySunny from "../common/icons/MostlySunny";
import PartlySunny from "../common/icons/PartlySunny";
import MoonIcon from "../common/icons/MoonIcon";
import MostlyClear from "../common/icons/MostlyClear";
import PartlyCloudy from "../common/icons/PartlyCloudy";
import MostlyCloudy from "../common/icons/MostlyCloudy";
import Cloudy from "../common/icons/Cloudy";
import Fog from "../common/icons/Fog";
import RainIcon from "../common/icons/RainIcon";
import ThunderIcon from "../common/icons/ThunderIcon";
import RainAndThunderIcon from "../common/icons/RainAndThunderIcon";

export default function WeatherTile(props) {
    const [selected, setSelected] = useState(false);
    const colorScheme = useColorScheme();
    const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";

    let Icon = SunIcon;
    if (props.shortForecast === "Clear"){
        Icon=MoonIcon;
    } else if (props.shortForecast === "Mostly Clear") {
        Icon=MostlyClear;
    } else if (props.shortForecast === "Mostly Sunny") {
        Icon=MostlySunny;
    } else if (props.shortForecast === "Partly Sunny") {
        Icon=PartlySunny;
    } else if (["Chance Showers And Thunderstorms", "Slight Chance Showers And Thunderstorms then Sunny","Showers And Thunderstorms Likely then Chance Showers And Thunderstorms", "Slight Chance Showers And Thunderstorms", "Showers And Thunderstorms Likely"].includes(props.shortForecast)){
        Icon=RainAndThunderIcon;
    } else if (props.shortForecast.toLowerCase().includes("thunder")) {
        Icon=ThunderIcon;
    } else if (props.shortForecast === "Partly Cloudy"){
        Icon=PartlyCloudy; 
    } else if (props.shortForecast === "Mostly Cloudy"){
        Icon=MostlyCloudy; 
    } else if (props.shortForecast === "Cloudy"){
        Icon=Cloudy; 
    } else if (["Patchy Fog", "Fog", "Haze"].includes(props.shortForecast)){
        Icon=Fog; 
    } else if (["Rain", "Mostly Rain", "Slight Chance Rain Showers", "Chance Rain Showers", "Rain Showers", "Rain Showers Likely"].includes(props.shortForecast)){
        Icon=RainIcon;
    }
    return (
        <Pressable style={[styles.tile]} onPress={() => setSelected(!selected)}>
            <Text style={{fontWeight: "bold", textAlign: "center", marginVertical: 10, marginHorizontal: 10, color: textColor}}>{props.title}</Text>
            <Icon width={60} height={60} style={{marginHorizontal: 10, marginBottom: 5}}/>
            {
                props.listedInformation.map((val, idx) => 
                    <Text key={`${props.title}-${idx}`} style={[styles.descriptionText, {color: textColor}]}>{val}</Text>
                )
            }
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        borderRadius: 5,
        borderColor: "#cccccc",
        borderWidth: 1,
        marginRight: 10,
        // backgroundColor: "#ffffff",
        alignItems: "center",
    },
    selected: {
        backgroundColor: "#eeeeee"
    },
    descriptionText: {
        textAlign: "center",
        marginBottom: 5,
        marginHorizontal: 10
    }
});

WeatherTile.propTypes = {
    title: PropTypes.string.isRequired,
    shortForecast: PropTypes.string.isRequired,
    listedInformation: PropTypes.array.isRequired,
};


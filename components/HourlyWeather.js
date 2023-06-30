import React from "react";
import { StyleSheet, View, Text, ScrollView, FlatList } from "react-native";
import PropTypes from "prop-types";
import WeatherTile from "./WeatherTile";

export default function HourlyWeather(props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hourly Forecast</Text>
            <FlatList 
                data={props.forecast}
                renderItem={({item}) => <WeatherTile forecast={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                // ItemSeparatorComponent={() => <View style={{ width: 1 }} />}
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
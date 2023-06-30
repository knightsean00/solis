import React from "react";
import PropTypes from "prop-types";
import { View, Text, ActivityIndicator, StyleSheet, Pressable, Alert } from "react-native";

export default function LocationTile(props) {
    return (
        <Pressable
            onPress={() => {
                if (props.temperature != null) {
                    props.chooseLocation(props.locationIndex);
                }
            }}
            onLongPress={() => {
                if (!props.currentLocation) {
                    Alert.alert(
                        null,
                        `Do you want to delete weather data for ${props.locationInformation.city}`,
                        [
                            {
                                text: "Yes",
                                onPress: () => props.removeLocation(props.locationIndex)
                            },
                            {
                                text: "No",
                                style: "cancel"
                            },
                        ],
                        {cancelable: true}
                    );
                }
            }}
            style={({pressed}) => [
                {
                    backgroundColor: pressed ? "#eeeeee" : "#ffffff",
                }, styles.tile
            ]}
        > 
            <View style={styles.row}>
                <View style={styles.leftContainer}>
                    <Text style={styles.name}>{props.locationInformation.city}</Text>
                </View>
                <View style={styles.rightContainer}>
                    {
                        props.temperature != null ?
                            <>
                                <Text style={styles.temperature}>{props.temperature}{props.temperatureType}</Text>
                                <Text style={styles.forecast}>{props.weather}</Text>
                            </> :
                            <ActivityIndicator size="large" color="#000000" />
                    }
                </View>
            </View>
            {
                props.currentLocation ?
                    <View>
                        <Text style={{textAlign: "left", fontSize: 10}}>Current Location</Text>
                    </View> :
                    <></>
            }      
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        paddingVertical: "5%",
        paddingHorizontal: "3%",
        marginVertical: "2%",

        borderRadius: 10,
        borderColor: "#cccccc",
        borderWidth: 1,
    },
    row: {
        flexDirection: "row",
        alignItems: "center"
    },
    leftContainer: {
        flex: 4
    },
    rigthContainer: {
        flex: 1
    },
    name: {
        fontSize: 28,
        fontWeight: "bold",
    },
    temperature: {
        fontSize: 20,
        textAlign: "right"
    },
    forecast: {
        fontSize: 14,
        textAlign: "right"
    }
});

LocationTile.propTypes = {
    locationInformation: PropTypes.object,
    locationIndex: PropTypes.number,
    temperature: PropTypes.number,
    temperatureType: PropTypes.string,
    weather: PropTypes.string,
    currentLocation: PropTypes.bool,
    chooseLocation: PropTypes.func,
    removeLocation: PropTypes.func
};
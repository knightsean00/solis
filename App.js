import React, {useEffect, useState} from "react";
import { View, ActivityIndicator, StyleSheet, useColorScheme } from "react-native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";

// Forecast component
import Locations from "./routes/Locations"; 
import LookUp from "./components/LookUp";
import * as Location from "expo-location";
import { getLocationInformation, getNOAALocation } from "./common/helper";

// const Stack = createNativeStackNavigator();

export default function App() {
    // In the future, we can just call the Forecast component with lat long fed int
    const [loading, setLoading] = useState(true);
    const [locationInformation, setLocationInformation] = useState(null);

    const setCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setLoading(false);
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        if (location.coords) {
            const res = await getLocationInformation(location.coords.latitude, location.coords.longitude);
            setLocationInformation(res);
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentLocation();
    }, []);

    // const colorScheme = useColorScheme();
    // const themeContainer = colorScheme === "dark" ? styles.darkContainer : styles.lightContainer;

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#00ff00"/>
            </View>
        );
    }

    return (
        <>
            <View style={styles.parentContainer}>
                <Locations locationInformation={locationInformation} />
            </View>
            <StatusBar style="auto" />
        </>
        
    );
}

const styles = StyleSheet.create({
    parentContainer: {
        marginTop: Constants.statusBarHeight ? Constants.statusBarHeight * 1.2 : "5%", 
    },
    darkContainer: {
        backgroundColor: "#ffffff"
    },
    lightContainer: {
        backgroundColor: "#000000" 
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});

import React, {useEffect, useState} from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";

// Forecast component
import Locations from "./routes/Locations"; 
import * as Location from "expo-location";
import { getLocationInformation } from "./common/helper";
import { useColorScheme } from "react-native";
import * as SystemUI from "expo-system-ui";

// const Stack = createNativeStackNavigator();

export default function App() {
    // In the future, we can just call the Forecast component with lat long fed int
    const [loading, setLoading] = useState(true);
    const [locationInformation, setLocationInformation] = useState(null);
    const colorScheme = useColorScheme();

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
        try {
            SystemUI.setBackgroundColorAsync(colorScheme === "dark" ? "#000000" : "#ffffff");
        } catch (err) {
            console.log("Error setting root background color");
            console.log(err);
        }
        
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FF694D"/>
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

import React, {useEffect, useState} from "react";
import { ScrollView, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Forecast component
import Forecast from "./routes/Forecast";
import * as Location from "expo-location";

// const Stack = createNativeStackNavigator();

export default function App() {
    // In the future, we can just call the Forecast component with lat long fed int
    const [loading, setLoading] = useState(true);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [locationInformation, setLocationInformation] = useState(null);

    const setCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setLoading(false);
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        if (location.coords) {
            setLatitude(location.coords.latitude);
            setLongitude(location.coords.longitude);

            const reverseRes = (await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude}))[0];
            setLocationInformation({
                city: reverseRes.city,
                region: reverseRes.region,
                country: reverseRes.country,
                postalCode: reverseRes.postalCode
            });
            setLoading(false);
            console.log("Received coordinates, loading location weather");
        }
    };

    useEffect(() => {
        setCurrentLocation();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#00ff00"/>
            </View>
        );
    }

    return (
        // <NavigationContainer>
        //     <Stack.Navigator>
        //         <Stack.Screen name="Forecast" component={Forecast} />
        //     </Stack.Navigator>
        // </NavigationContainer>
        <>
            <ScrollView style={styles.parentContainer}>
                <Forecast latitude={latitude} longitude={longitude} locationInformation={locationInformation} />
            </ScrollView>
            <StatusBar style="auto" />
        </>
        
    );
}

const styles = StyleSheet.create({
    parentContainer: {
        marginTop: Constants.statusBarHeight ? Constants.statusBarHeight * 1.2 : "5%"
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});

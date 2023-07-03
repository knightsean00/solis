import React , {useState} from "react";
import PropTypes from "prop-types";
import { View, TextInput, StyleSheet, Alert, useColorScheme,  } from "react-native";
import * as Location from "expo-location";
import { getLocationInformation } from "../common/helper";


export default function LookUp(props) {
    const [input, setInput] = useState("");
    const colorScheme = useColorScheme();

    const handleSubmit = () => {
        Location.geocodeAsync(input + " USA").then((res) => {
            if (res.length > 0) {
                getLocationInformation(res[0].latitude, res[0].longitude).then(res1 => {
                    props.addLocation(res1);
                });
            } else {
                Alert.alert(null, "No locations with that description have been found");
            }
            setInput("");
        });
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Search locations"
                onChangeText={setInput}
                value={input}
                onSubmitEditing={handleSubmit}
                style={[styles.inputStyle, {color: colorScheme === "dark" ? "#ffffff" : "#000000"}]}
                returnKeyLabel="search"
                placeholderTextColor={colorScheme === "dark" ? "#ffffff" : "#000000"}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: "5%",
        paddingBottom: "8%",
        justifyContent: "center",
        alignItems:"center"
    },
    inputStyle: {
        borderRadius: 10,
        borderColor: "#cccccc",
        borderWidth: 1,
        paddingVertical: "2.5%",
        paddingHorizontal: "3%",
        minWidth: "75%",
        maxWidth: "75%",
        textAlign: "left",
    },
    row: {
        flexDirection: "row",
        alignItems: "center"
    },
    name: {
        fontSize: 32,
        fontWeight: "bold",
        flex: 3
    },
    temperature: {
        fontSize: 20,
        flex: 1,
        textAlign: "right"
    }
});

LookUp.propTypes = {
    addLocation: PropTypes.func
};


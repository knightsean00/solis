import React , {useState} from "react";
import PropTypes from "prop-types";
import { View, Text, TextInput, StyleSheet  } from "react-native";

export default function LookUp(props) {
    const [text, setText] = useState("");

    return (
        <View>
            <TextInput
                placeholder="Look Up A Location!"
                onChangeText={newText => setText(newText)}
                defaultValue={text}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    tile: {
        paddingVertical: "5%",
        paddingHorizontal: "3%",

        borderRadius: 10,
        borderColor: "#cccccc",
        borderWidth: 1,
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
};


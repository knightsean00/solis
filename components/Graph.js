import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, View, Dimensions, ScrollView} from "react-native";


// chart kit stuff
import {
    LineChart,
    // BarChart,
    // PieChart,
    // ProgressChart,
    // ContributionGraph,
    // StackedBarChart
} from "react-native-chart-kit";

export default function Graph(props) {
    const [graphLen, setGraphLen] = useState(0);
    const [graphTitleText, setGraphTitleText] = useState(null);
    const [yData, setYData] = useState([]);
    const [xData, setXData] = useState([]);
    const [curTime, setCurTime] = useState(0);

    useEffect(() => {    
        // if there is no data to be displayed, return nothing
        const len = props.yData.length;
        setGraphLen(len);
        
        setYData(props.yData);
        setXData(props.xData);

    }, []);

    if (props.yData.length === 0) {
        return (<></>);
    }

    return (
        <View style={styles.container}> 
            <Text> {props.title} </Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <LineChart
                    data={{
                        labels: xData,
                        datasets: [
                            {
                                data: yData
                            },
                            {
                                data: [Math.floor((Math.min(...yData) - 1) / 5) * 5],
                                withDots: false,
                            },
                            {
                                data: [Math.max(...yData)],
                                withDots: false,
                            }
                        ]
                    }}
                    width={Dimensions.get("window").width * 2} // from react-native
                    height={300}
                    yLabelsOffset={30}
                    yAxisSuffix="F"
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={{
                        backgroundGradientFrom: "#C1BFE9",
                        backgroundGradientTo: "#C1BFE9",
                        decimalPlaces: 0, // optional, defaults to 2dp
                        fillShadowGradientToOpacity: 0,
                        fillShadowGradientFromOpacity: .5,
                        withShadow: false,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        // style: {
                        //     borderRadius: 16
                        // },
                        propsForDots: {
                            r: "4",
                            strokeWidth: "2",
                            stroke: "#ffffff"
                        },
                    }}
                    bezier
                    style={{
                        marginVertical: "1%",
                    }}
                />
            </ScrollView>
        </View>
        
    );
}

Graph.propTypes = {
    yData: PropTypes.array,
    xData: PropTypes.array,
    title: PropTypes.string,
    yLabel: PropTypes.string,
    xLabel: PropTypes.string,
    time: PropTypes.number
};

const styles = StyleSheet.create({
    container: {
        marginVertical: "10%"
    },
});
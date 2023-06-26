import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, View, Dimensions, ScrollView} from "react-native";
import {  VictoryBar, VictoryAxis, VictoryChart, VictoryTheme } from "victory-native";

export default function WeatherBarGraph(props) {
    const [yData, setYData] = useState([]);
    const [xData, setXData] = useState([]);

    useEffect(() => {
        setYData(props.yData);
        setXData(props.xData);
    }, []);

    if (yData.length === 0 || xData.length === 0) {
        return (<></>);
    }

    const Gradient = props.gradient;

    const seen = new Set();

    return (
        <View style={styles.container}> 
            <Text style={styles.title}>{props.title}</Text>
            <ScrollView
                horizontal={true} 
                showsHorizontalScrollIndicator={false}
            >
                <VictoryChart
                    theme={VictoryTheme.material}
                    width={Dimensions.get("window").width * 2}
                    padding={{
                        left: 60,
                        top: 15,
                        bottom: 30,
                        right: 20
                    }}
                    domain={props.domain ? props.domain : undefined}
                >
                    <VictoryAxis
                        dependentAxis={true}
                        tickFormat={(t) => `${Math.round(t)}${props.yLabel}`}
                        style={{
                            axis: {
                                strokeWidth:1
                            }
                        }}
                    />
                    <VictoryBar
                        style={{ 
                            data: {
                                fill: "url(#gradient)",
                                // stroke: "#000000",
                                // strokeWidth: 1
                            }
                        }}
                        data={
                            yData.map((val, idx) => {
                                return {
                                    x: idx,
                                    y: val
                                };
                            })
                        }
                        animate={{
                            duration: 1000,
                            onLoad: { duration: 1000 }
                        }}
                    />
                    <VictoryAxis
                        tickCount={Math.floor(xData.length / 6)}
                        tickFormat={(t) => {
                            if (seen.has(xData[t].split(" ")[0])) {
                                return xData[t].split(" ")[1];
                            } else {
                                seen.add(xData[t].split(" ")[0]);
                                return xData[t];
                            }
                        }}
                        style={{
                            axis: {
                                strokeWidth:1
                            },
                            grid: {
                                strokeWidth:0
                            }
                        }}
                    />
                    <Gradient></Gradient>
                </VictoryChart>
            </ScrollView>
        </View>
        
    );
}

WeatherBarGraph.propTypes = {
    yData: PropTypes.array.isRequired,
    xData: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    yLabel: PropTypes.string.isRequired,
    xLabel: PropTypes.string,
    gradient: PropTypes.func.isRequired,
    domain: PropTypes.any
};

const styles = StyleSheet.create({
    container: {
        marginVertical: "5%"
    },
    title: {
        fontSize: 16
    }
});
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, View, Dimensions, ScrollView, useColorScheme} from "react-native";
import { VictoryLine, VictoryLabel, VictoryBar, VictoryAxis, VictoryChart, VictoryTheme } from "victory-native";
import { DateTime } from "luxon";
import { formatTime12 } from "../common/helper";

export default function WeatherBarGraph(props) {
    const [yData, setYData] = useState([]);
    const [xData, setXData] = useState([]);
    // const [animationStagger, setStagger] = useState(props.animationStagger ? props.animationStagger : 0);
    const colorScheme = useColorScheme();
    const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";

    useEffect(() => {
        setYData(props.yData);
        setXData(props.xData);
    }, []);

    if (yData.length === 0 || xData.length === 0) {
        return (<></>);
    }

    const Gradient = props.gradient;

    const lineSeen = new Set();
    const divisibleBy = 5;

    const domain = props.domain ? props.domain : {y: [
        Math.floor((Math.min(...yData) - 1) / divisibleBy)  * divisibleBy, 
        Math.ceil((Math.max(...yData) + 1) / divisibleBy)  * divisibleBy
    ]};

    return (
        <View style={styles.container}> 
            <Text style={[styles.title, {color: textColor}]}>{props.title}</Text>
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
                    domain={props.domain ? props.domain : domain}
                >
                    <VictoryAxis
                        dependentAxis={true}
                        tickFormat={(t) => `${Math.round(t)}${props.yLabel}`}
                        style={{
                            axis: {
                                strokeWidth:1,
                                stroke: textColor
                            },
                            ticks: {
                                stroke: textColor
                            },
                            tickLabels: {
                                fill: textColor
                            },
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
                        animate={false}
                        // animate={{
                        //     duration: 0,
                        //     delay: animationStagger,
                        //     onLoad: { duration: props.loadingSpeed },
                        //     onEnd: () => setStagger(0)
                        // }}
                    />
                    <VictoryAxis
                        tickCount={Math.floor(xData.length / 6)}
                        tickFormat={(t) => {
                            const date = xData[t];
                            return formatTime12(date, false);
                            // const dateValue = date.toLocaleString(DateTime.DATE_SHORT);
                            // if (seen.has(dateValue)) {
                            //     return formatTime12(date, false);
                            // } else {
                            //     seen.add(dateValue);
                            //     return formatTime12(date, true);
                            // }
                        }}
                        style={{
                            axis: {
                                strokeWidth:1,
                                stroke: textColor
                            },
                            grid: {
                                strokeWidth:0
                            },
                            ticks: {
                                stroke: textColor
                            },
                            tickLabels: {
                                fill: textColor
                            },
                        }}
                    />
                    {
                        xData.map((val, idx) => {
                            const date = val.toLocaleString(DateTime.DATE_SHORT);
                            if (lineSeen.has(date)) {
                                return (<React.Fragment key={`no-line-${idx}`}></React.Fragment>);
                            }
                            lineSeen.add(date);
                            return (
                                <VictoryLine
                                    key={`line-${idx}`}
                                    data={[
                                        // {x: idx, y: Math.min(...yData)},
                                        // {x: idx, y: Math.max(...yData)},
                                        {x: idx, y: props.domain ? props.domain.y[0] : Math.min(...yData)},
                                        {x: idx, y: props.domain ? props.domain.y[1] : Math.max(...yData)},
                                    ]}
                                    style={{
                                        data: {
                                            strokeWidth: 1,
                                            stroke: textColor
                                        },
                                        labels: {
                                            fill: textColor
                                        },
                                    }}
                                    labels={["", `${val.month}/${val.day}`]}
                                    labelComponent={<VictoryLabel dy={20} dx={20}/>}
                                />
                            );
                        })
                    }
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
    domain: PropTypes.any,
    animationStagger: PropTypes.number,
    loadingSpeed: PropTypes.number,
};

const styles = StyleSheet.create({
    container: {
        marginVertical: "5%"
    },
    title: {
        fontSize: 16
    }
});
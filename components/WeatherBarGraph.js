import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, View, Dimensions, ScrollView} from "react-native";
import { VictoryLine, VictoryLabel, VictoryBar, VictoryAxis, VictoryChart, VictoryTheme } from "victory-native";
import { DateTime } from "luxon";
import { formatTime12 } from "../common/helper";

export default function WeatherBarGraph(props) {
    const [yData, setYData] = useState([]);
    const [xData, setXData] = useState([]);
    const [animationStagger, setStagger] = useState(props.animationStagger ? props.animationStagger : 0);

    useEffect(() => {
        setYData(props.yData);
        setXData(props.xData);
    }, []);

    if (yData.length === 0 || xData.length === 0) {
        return (<></>);
    }

    const Gradient = props.gradient;

    const seen = new Set();
    const lineSeen = new Set();

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
                            duration: 500,
                            delay: animationStagger,
                            onLoad: { duration: props.loadingSpeed },
                            onEnd: () => setStagger(0)
                        }}
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
                                strokeWidth:1
                            },
                            grid: {
                                strokeWidth:0
                            }
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
                                        }
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
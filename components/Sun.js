import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Dimensions } from "react-native";
import PropTypes from "prop-types";
import { VictoryLabel, LineSegment, VictoryArea, VictoryAxis, VictoryChart, VictoryTheme, VictoryScatter } from "victory-native";
import { LinearGradient, Stop, Defs } from "react-native-svg";
// import { formatTimeLocale } from "../common/helper";
import { DateTime } from "luxon";

export default function Sun(props) {
    const [sunData, setSunData] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect

    const getSun = async (props) => {
        try {
            const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${props.latitude}&lng=${props.longitude}&formatted=0`, {
                method: "GET",
                headers: {
                    "User-Agent": "(knightsean00.github.io, knightsean00@gmail.com)"
                }
            });
            const pointInfo = await response.json();
            if (pointInfo) {
                setSunData({
                    sunRise: DateTime.fromISO(pointInfo.results.sunrise).setZone(props.timezone),
                    sunSet: DateTime.fromISO(pointInfo.results.sunset).setZone(props.timezone),
                    dayLength: pointInfo.results.day_length,
                    solarNoon: DateTime.fromISO(pointInfo.results.solar_noon).setZone(props.timezone)
                });
                setLoading(false);
            }
        
        }
        catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getSun(props);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#ff0000"/>
            </View>
        );
    }

    const ySunData = [0, -1, 0, 1, 0, -1, 0];
    const xSunData = [
        sunData.sunSet.minus({days: 1}), //Adding buffer
        DateTime.fromMillis((sunData.sunSet.minus({days: 1}) + sunData.sunRise) / 2),
        sunData.sunRise, 
        sunData.solarNoon, 
        sunData.sunSet, 
        sunData.sunSet.plus({milliseconds: (sunData.sunRise.plus({days: 1}) - sunData.sunSet) / 2}),
        sunData.sunRise.plus({days: 1}) //Adding buffer
    ];
    const beginning = sunData.sunRise.set({hour: 0, minute: 0, second: 0, milliseconds: 0});
    const end = sunData.sunSet.plus({days: 1}).set({hour: 0, minute: 0, second: 0, milliseconds: 0});

    const Gradient = () => (
        <Defs key={"gradient"}>
            <LinearGradient id={"gradient"} x1={"0%"} y={"0%"} x2={"0%"} y2={"100%"}>
                <Stop offset={"0%"} stopColor={"#e0a800"} stopOpacity={.5}/>
                <Stop offset={"50%"} stopColor={"#e00000"} stopOpacity={.5}/>
                <Stop offset={"100%"} stopColor={"#10004f"} stopOpacity={.8}/>
            </LinearGradient>
        </Defs>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sun Location</Text>
            <VictoryChart
                theme={VictoryTheme.material}
                width={Dimensions.get("window").width}
                padding={{
                    left: 5,
                    top: 20,
                    bottom: 30,
                    right: 15
                }}
                domain={{
                    x: [beginning.toUnixInteger(), end.toUnixInteger()]
                }}
            >
                <VictoryScatter
                    data={[
                        {x: DateTime.now().toUnixInteger(), y: 0}
                    ]}
                    size={10}
                />
                <VictoryAxis
                    dependentAxis={true}
                    tickFormat={(v) => ""}
                    style={{
                        axis: {
                            strokeWidth:1
                        },
                        grid: {
                            strokeWidth: 0
                        }
                    }}
                    tickComponent={<LineSegment style={{strokeWidth: 0}}/>}
                />
                <VictoryArea
                    style={{
                        data: {
                            fill: "url(#gradient)",
                            stroke: "#000000",
                            strokeWidth: 1
                        },
                    }}
                    data={
                        ySunData.map((val, idx) => {
                            return {
                                x: xSunData[idx].toUnixInteger(),
                                y: val
                            };
                        })
                    }
                    animate={{
                        duration: 2000,
                        onLoad: { duration: 3000 }
                    }}
                    interpolation="natural"
                    labels={["", "", "Sunrise\n" + xSunData[2].toLocaleString(DateTime.TIME_SIMPLE), "", "Sunset\n" + xSunData[4].toLocaleString(DateTime.TIME_SIMPLE), "", ""]}
                    labelComponent={<VictoryLabel dy={-60} />}
                    
                />
                <VictoryAxis
                    tickFormat={(v) => ""}
                    tickValues={[xSunData[2].toUnixInteger(), xSunData[4].toUnixInteger()]}
                    style={{
                        axis: {
                            strokeWidth:1
                        },
                        grid: {
                            stroke: "#000000",
                            opacity: .15
                        },
                    }}
                    tickComponent={<LineSegment style={{strokeWidth: 0}}/>}
                />
                <Gradient></Gradient>
            </VictoryChart>
        </View>
    );
}

Sun.propTypes = {
    longitude: PropTypes.number.isRequired,
    latitude: PropTypes.number.isRequired,
    timezone: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
    container: {
        marginVertical: "10%"
    },
    title: {
        fontSize: 16
    }
});
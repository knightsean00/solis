import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View, SafeAreaView, ScrollView, RefreshControl, Button, BackHandler } from "react-native";
import { formatTime12, takeEveryN, formatTimeLabel } from "../common/helper";
import { LinearGradient, Stop, Defs } from "react-native-svg";
import { DateTime } from "luxon";

// Graph component
import WeatherAreaGraph from "../components/WeatherAreaGraph";
import Sun from "../components/Sun";
import CurrentWeather from "../components/CurrentWeather";
import WeatherBarGraph from "../components/WeatherBarGraph";


export default function Forecast(props) {
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [moduleOrder, setModuleOrder] = useState([
        "temperature",
        "precipitation",
        "windSpeed",
        "humidity",
        "sun",
    ]);

    useEffect(() => {
        setForecast(props.forecast);

        const backAction = () => {
            props.return();
            return true;
        };
      
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction,
        );
      
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        if (forecast.length > 0) {
            setLoading(false);
        }
        
    }, [forecast]);
    
    // const [refreshing, setRefreshing] = useState(false);

    // const onRefresh = () => {
    //     setRefreshing(true);
    //     getLocationInformation(props.latitude, props.longitude).then(() => {
    //         setRefreshing(false);
    //     });
    // };

    // const getLocationInformation = async (latitude, longitude) => {
    //     try {
    //         const response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`, {
    //             method: "GET",
    //             headers: {
    //                 "User-Agent": "(knightsean00.github.io, knightsean00@gmail.com)"
    //             }
    //         });
    //         const pointInfo = await response.json();
    //         if (pointInfo) {
    //             const wfo = pointInfo.properties.gridId;
    //             const x = pointInfo.properties.gridX;
    //             const y = pointInfo.properties.gridY;
    //             await getWeatherConditions(wfo, x, y);
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };


    // const getWeatherConditions = async (wfo, x, y) => {
    //     try {
    //         const response = await fetch(`https://api.weather.gov/gridpoints/${wfo}/${x},${y}/forecast/hourly`, {
    //             method: "GET",
    //             headers: {
    //                 "User-Agent": "(knightsean00.github.io, knightsean00@gmail.com)",
    //                 // "Feature-Flags": ["forecast_temperature_qv", "forecast_wind_speed_qv"]
    //             }
    //         });
    //         const gridInfo = await response.json();
            
    //         if (gridInfo) {
    //             setForecast(gridInfo.properties.periods.map((period) => {
    //                 return {
    //                     temperature: period.temperature,
    //                     temperatureUnit: period.temperatureUnit,
    //                     probabilityOfPrecipitation: period.probabilityOfPrecipitation,
    //                     windSpeed: period.windSpeed,
    //                     windDirection: period.windDirection,
    //                     shortForecast: period.shortForecast,
    //                     humidity: period.relativeHumidity.value,
    //                     startTime: DateTime.fromISO(period.startTime),
    //                     endTime: DateTime.fromISO(period.endTime),
    //                 };
    //             }));
    //             setLoading(false);
    //         }
            
    //     } catch (err) {
    //         // console.log(err);
    //     }
    // };

    // useEffect(() => {
    //     if (props.latitude && props.longitude) {
    //         getLocationInformation(props.latitude, props.longitude);
    //     }
    // }, [props.latitude, props.longitude]);


    let text = "";
    if (errorMsg) {
        text = errorMsg;
    } else if (props.locationInformation) {
        // text = `${props.locationInformation.city}, ${props.locationInformation.region}`;
        text = `${props.locationInformation.city}`;
    }

    if (loading) {
        return (
            <View>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }
    const maxSlice = 64;
    const percentDomain = {
        y: [0, 100]
    };

    const weatherModuleTypes = {
        sun: {
            component: Sun,
            props: {
                longitude: props.locationInformation.longitude,
                latitude: props.locationInformation.latitude,
                timezone: forecast[0].endTime.zoneName,
                loadingSpeed: 2000,
                // refreshing: refreshing
            }
        },
        precipitation: {
            component: WeatherBarGraph,
            props: {
                title: "Precipitation",
                yLabel: "%",
                // xData: formatTimeLabel(forecast.map(period => period.endTime).slice(0, maxSlice)),
                xData: forecast.map(period => period.endTime).slice(0, maxSlice),
                yData: forecast.map(period => period.probabilityOfPrecipitation.value).slice(0, maxSlice),
                domain: percentDomain,
                gradient: PrecipitationGradient,
                loadingSpeed: 500,
            }
        },
        windSpeed: {
            component: WeatherBarGraph,
            props: {
                title: "Wind Speed",
                yLabel: forecast[0].windSpeed.split(" ")[1],
                // xData: formatTimeLabel(forecast.map(period => period.endTime).slice(0, maxSlice)),
                xData: forecast.map(period => period.endTime).slice(0, maxSlice),
                yData: forecast.map(period => Number(period.windSpeed.split(" ")[0])).slice(0, maxSlice),
                gradient: WindSpeedGradient,
                loadingSpeed: 500,
                domain: {
                    y: [0, Math.max(...forecast.map(period => Number(period.windSpeed.split(" ")[0])).slice(0, maxSlice))]
                }
            }
        },
        humidity: {
            component: WeatherAreaGraph,
            props: {
                title: "Humidity",
                yLabel: "%",
                // xData: formatTimeLabel(forecast.map(period => period.endTime).slice(0, maxSlice)),
                xData: forecast.map(period => period.endTime).slice(0, maxSlice),
                yData: forecast.map(period => period.humidity).slice(0, maxSlice),
                domain: percentDomain,
                gradient: HumidityGradient,
                loadingSpeed: 2000,
            }
        },
        temperature: {
            component: WeatherAreaGraph,
            props: {
                title: "Temperature",
                yLabel: "°" + forecast[0].temperatureUnit,
                // xData: formatTimeLabel(forecast.map(period => period.endTime).slice(0, maxSlice)),
                xData: forecast.map(period => period.endTime).slice(0, maxSlice),
                yData: forecast.map(period => period.temperature).slice(0, maxSlice),
                gradient: TemperatureGradient,
                loadingSpeed: 2000,
            },
        },
    };

    let cumulativeDelay = 0;
    return (
        <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            // refreshControl={
            //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            // }
        >
            <Text style={styles.headerText} numberOfLines={1} adjustsFontSizeToFit>{text}</Text>
            <CurrentWeather weather={forecast[0]}/>
            {
                moduleOrder.map((componentName, idx) => {
                    const delay = cumulativeDelay > 0 ? cumulativeDelay + 1000 : cumulativeDelay;
                    cumulativeDelay = delay + weatherModuleTypes[componentName].props.loadingSpeed;
                    return React.createElement(weatherModuleTypes[componentName].component, {
                        ...weatherModuleTypes[componentName].props, 
                        key: idx, 
                        animationStagger: delay});
                })
            }
            <Button
                onPress={props.return}
                title="Back"
                color="#841584"
            />
            {
                props.removeLocation ? 
                    <Button
                        onPress={() => {props.removeLocation(); props.return();}}
                        title={`Remove ${props.locationInformation.city}`}
                        color="#d43c48"
                    /> :
                    <></>
            }
            
        </ScrollView>
    );
}

const TemperatureGradient = () => (
    <Defs key={"gradient"}>
        <LinearGradient id={"gradient"} x1={"0%"} y={"0%"} x2={"0%"} y2={"100%"}>
            <Stop offset={"0%"} stopColor={"#ff0000"} stopOpacity={.25}/>
            <Stop offset={"100%"} stopColor={"#001aff"} stopOpacity={.25}/>
        </LinearGradient>
    </Defs>
);

const HumidityGradient = () => (
    <Defs key={"gradient"}>
        <LinearGradient id={"gradient"} x1={"0%"} y={"0%"} x2={"0%"} y2={"100%"}>
            <Stop offset={"0%"} stopColor={"#219fdf"} stopOpacity={.5}/>
            <Stop offset={"100%"} stopColor={"#219fdf"} stopOpacity={0}/>
        </LinearGradient>
    </Defs>
);

const WindSpeedGradient = () => (
    <Defs key={"gradient"}>
        <LinearGradient id={"gradient"} x1={"0%"} y={"0%"} x2={"0%"} y2={"100%"}>
            <Stop offset={"0%"} stopColor={"#5a5783"} stopOpacity={1}/>
            <Stop offset={"100%"} stopColor={"#5a5783"} stopOpacity={1}/>
        </LinearGradient>
    </Defs>
);

const PrecipitationGradient = () => (
    <Defs key={"gradient"}>
        <LinearGradient id={"gradient"} x1={"0%"} y={"0%"} x2={"0%"} y2={"100%"}>
            <Stop offset={"0%"} stopColor={"#219fdf"} stopOpacity={1}/>
            <Stop offset={"100%"} stopColor={"#219fdf"} stopOpacity={1}/>
        </LinearGradient>
    </Defs>
);


const styles = StyleSheet.create({
    container: {
        marginHorizontal: "2%",
        marginBottom: "3%"
    },
    headerText: {
        fontSize: 32,
        fontWeight: "bold"
    }
}); 

Forecast.propTypes = {
    forecast: PropTypes.array,
    locationInformation: PropTypes.object,
    return: PropTypes.func,
    removeLocation: PropTypes.func
};

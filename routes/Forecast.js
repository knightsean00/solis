import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ActivityIndicator, StyleSheet, Text, View, Button, BackHandler, useColorScheme } from "react-native";
import { LinearGradient, Stop, Defs } from "react-native-svg";
import chroma from "chroma-js";

// Graph component
import WeatherAreaGraph from "../components/WeatherAreaGraph";
import Sun from "../components/Sun";
import CurrentWeather from "../components/CurrentWeather";
import WeatherBarGraph from "../components/WeatherBarGraph";
import HourlyWeather from "../components/HourlyWeather";
import WeatherForecast from "../components/WeatherForecast";


export default function Forecast(props) {
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [moduleOrder, setModuleOrder] = useState([
        "hourly",
        "daily",
        "temperature",
        "precipitation",
        "windSpeed",
        "humidity",
        "sun",
    ]);
    const colorScheme = useColorScheme();
    const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";

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
                <ActivityIndicator size="large" color="#87dfe5"/>
            </View>
        );
    }
    const maxSlice = 64;
    const percentDomain = {
        y: [0, 100]
    };
    const tempDomain = {
        y: [
            Math.floor((Math.min(...forecast.map(period => period.temperature).slice(0, maxSlice)) - 1) / 50)  * 50, 
            Math.ceil((Math.max(...forecast.map(period => period.temperature).slice(0, maxSlice)) + 1) / 50)  * 50
        ]
    };

    const weatherModuleTypes = {
        hourly: {
            component: HourlyWeather,
            props: {
                forecast: forecast.slice(1,24)
            }
        },
        daily: {
            component: WeatherForecast,
            props: {
                forecast: forecast
            }
        },
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
                xData: forecast.map(period => period.endTime).slice(0, maxSlice),
                yData: forecast.map(period => Number(period.windSpeed.split(" ")[0])).slice(0, maxSlice),
                gradient: WindSpeedGradient,
                loadingSpeed: 500,
                domain: {
                    y: [
                        0, 
                        Math.ceil((Math.max(...forecast.map(period => Number(period.windSpeed.split(" ")[0])).slice(0, maxSlice)) + 1) / 5) * 5
                    ]
                }
            }
        },
        humidity: {
            component: WeatherAreaGraph,
            props: {
                title: "Humidity",
                yLabel: "%",
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
                xData: forecast.map(period => period.endTime).slice(0, maxSlice),
                yData: forecast.map(period => period.temperature).slice(0, maxSlice),
                domain: tempDomain,
                gradient: TemperatureGradientBuilder(tempDomain.y[0], tempDomain.y[1], 0, 100),
                loadingSpeed: 2000,
            },
        },
    };

    let cumulativeDelay = 0;
    return (
        <View 
            style={styles.container} 
            // refreshControl={
            //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            // }
        >
            <Text style={[styles.headerText, {color: textColor}]} numberOfLines={1} adjustsFontSizeToFit>{text}</Text>
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
            <View style={{width:"45%", alignSelf:"center"}}>
                <View style={{marginBottom: "10%"}}>
                    <Button
                        onPress={props.return}
                        title="Back"
                        color="#841584"
                    />
                </View>
                {
                    props.removeLocation ? 
                        <View style={{marginBottom: "5%"}} >
                            <Button
                                onPress={() => {props.removeLocation(); props.return();}}
                                title={`Remove ${props.locationInformation.city}`}
                                color="#d43c48"
                            />
                        </View> :
                        <></>
                }
            </View>
        </View>
    );
}

const TemperatureGradientBuilder = (yMin, yMax, min, max) => {
    const percentageYMin = Math.max(Math.min((yMin - min) / (max - min), 1), 0);
    const percentageYMax = Math.max(Math.min((yMax - min) / (max - min), 1), 0);
    
    // const scale = chroma.scale(["#4700a3", "#0012ff", "#ff67a0", "#ff8839", "#ff3700", "#ff0000", "#5b0000"]);
    const scale = chroma.scale(["#163bb0", "#FF5252"]);

    // console.log(percentageYMax);
    // console.log(percentageYMin);
    const TemperatureGradient = () => (
        <Defs key={"gradient"}>
            <LinearGradient id={"gradient"} x1={"0%"} y1={"0%"} x2={"0%"} y2={"100%"}>
                <Stop offset={"0%"} stopColor={`${scale(percentageYMax).hex()}`} stopOpacity={1}/>
                <Stop offset={"100%"} stopColor={`${scale(percentageYMin).hex()}`} stopOpacity={.5}/>
            </LinearGradient>
        </Defs>
    );
    return TemperatureGradient;
};

// const TemperatureGradient = () => (
    
// );

const HumidityGradient = () => (
    <Defs key={"gradient"}>
        <LinearGradient id={"gradient"} x1={"0%"} y1={"0%"} x2={"0%"} y2={"100%"}>
            <Stop offset={"0%"} stopColor={"#219fdf"} stopOpacity={1}/>
            <Stop offset={"100%"} stopColor={"#219fdf"} stopOpacity={0}/>
        </LinearGradient>
    </Defs>
);

const WindSpeedGradient = () => (
    <Defs key={"gradient"}>
        <LinearGradient id={"gradient"} x1={"0%"} y1={"0%"} x2={"0%"} y2={"100%"}>
            <Stop offset={"0%"} stopColor={"#5a5783"} stopOpacity={1}/>
            <Stop offset={"100%"} stopColor={"#5a5783"} stopOpacity={1}/>
        </LinearGradient>
    </Defs>
);

const PrecipitationGradient = () => (
    <Defs key={"gradient"}>
        <LinearGradient id={"gradient"} x1={"0%"} y1={"0%"} x2={"0%"} y2={"100%"}>
            <Stop offset={"0%"} stopColor={"#219fdf"} stopOpacity={1}/>
            <Stop offset={"100%"} stopColor={"#219fdf"} stopOpacity={1}/>
        </LinearGradient>
    </Defs>
);


const styles = StyleSheet.create({
    container: {
        marginHorizontal: "2%"
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

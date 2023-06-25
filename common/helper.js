export function cToF(celsius) {
    return celsius * (9 / 5) + 32;
}

export function fToC(fahrenheit) {
    return (fahrenheit - 32) * (5 / 9);
}

export function formatTime12(date, includeDate) {
    let hour = date.getHours();
    let timeOfDay = "am";
    if (hour > 11) {
        timeOfDay = "pm";
    }

    if (hour > 12) {
        hour -= 12;
    }

    if (hour === 0) {
        hour = 12;
    }

    if (includeDate)
        return `${date.getMonth() + 1}/${date.getDate()} ${hour}${timeOfDay}`;
    return `${hour}${timeOfDay}`;
}

export function formatTimeLabel(dates) {
    const seen = new Set();
    return dates.map(date => {
        if (seen.has(date.getDate())) {
            return formatTime12(date, false);
        } else {
            seen.add(date.getDate());
            return formatTime12(date, true);
        }
    });
}

export function takeEveryN(array, n) {
    const newArray = [];
    for (let i = 0; i < array.length; i += n)
        newArray.push(array[i]);
    return newArray;
}
const fs = require("fs");
const { DateTime } = require("luxon");
const axios = require('axios');

const arrayHoliday = [
    { MM: '01', dd: '01', calendar: 'solar', expand: 0, alternate: '', name: '양력설' },
    { MM: '01', dd: '01', calendar: 'lunar', expand: 1, alternate: 's',  name: '설날', },
    { MM: '03', dd: '01', calendar: 'solar', expand: 0, alternate: '', name: '3·1절' },
    { MM: '04', dd: '08', calendar: 'lunar', expand: 0, alternate: '', name: '부처님오신날', },
    { MM: '05', dd: '05', calendar: 'solar', expand: 0, alternate: 'ss',  name: '어린이날' },
    { MM: '06', dd: '06', calendar: 'solar', expand: 0, alternate: '', name: '현충일' },
    { MM: '08', dd: '15', calendar: 'solar', expand: 0, alternate: '', name: '광복절' },
    { MM: '08', dd: '15', calendar: 'lunar', expand: 1, alternate: 's',  name: '추석', },
    { MM: '10', dd: '03', calendar: 'solar', expand: 0, alternate: '', name: '개천절' },
    { MM: '10', dd: '09', calendar: 'solar', expand: 0, alternate: '', name: '한글날' },
    { MM: '12', dd: '25', calendar: 'solar', expand: 0, alternate: '', name: '기독탄신일' },
];

const convertCalendarSolarToLunar = async ({yyyy, MM, dd}) => {
    const response = await axios({
        method: 'GET',
        url: `https://astro.kasi.re.kr/life/lunc`,// ?yyyy=2020&mm=01&dd=01`,
        params: {
            yyyy,
            mm: MM,
            dd,
        }
    });
    const row = response.data[0];
    return {
        yyyy: row.SOLC_YYYY,
        MM: row.SOLC_MM,
        dd: row.SOLC_DD,
    };
};

function checkAlternate(dateTime, alternate) {
    if(alternate === 'ss')
        return dateTime.weekday === 6 || dateTime.weekday === 7;

    if(alternate === 's')
        return dateTime.weekday === 7;
    
    return false;
}

function nextWeekday(dateTime) {
    while(checkAlternate(dateTime, 'ss')) {
        dateTime = dateTime.plus({days: 1});
    }
    return dateTime;
}

async function calcHoliday(yyyy) {
    const arrayHolidaySolar = await Promise.all(arrayHoliday.map(async v => {
        if (v.calendar !== 'lunar') {
            return {
                ...v,
                yyyy,
                calendar: undefined
            }
        }

        const lunar = await convertCalendarSolarToLunar({
            ...v,
            yyyy,
        });
        return {
            ...v,
            ...lunar,
            calendar: undefined
        }
    }));
    const arrayHolidaySolarDateTime = arrayHolidaySolar
        .map(v => ({
            dateTime: DateTime.local(+v.yyyy, +v.MM, +v.dd),
            expand: v.expand,
            alternate: v.alternate,
            name: v.name,
        }));
    const arrayHolidaySolarDateTimeApplyAlternateExpand = arrayHolidaySolarDateTime
        .flatMap(v => {
            if (!v.alternate) {
                if (!v.expand) {
                    return v;
                } else {
                    const theDay = v.dateTime;
                    const yesterday = theDay.minus({days: 1});
                    const tomorrow = theDay.plus({days: 1});
                    return [
                        {...v, dateTime: yesterday},
                        {...v, dateTime: theDay},
                        {...v, dateTime: tomorrow},
                    ];
                }
            } else {
                if (!v.expand) {
                    if (checkAlternate(v.dateTime, v.alternate)) {
                        return [
                            v,
                            {...v, dateTime: nextWeekday(v.dateTime), name: v.name + '(대체)'},
                        ];
                    } else {
                        return v;
                    }
                } else {
                    const theDay = v.dateTime;
                    const yesterday = theDay.minus({days: 1});
                    const tomorrow = theDay.plus({days: 1});
                    if ([theDay, yesterday, tomorrow].some(d => checkAlternate(d, v.alternate))) {
                        return [
                            {...v, dateTime: yesterday, name: v.name + '(앞날)'},
                            {...v, dateTime: theDay},
                            {...v, dateTime: tomorrow, name: v.name + '(뒷날)'},
                            {...v, dateTime: nextWeekday(tomorrow), name: v.name + '(대체)'},
                        ];
                    } else {
                        return [
                            {...v, dateTime: yesterday, name: v.name + '(앞날)'},
                            {...v, dateTime: theDay},
                            {...v, dateTime: tomorrow, name: v.name + '(뒷날)'},
                        ];
                    }
                }
            }
        });
    return arrayHolidaySolarDateTimeApplyAlternateExpand.map(v => ({
            date: v.dateTime.toISODate(),
            weekday: v.dateTime.weekday,
            name: v.name,
        }));
}

(async () => {
    try {
        const arrayArrayHoliday = await Promise.all(Array(20).fill(0).map((v, i) => i + 2000).map(async yyyy => await calcHoliday(yyyy)));
        const arrayHoliday = arrayArrayHoliday.flat();
        const arrayHolidayNormalized = arrayHoliday.map(({date, name}) => ({date, name}));
        const mapHoliday = arrayHolidayNormalized.reduce((a, v) => ({...a, [v.date]: v.name}), {});
        fs.writeFileSync('holiday.generated.json', JSON.stringify(mapHoliday, null, 4), 'utf-8');
    } catch(e) {
        console.error(e);
    }
})();
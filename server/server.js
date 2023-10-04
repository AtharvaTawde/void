const cors = require('cors');
const express = require('express')
const fs = require('fs');
const app = express()
const axios = require('axios');
const cheerio = require('cheerio');
const port = 3001

// Technicals
const ema = require("./technicals/ema.js");
const generic = require("./technicals/generic.js");

app.use(cors({ origin: '*' }))

app.use(express.json());

app.get('/', (req, res) => {
    let db = require("./db.json");
    res.send(db)
})

app.post('/', (req, res) => {
    fs.writeFile("./db.json", JSON.stringify(req.body), err => {
        if (err) {
            console.error(err);
        }
    });
    res.send("Successfully written to file.");
})

app.get('/stock/:ticker', (req, res) => {

    let main = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://finance.yahoo.com/quote/${req.params.ticker}`,
        headers: {
            "Void-Token": (Math.random() * Math.pow(10, 9)).toString(),
            "Host": "finance.yahoo.com",
            "User-Agent": "Void/1.0.0",
            "Accept": "*/*",
            'Accept-Encoding': 'gzip',
            "Connection": "keep-alive",
        },
        data: ''
    };

    let history = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://finance.yahoo.com/quote/${req.params.ticker}/history`,
        headers: {
            "Void-Token": (Math.random() * Math.pow(10, 9)).toString(),
            "Host": "finance.yahoo.com",
            "User-Agent": "Void/1.0.0",
            "Accept": "*/*",
            'Accept-Encoding': 'gzip',
            "Connection": "keep-alive",
        },
        data: ''
    };

    // Try Later | url: `https://query1.finance.yahoo.com/v8/finance/chart/${req.params.ticker}`,

    axios.request(main)
        .then((response) => {
            r = JSON.stringify(response.data);

            // Colors
            let [green, red, neutral] = ["#00a89d", "#d10f0f", "d1d1d1"];

            let $ = cheerio.load(r);
            let line = $("fin-streamer").text().split(")")[6];

            const price = parseFloat(line.split(".")[0] + "." + line.split(".")[1].slice(0, 2));
            const title = $("title").text().split(" (")[0];
            const previousClose = $("tr:contains('Previous Close')").find("td").text().split("Previous Close")[1];
            const open = $("tr:contains('Open')").find("td").text().split("Open")[1];
            const volume = $("tr:nth-of-type(7):contains('Volume')").find("td").text().split("Volume")[1];
            const marketCap = $("tr:contains('Market Cap')").find("td").text().split("Market Cap")[1];

            const gain = price - previousClose;
            const percentGain = gain / previousClose * 100;

            axios.request(history).then(response => {
                r = JSON.stringify(response.data);
                $ = cheerio.load(r);

                // Grab previous closes.
                let prevCloses = [];
                let index = 2;
                const trackingDays = 70;
                while (prevCloses.length < trackingDays) {
                    let close = parseFloat($(`tr:nth-of-type(${index})`).find("td:nth-of-type(6)").find("span").text());
                    if (!isNaN(close)) {
                        prevCloses.push(close);
                    }
                    index++;
                }

                // Grab opens.
                let opens = [];
                index = 1;
                while (opens.length < trackingDays) {
                    let open = parseFloat($(`tr:nth-of-type(${index})`).find("td:nth-of-type(2)").find("span").text());
                    if (!isNaN(open)) {
                        opens.push(open);
                    }
                    index++;
                }

                // Grab highs.
                let highs = [];
                index = 1;
                while (highs.length < trackingDays) {
                    let high = parseFloat($(`tr:nth-of-type(${index})`).find("td:nth-of-type(3)").find("span").text());
                    if (!isNaN(high)) {
                        highs.push(high);
                    }
                    index++;
                }

                // Grab lows.
                let lows = [];
                index = 1;
                while (lows.length < trackingDays) {
                    let low = parseFloat($(`tr:nth-of-type(${index})`).find("td:nth-of-type(4)").find("span").text());
                    if (!isNaN(low)) {
                        lows.push(low);
                    }
                    index++;
                }

                // Grab current closes.
                let closes = [];
                index = 1;
                while (closes.length < trackingDays) {
                    let close = parseFloat($(`tr:nth-of-type(${index})`).find("td:nth-of-type(6)").find("span").text());
                    if (!isNaN(close)) {
                        closes.push(close);
                    }
                    index++;
                }

                // Grab volumes.
                let volumes = [];
                index = 1;
                while (volumes.length < trackingDays) {
                    let volume = parseFloat($(`tr:nth-of-type(${index})`).find("td:nth-of-type(7)").find("span").text());
                    if (!isNaN(volume)) {
                        volumes.push(volume);
                    }
                    index++;
                }

                const shortExponentialMovingAverage = ema.sema(prevCloses);
                const longExponentialMovingAverage = ema.lema(prevCloses);
                const shortSimpleMovingAverage = ema.ssma(prevCloses);
                const longSimpleMovingAverage = ema.lsma(prevCloses);
                const accumulationDistributionSlope = generic.accumulationDistribution(closes, lows, highs, volumes);
                const averageDirectionalIndex = generic.averageDirectionalIndex(closes, lows, highs);
                const macd = generic.macd(closes, 26, 12, 9);

                const uyMin = Math.min(...lows);
                const uyMax = Math.max(...highs);
                const roundingConstant = uyMax - uyMin < 1 ? 0.1 : uyMax - uyMin < 10 ? 1 : uyMax - uyMin < 100 ? 10 : uyMax - uyMin < 1000 ? 100 : 1000;

                const yMin = Math.floor(0.9 * Math.min(...lows) / roundingConstant) * roundingConstant - (roundingConstant < 10 ? roundingConstant : 0);
                const yMax = Math.ceil(1.1 * Math.max(...highs) / roundingConstant) * roundingConstant + (roundingConstant < 10 ? roundingConstant : 0);
                const yStepSize = (yMax - yMin) / 10;

                let dates = [];
                let i = 0;
                while (dates.length < trackingDays) {
                    const date = new Date(Date.now() - i * 1000 * 60 * 60 * 24);
                    if (date.getDay() != 6 && date.getDay() != 0) { // Remove weekends.
                        dates = [date.setHours(0, 0, 0, 0), ...dates];
                    }
                    i++;
                }

                let technicalsDisplayList = [
                    {
                        name: "20-Day Simple Moving Average",
                        descriptor: "SMA20",
                        value: shortSimpleMovingAverage,
                        color: price > shortSimpleMovingAverage ? green : price < shortSimpleMovingAverage ? red : neutral,
                        rating: price > shortSimpleMovingAverage ? "Buy" : price < shortSimpleMovingAverage ? "Sell" : "Neutral"
                    },
                    {
                        name: "50-Day Simple Moving Average",
                        descriptor: "SMA50",
                        value: longSimpleMovingAverage,
                        color: price > longSimpleMovingAverage ? green : price < longSimpleMovingAverage ? red : neutral,
                        rating: price > longSimpleMovingAverage ? "Buy" : price < longSimpleMovingAverage ? "Sell" : "Neutral"
                    },
                    {
                        name: "20-Day Exponential Moving Average",
                        descriptor: "EMA20",
                        value: shortExponentialMovingAverage,
                        color: price > shortExponentialMovingAverage ? green : price < shortExponentialMovingAverage ? red : neutral,
                        rating: price > shortExponentialMovingAverage ? "Buy" : price < shortExponentialMovingAverage ? "Sell" : "Neutral"
                    },
                    {
                        name: "50-Day Exponential Moving Average",
                        descriptor: "EMA50",
                        value: longExponentialMovingAverage,
                        color: price > longExponentialMovingAverage ? green : price < longExponentialMovingAverage ? red : neutral,
                        rating: price > longExponentialMovingAverage ? "Buy" : price < longExponentialMovingAverage ? "Sell" : "Neutral"
                    },
                    {
                        name: "Short vs. Long EMA Comparison",
                        descriptor: "EMA20?50",
                        value: shortExponentialMovingAverage > longExponentialMovingAverage ? 1 : 0,
                        color: shortExponentialMovingAverage > longExponentialMovingAverage ? green : shortExponentialMovingAverage < longExponentialMovingAverage ? red : neutral,
                        rating: shortExponentialMovingAverage > longExponentialMovingAverage ? "Buy" : shortExponentialMovingAverage < longExponentialMovingAverage ? "Sell" : "Neutral"
                    },
                    {
                        name: "Slope of 70-Day Accumulation / Distribution",
                        descriptor: "A/D",
                        value: accumulationDistributionSlope,
                        color: gain > 0 && accumulationDistributionSlope > 0 ? green : gain < 0 && accumulationDistributionSlope < 0 ? red : neutral,
                        rating: gain > 0 && accumulationDistributionSlope > 0 ? "Buy" : gain < 0 && accumulationDistributionSlope < 0 ? "Sell" : "Neutral"
                    },
                    {
                        name: "Moving Average Convergence / Divergence",
                        descriptor: "MACD (26/12/9)",
                        value: macd,
                        color: macd > 0 ? green : macd < 0 ? red : neutral,
                        rating: macd > 0 ? "Buy" : macd < 0 ? "Sell" : "Neutral",
                    },
                ]

                let trendStrengthDisplayList = [
                    {
                        name: "Average Directional Movement Index",
                        descriptor: "ADX",
                        value: averageDirectionalIndex,
                        color: averageDirectionalIndex < 50 ? red : averageDirectionalIndex > 50 ? green : neutral,
                        rating: averageDirectionalIndex < 20 ? "Nonexistent" : averageDirectionalIndex < 40 ? "Weak" : averageDirectionalIndex < 50 ? "Moderate" : averageDirectionalIndex < 70 ? "Strong" : "Powerful",
                    },
                ]

                let ratings = [technicalsDisplayList.filter(t => t.rating == "Buy").length, technicalsDisplayList.filter(t => t.rating == "Neutral").length, technicalsDisplayList.filter(t => t.rating == "Sell").length]
                let [buys, neutrals, sells] = ratings;

                // Determine Technical Rating
                const precedenceThreshold = 5;
                let rating = Math.max(...ratings) == neutrals ? "Neutral" : Math.max(...ratings) == buys ? buys - sells >= precedenceThreshold ? "Strong Buy" : "Buy" : buys - sells <= -precedenceThreshold ? "Strong Sell" : "Sell";

                data = {
                    title,
                    rating,
                    price,
                    gain: parseFloat(gain),
                    percentGain: parseFloat(percentGain),
                    previousClose: parseFloat(previousClose),
                    open: parseFloat(open),
                    volume,
                    marketCap,
                    technicals: {
                        shortExponentialMovingAverage,
                        longExponentialMovingAverage,
                        shortSimpleMovingAverage,
                        longSimpleMovingAverage,
                        accumulationDistributionSlope,
                        averageDirectionalIndex,
                        macd,
                    },
                    technicalsDisplayList,
                    trendStrengthDisplayList,
                    config: {
                        data: {
                            datasets: [{
                                type: 'bar',
                                data: opens.map((_, i) => (
                                    {
                                        x: dates[i],
                                        o: opens[opens.length - 1 - i],
                                        h: highs[highs.length - 1 - i],
                                        l: lows[lows.length - 1 - i],
                                        c: closes[closes.length - 1 - i],
                                        s: [opens[opens.length - 1 - i], closes[closes.length - 1 - i]],
                                    }
                                )),
                                backgroundColor: opens.map((_, i) => opens[opens.length - 1 - i] < closes[closes.length - 1 - i] ? "green" : "red"),
                                borderColor: 'black',
                                borderWidth: 1,
                                borderSkipped: false, // adds the border to the bottom of the bar.
                            }],
                        },
                        options: {
                            parsing: {
                                xAxisKey: 'x',
                                yAxisKey: 's',
                            },
                            plugins: {
                                legend: {
                                    display: false,
                                },
                            },
                            scales: {
                                x: {
                                    type: 'timeseries',
                                    time: {
                                        unit: "week",
                                    },
                                },
                                y: {
                                    min: yMin,
                                    max: yMax,
                                    ticks: {
                                        stepSize: yStepSize,
                                    }
                                }
                            },
                        }
                    }
                }

                console.log(data);
                res.send(data);
            }).catch((error) => {
                console.log(error);
            });
        })
        .catch((error) => {
            console.log(error);
        });
})

app.listen(port, () => {
    console.log(`The Void is listening on port ${port}`)
})
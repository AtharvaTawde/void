// The A / D line helps to show how supply and demand factors 
// are influencing price.A / D can move in the same direction 
// as price changes or in the opposite direction.

// The multiplier in the calculation provides a gauge for 
// how strong the buying or selling was during a particular
// period.It does this by determining whether the price 
// closed in the upper or lower portion of its range. This 
// is then multiplied by the volume.Therefore, when a stock 
// closes near the high of the period’s range and has high 
// volume, it will result in a large A / D jump. 
// Alternatively, if the price finishes near the high of 
// the range but volume is low, or if the volume is high 
// but the price finishes more toward the middle of the range, 
// then the A / D will not move up as much.

const ema = require("./ema.js");

function sum(thing) {
    return thing.reduce((a, b) => a + b, 0);
}

function linReg(x, y, length) {
    let xBar = (sum(x) / x.length) || 0;
    let yBar = (sum(y) / y.length) || 0;

    // r is Pearson's correlation coefficient, used for linear regression, and
    // is equal to sum((x-xBar)(y-yBar)) / sqrt(sum((x-xBar)^2) * sum((y-yBar)^2))

    let xMinusXBar = x.map(a => a - xBar);
    let yMinusYBar = y.map(a => a - yBar);
    let product = xMinusXBar.map((a, i) => a * yMinusYBar[i]);
    let xSquared = xMinusXBar.map(a => a * a);
    let ySquared = yMinusYBar.map(a => a * a);

    let r = sum(product) / Math.sqrt(sum(xSquared) * sum(ySquared));

    // m is slope. Now use m = r * standard deviation of y over the standard 
    // deviation of x
    let sdY = Math.sqrt(sum(ySquared) / (length - 1));
    let sdX = Math.sqrt(sum(xSquared) / (length - 1));

    let m = r * sdY / sdX;
    return m;
}

function wilderSmoothing(sequence, smoothPeriods) {
    let smoothies = [sum(sequence)];
    for (let i = 1; i < smoothPeriods; i++) {
        let next = smoothies[i - 1] - (smoothies[i - 1] / 14) + sequence[i];
        smoothies.push(next);
    }

    return smoothies[smoothies.length - 1];
}

function accumulationDistribution(closes, lows, highs, volumes) {
    x = [];
    for (let i = 0; i < closes.length; i++) {
        x.push(i);
    }

    // Gather A/Ds.
    let y = [];

    for (let i = 0; i < closes.length; i++) {
        const close = closes[i];
        const low = lows[i];
        const high = highs[i];
        const volume = volumes[i];
        const moneyFlowMultiplier = ((close - low) - (high - close)) / (high - low)
        const moneyFlowVolume = moneyFlowMultiplier * volume;
        const ad = y.length == 0 ? moneyFlowVolume : y[y.length - 1] + moneyFlowVolume;
        y.push(ad);
    }

    let m = linReg(x, y, closes.length);

    return m;
}


function averageDirectionalIndex(closes, lows, highs) {
    // Calculate Directional Movement (DM)s and True Range (TR)s.

    let n = 14;

    let plusDMs = [];
    let minusDMs = [];
    let TRs = [];

    // Typically these values are calculated for 14 days.
    for (let i = n - 1; i >= 0; i--) {
        let currentHigh = highs[highs.length - 1 - i];
        let previousHigh = highs[highs.length - 2 - i];
        let currentLow = lows[lows.length - 1 - i];
        let previousLow = lows[lows.length - 2 - i];
        let previousClose = closes[closes.length - 2];


        let upMove = currentHigh - previousHigh;
        let downMove = previousLow - currentLow;

        let plusDM = upMove > downMove && upMove > 0 ? upMove : 0;
        let minusDM = downMove > upMove && downMove > 0 ? downMove : 0;

        let TR = Math.max(currentHigh - currentLow, currentHigh - previousClose, currentLow - previousClose);

        plusDMs.push(plusDM);
        minusDMs.push(minusDM);
        TRs.push(TR);
    }

    // Continue: https://en.wikipedia.org/wiki/Average_directional_movement_index

    let smoothedPlusDM = wilderSmoothing(plusDMs, n);
    let smoothedMinusDM = wilderSmoothing(minusDMs, n);

    let ATRs = [sum(TRs) / n]
    for (let i = 1; i < n; i++) {
        let nextATR = (ATRs[i - 1] * (n - 1) + TRs[i]) / n;
        ATRs.push(nextATR);
    }

    let ATR = ATRs[ATRs.length - 1];

    let plusDI = smoothedPlusDM / ATR * 100;
    let minusDI = smoothedMinusDM / ATR * 100;

    // ADX Definition: https://capital.com/average-directional-index
    let ADX = 100 * Math.abs(plusDI - minusDI) / Math.abs(plusDI + minusDI) / ATR;

    return ADX;
}

function macd(closes, l1, l2, l3) {
    let macds = [];

    // Calculate and store MACDs for previous l3 days.
    for (let i = l3 - 1; i >= 0; i--) {
        let c = closes.slice(0, closes.length - i);
        let macd = ema.ema(c, l2) - ema.ema(c, l1);
        macds.push(macd);
    }

    // Calculate SMA of MACDs
    let s = sum(macds) / l3;
    let multiplier = 2 / (l3 + 1);

    // Calculate EMA of MACDs
    let emas = [];

    for (let i = 0; i < macds.length; i++) {
        let prev = emas.length > 0 ? emas[emas.length - 1] : s;
        let ema = (macds[i] - prev) * multiplier + prev;
        emas.push(ema);
    }

    return emas[emas.length - 1] - macds[macds.length - 1];
}

module.exports = { accumulationDistribution, averageDirectionalIndex, macd }



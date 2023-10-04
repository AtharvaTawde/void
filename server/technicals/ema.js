// A buy- or golden-cross signal occurs when a shorter-term EMA 
// moves above a longer-term EMA, known as a golden-cross signal. 

// A sell signal (known as a death cross) can be identified 
// when a short-term EMA line moves below a longer-term EMA 
// line. Since EMA is one of the moving average indicators, 
// it can also provide the opportunity to determine potential 
// support and resistance levels.

function ssma(closes) {
    const sum = closes.slice(20, 40).reduce((a, b) => a + b, 0);
    const simpleMovingAverage = (sum / 20) || 0;

    return simpleMovingAverage;
}

function sema(closes) {
    let simpleMovingAverage = ssma(closes);

    const multiplier = 2 / (20 + 1);

    let emas = [];

    for (let i = 19; i >= 0; i--) {
        let prev = emas.length > 0 ? emas[emas.length - 1] : simpleMovingAverage;
        let ema = (closes[i] - prev) * multiplier + prev;
        emas.push(ema);
    }

    const exponentialMovingAverage = emas[emas.length - 1];
    return exponentialMovingAverage;
}

function lsma(closes) {
    const sum = closes.slice(50).reduce((a, b) => a + b, 0);
    const simpleMovingAverage = (sum / 20) || 0;

    return simpleMovingAverage;
}

function lema(closes) {
    let simpleMovingAverage = lsma(closes);

    const multiplier = 2 / (50 + 1);

    let emas = [];

    for (let i = 49; i >= 0; i--) {
        let prev = emas.length > 0 ? emas[emas.length - 1] : simpleMovingAverage;
        let ema = (closes[i] - prev) * multiplier + prev;
        emas.push(ema);
    }

    const exponentialMovingAverage = emas[emas.length - 1];
    return exponentialMovingAverage;
}

function sma(sequence, n) {
    const sum = sequence.slice(n, n + 20).reduce((a, b) => a + b, 0);
    const simpleMovingAverage = (sum / 20) || 0;

    return simpleMovingAverage;
}

function ema(sequence, n) {
    let simpleMovingAverage = sma(sequence, n);

    const multiplier = 2 / (n + 1);

    let emas = [];

    for (let i = n; i >= 0; i--) {
        let prev = emas.length > 0 ? emas[emas.length - 1] : simpleMovingAverage;
        let ema = (sequence[i] - prev) * multiplier + prev;
        emas.push(ema);
    }

    const exponentialMovingAverage = emas[emas.length - 1];
    return exponentialMovingAverage;
}

module.exports = { ssma, sema, lsma, lema, sma, ema }
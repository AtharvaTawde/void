import './App.css';
import React from 'react';
import axios from 'axios';
import Technicals from "./Technicals";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, TimeSeriesScale, LineElement, PointElement } from 'chart.js'
import "chartjs-adapter-date-fns";


ChartJS.register(LineElement, PointElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, TimeSeriesScale);
ChartJS.defaults.font.family = "CamptonBook";

let refreshRate = 15000; // Card refreshes every 10s.

function requestStock(ticker) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'http://localhost:3001/stock/' + ticker,
        headers: {
            'Content-Type': 'application/json'
        },
    };

    return axios.request(config).then(res => res.data);
}

class Search extends React.Component {

    constructor() {
        super();
        this.state = {
            typedTicker: "",
            currentTicker: "",
            currentTitle: "",
            currentPrice: 0,
            currentGain: 0,
            currentPercentGain: 0,
            currentVolume: 0,
            currentPreviousClose: 0,
            currentOpen: 0,
            currentMarketCap: 0,
            currentTechnicals: {
                currentSEMA: 0,
                currentLEMA: 0,
                currentSSMA: 0,
                currentLSMA: 0,
                currentADS: 0,
                currentADX: 0,
                currentMACD: 0,
            },
            technicalsDisplayList: [],
            trendStrengthDisplayList: [],
            rating: "",
            config: {},
        }
        this.allowSearch = true;
        this.time = 0;
        this.color = "rgb(250, 246, 246)";
    }


    search() {
        if (this.allowSearch) {
            this.allowSearch = false;

            requestStock(this.state.typedTicker).then(data => {
                let entry = {
                    currentTicker: this.state.typedTicker,
                    currentTitle: data.title,
                    currentRating: data.rating,
                    currentPrice: data.price,
                    currentGain: data.gain,
                    currentPercentGain: data.percentGain,
                    currentVolume: data.volume,
                    currentPreviousClose: data.previousClose,
                    currentOpen: data.open,
                    currentMarketCap: data.marketCap,
                    currentTechnicals: {
                        currentSEMA: data.technicals.shortExponentialMovingAverage,
                        currentLEMA: data.technicals.longExponentialMovingAverage,
                        currentSSMA: data.technicals.shortSimpleMovingAverage,
                        currentLSMA: data.technicals.longSimpleMovingAverage,
                        currentADS: data.technicals.accumulationDistributionSlope,
                        currentADX: data.technicals.averageDirectionalIndex,
                        currentMACD: data.technicals.macd,
                    },
                    technicalsDisplayList: data.technicalsDisplayList,
                    trendStrengthDisplayList: data.trendStrengthDisplayList,
                    config: data.config,
                }

                this.setState(entry);
                this.allowSearch = true;
            })
        }
    }

    render() {

        // Reload quantities every 5 seconds.
        if (Date.now() - this.time >= refreshRate && this.state.currentTicker.length > 0) {
            requestStock(this.state.currentTicker).then(data => {
                let entry = {
                    // PrevClose, Open, MarketCap and Technicals are excluded.
                    currentPrice: data.price,
                    currentGain: data.gain,
                    currentPercentGain: data.percentGain,
                    currentTitle: data.title,
                    currentVolume: data.volume,
                }

                // Prevent refreshing data that was queried before a new search. 
                if (this.state.currentTitle == entry.currentTitle) {
                    this.setState(entry);
                }
            })

            this.time = Date.now();
        }

        return (
            <div className='search card' style={{ width: "80%" }}>
                <h3>Search</h3>
                <p className='unbold'>{this.allowSearch ? "" : "Fetching data. Engine is currently engaged in a search."}</p>

                <input className='queryBar unbold' placeholder='Enter Ticker' type='text' value={this.state.typedTicker.toUpperCase()} onChange={e => this.setState({ typedTicker: e.target.value })} onKeyDown={(e) => {
                    if (e.code == "Enter") {
                        this.search();
                    }
                }} />
                <button onClick={() => { this.search(); }}>Search Ticker</button>

                {this.state.currentTicker == "" ? (
                    <div className='card' style={{ backgroundColor: "rgb(250, 246, 246)" }}><p>Please begin a new Search.</p></div>
                ) : (
                    <>
                        <div className='card' style={{ backgroundColor: "rgb(250, 246, 246)" }}>
                            <div className='grid-2'>
                                <div>
                                    <h3>{this.state.currentTicker.toUpperCase()}</h3>
                                    <h5 className='unbold'>{this.state.currentTitle}</h5>
                                </div>
                                <div className='unbold' style={{ textAlign: 'right' }}>{this.state.currentRating}</div>
                            </div>
                            <br />

                            <div className={"outerCircle " + (this.state.currentPercentGain > 0 ? "up" : this.state.currentPercentGain < 0 ? "down" : "neutral")}>
                                <div className='innerCircle' style={{ backgroundColor: "rgb(250, 246, 246)" }}>
                                    <h1 style={{ textAlign: "center" }}>${this.state.currentPrice.toFixed(2)}</h1>
                                </div>
                            </div>

                            <Bar
                                type={this.state.config.type}
                                data={this.state.config.data}
                                options={this.state.config.options}
                            />
                            <br />

                            <div className='grid-3'>
                                <div>
                                    <h5 className='unbold'>GAIN</h5>
                                    <p>{this.state.currentGain > 0 ? "+" : this.state.currentGain < 0 ? "-" : ""}${Math.abs(this.state.currentGain).toFixed(2)}</p>
                                </div>
                                <div>
                                    <h5 className='unbold' style={{ textAlign: 'center' }}>PERCENT GAIN</h5>
                                    <p style={{ textAlign: 'center' }}>{this.state.currentPercentGain > 0 ? "+" : this.state.currentPercentGain < 0 ? "-" : ""}{Math.abs(this.state.currentPercentGain).toFixed(2)}%</p>
                                </div>
                                <div>
                                    <h5 className='unbold' style={{ textAlign: 'right' }}>VOLUME</h5>
                                    <p style={{ textAlign: 'right' }}>{this.state.currentVolume}</p>
                                </div>
                            </div>
                        </div>
                        <Technicals search={this} />
                    </>
                )}
            </div >
        )
    }
}

export default Search;

import './App.css';
import axios from "axios"
import React from 'react';
import Search from './Search'

const refreshInterval = 60000; // 30s

function requestPersonalDatabase() {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'http://localhost:3001/',
    headers: {
      'Content-Type': 'application/json'
    },
  };

  return axios.request(config).then(res => res.data);
}

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

function getTickerInformation(application) {
  application.state.watchlist.map(ticker => {
    requestStock(ticker).then(data => {
      // If ticker not in values

      let entry = {
        name: ticker,
        title: data.title,
        price: data.price,
        gain: data.gain,
        percentGain: data.percentGain
      }

      if (!application.state.values.map(item => item.name).includes(ticker)) {
        application.setState({ values: [...application.state.values, entry] });
      } else {
        let index = application.state.values.map(item => item.name).indexOf(ticker);
        let sub = application.state.values;
        sub[index] = entry;
        application.setState({ values: sub })
      }
    })
  });
}

class App extends React.Component {

  constructor() {
    super()
    this.state = {
      watchlist: [],
      watchlistLoaded: false,
      values: [],
      time: 0,
    }
    this.initialLoad = false;
    this.watchlistLoaded = false;
    this.time = Date.now();
    this.centralTime = Date.now();
  }

  render() {
    requestPersonalDatabase().then(res => {
      this.setState({ watchlist: res })
    }).then(() => {
      this.watchlistLoaded = true;

      // Initial Loading.
      if (!this.initialLoad) {
        console.log("Initial Loading Invoked.");
        getTickerInformation(this);
        this.initialLoad = true;
      }

      // Reload quantities every refreshInterval seconds.
      if (Date.now() - this.time >= refreshInterval) {
        getTickerInformation(this);
        this.time = Date.now();
      }
    });

    if (this.watchlistLoaded && this.initialLoad) {
      return (
        <body>
          <div>
            <h1>Void</h1>
            <h3>Trending</h3>
            {this.state.values.length == 0 ? <h5>Loading Trending Tickers...</h5> : (
              this.state.values.map(ticker => (
                <h5>{ticker.name}: ${ticker.price} ({ticker.percentGain}%)</h5>)
              )
            )}

            <Search />
          </div>
        </body>
      )
    } else {
      return <h5>Loading... Check if the client can connect to the server. Check if the server is actually on.</h5>
    }
  }
}

export default App;

# Void: Stock Dashboard and Technical Analysis

## Get Started

Node.js is required to run this project. 
### `npm install yarn` 
Will install the package manager `yarn`, which handles the packages used in this project.

### `yarn`
Will install all the necessary dependencies in order to run the project.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Boots up the clientside application locally.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `yarn server`

Boots up the serverside application locally.\
Open [http://localhost:3001](http://localhost:3001) to view it in your browser.

## Features

A search bar to browse through the thousands of tickers out there.
![image](https://github.com/AtharvaTawde/void/assets/15206414/6b38ebce-8f97-4356-a0a9-dd4276f3d32a)

A simple candlestick chart that displays the daily price action. 
![image](https://github.com/AtharvaTawde/void/assets/15206414/fc386b62-eafb-472e-b941-31287df8b6d2)

A technical panel to display metrics and their naive interpretations.
![image](https://github.com/AtharvaTawde/void/assets/15206414/e3517e42-718d-439a-9044-8376d6ff4675)

## How it works

All raw data is scraped using the Axios and Cheerio libraries and parsed serverside. The client communicates with the server to display the information cleanly. When a user enters a valid ticker into the search-box, a request is sent to the server to scrape the corresponding Yahoo Finance page. When all data is collected, the information is displayed on the page.

![image](https://github.com/AtharvaTawde/void/assets/15206414/e4cc14ba-e1a1-47fe-8990-98e0f9734e38)

# Playa Vista Food Adventures
A single page app to show where to eat in Playa Vista, CA, and make your own food adventures.

## Synopsis

Playa Vista Food Adventures allows you to view a map of all restaurants near Playa Vista.
You can filter by restaurant type (Italian, Pizza, etc) and distance.
You can create an 'eatlist' which you can use to remember where you'd like to eat, and which places you have already eaten at.

## Code Description

This app is built using a few technologies and frameworks. For the frontend, it uses the [Knockout](http://knockoutjs.com) JavaScript library.

The map is built using [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/).

Restaurant data is populated from [Yelp's Fusion API](https://www.yelp.com/developers).

The backend server, which serves as a middleman to make calls to Yelp's API, is built using the [Flask Python framework](http://flask.pocoo.org).

## Motivation

This is a project for my [Udacity Full Stack Web Developer Nanodegree](https://www.udacity.com/course/full-stack-web-developer-nanodegree--nd004), in which we needed to create a neighborhood application using Knockout and Google Maps API, and integrating other APIs.

## Installation

1. Clone this project, and enter the project directory
2. Create a `config.py` file by duplicating the existing `config-sample.py`
3. Fill in data within your `config.py` as specified within the file's comments
4. We use Grunt to handle build tasks, and have included a `package.json` and `Gruntfile.js`. If you haven't used Grunt before, please see [Getting Started instructions](https://gruntjs.com/getting-started), specifically ['Working with an existing Grunt project'](https://gruntjs.com/getting-started#working-with-an-existing-grunt-project).
5. To build a `dist` folder, run one of the following:
```
grunt build
grunt buildDev
```
`build` and `buildDev` are the same, except for `buildDev` does not compress JS files, allowing for easier debugging.
6. Install virtualenv if not already installed. [Instructions here](https://virtualenv.pypa.io/en/stable/installation/).
7. Create a new virtual environment, and activate it.
```
virtualenv venv
. venv/bin/activate
```
8. Install python dependencies:
```
pip install -r requirements.txt
```
9. Change to the `dist/` diretory:
```
cd dist
```
10. To launch python server:
```
export FLASK_APP=playa-vista.py
export FLASK_DEBUG=1
flask run
```
Flask debug is optional and should not be run on a production server.
11. Open a new terminal, and start the python server for front end:
```
python -m SimpleHTTPServer 8000
```
12. The front end is accessible at `locahost:8000`. Backend python server is accessible at `localhost:5000`

## Tests

No test suite currently.

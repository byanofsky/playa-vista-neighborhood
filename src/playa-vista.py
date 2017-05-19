from flask import Flask, request, render_template, session, jsonify

import yelpapi
import requests
from config import FLASK_SECRET_KEY

app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY

# Access control allow origin
ORIGIN = 'http://localhost:8000'


@app.route('/')
def restaurant_search():
    try:
        # Get query parameters
        url_params = request.args
        # Make yelp api search request
        search_results = yelpapi.search(url_params)
        return (
            jsonify(search_results),
            200,
            {'Access-Control-Allow-Origin': ORIGIN}
        )
    # Catch errors from request and return to client
    except requests.exceptions.RequestException as e:
        # Check if connection error and return 500, or pass error code through
        status_code = (500
                       if isinstance(e, requests.exceptions.ConnectionError)
                       else e.response.status_code)
        return (str(e), status_code)

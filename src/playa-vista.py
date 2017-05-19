from flask import Flask, request, render_template, session, jsonify

import yelpapi
import requests
import time
from config import FLASK_SECRET_KEY

app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY

# Access control allow origin
ORIGIN = 'http://localhost:8000'

# Cache Yelp API results in memory
# Structure:
# {'categories': 'distance_1': {..., 'expires': xyz}, 'distance_2': {...}}
YELP_API_RESULTS = {}


def get_search_results(url_params):
    """Get yelp api search results from memory, or make new request.
    Args:
        url_params (dict): Parameters to pass to Yelp API.
    Returns:
        dict: Yelp API search results.
    Raises:
        RequestException: An error occurs from the HTTP request.
    """
    categories = url_params['categories']
    radius = url_params['radius']
    # Check if results already in memory
    categories_exists = bool(YELP_API_RESULTS.get(categories))
    print 'Category exists %s' % categories_exists
    radius_exists = categories_exists\
        and bool(YELP_API_RESULTS[categories].get(radius))
    print 'Radius exists %s' % radius_exists
    search_results_exists = radius_exists\
        and bool(YELP_API_RESULTS[categories][radius].get('search_results'))
    print 'Search Results exists %s' % search_results_exists
    cache_valid = radius_exists\
        and YELP_API_RESULTS[categories][radius]['cache'] > time.time()
    print 'Cache valid %s' % cache_valid
    if radius_exists:
        print 'Time to Cache Expire: %s' % (
            YELP_API_RESULTS[categories][radius]['cache'] - time.time()
        )
    search_results_valid = search_results_exists and cache_valid
    if not search_results_valid:
        if not categories_exists:
            YELP_API_RESULTS[categories] = {}
        if not radius_exists:
            YELP_API_RESULTS[categories][radius] = {}
        if not cache_valid or not search_results_exists:
            search_results = yelpapi.search(url_params)
            YELP_API_RESULTS[categories][radius]['search_results'] = search_results
            YELP_API_RESULTS[categories][radius]['cache'] = time.time()+60
    return YELP_API_RESULTS[categories][radius]['search_results']


@app.route('/')
def restaurant_search():
    try:
        # Get query parameters
        url_params = request.args
        # Check if required parameters are passed for main app
        if not (url_params.get('categories') and url_params.get('radius')):
            response = {
                'error': {
                    'code': 'BAD_REQUEST',
                    'msg': 'categories and radius parameters are required'
                }
            }
            return (jsonify(response), 500,
                    {'Access-Control-Allow-Origin': ORIGIN})
        # Make yelp api search request
        search_results = get_search_results(url_params)
        YELP_API_RESULTS = jsonify(search_results)
        return (
            YELP_API_RESULTS,
            200,
            {'Access-Control-Allow-Origin': ORIGIN}
        )
    # Catch errors from request and return to client
    except requests.exceptions.RequestException as e:
        # Check if connection error and return 500, or pass error code through
        status_code = (500
                       if isinstance(e, requests.exceptions.ConnectionError)
                       else e.response.status_code)
        return (str(e), status_code, {'Access-Control-Allow-Origin': ORIGIN})

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
    key = categories + '|' + radius

    # Check if data already in memory
    print 'Checking cached Yelp data.'
    data = YELP_API_RESULTS.get(key)
    if not data:
        print 'New search. Not cached yet.'
        YELP_API_RESULTS[key] = {}
    else:
        # Check that data has search results
        search_results_exist = data.get('search_results')
        print 'Search Results Exist: %s' % bool(search_results_exist)
        # Check that cache hasn't expired
        cache_valid = data.get('cache') > time.time()
        print 'Cache_valid: %s' % bool(cache_valid)

    # Boolean to determine if new search performed
    perform_new_search = not (data and search_results_exist and cache_valid)
    if perform_new_search:
        print 'Getting new Yelp data'
        YELP_API_RESULTS[key]['search_results'] = yelpapi.search(url_params)
        YELP_API_RESULTS[key]['cache'] = time.time() + 15

    cache_expiration = YELP_API_RESULTS[key]['cache'] - time.time()
    print 'Time to cache expiration: %s' % (cache_expiration)
    return YELP_API_RESULTS[key]['search_results']


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

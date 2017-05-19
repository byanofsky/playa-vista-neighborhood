from __future__ import print_function

import json
import requests
import urllib
# TODO: do I need urllib?
# Fall back to Python 2's urllib2 and urllib
from urllib2 import HTTPError
from urllib import quote
from urllib import urlencode

import config

# OAuth credentials
CLIENT_ID = config.YELP_CLIENT_ID
CLIENT_SECRET = config.YELP_CLIENT_SECRET

# API constants
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
BUSINESS_PATH = '/v3/businesses/'  # Business ID will come after slash.
TOKEN_PATH = '/oauth2/token'
GRANT_TYPE = 'client_credentials'


def get_bearer_token():
    """Get yelp api bearer token.
    Returns:
        dict: OAuth bearer token and expiration time, obtained using client_id
            and client_secret.
    Raises:
        RequestException: An error occurs from the HTTP request.
    """
    # Set parameters for request
    url = '{0}{1}'.format(API_HOST, quote(TOKEN_PATH.encode('utf8')))
    data = urlencode({
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': GRANT_TYPE,
    })
    headers = {
        'content-type': 'application/x-www-form-urlencoded',
    }
    # Make request to Yelp API for bearer token
    print('Requesting Yelp API bearer token.')
    response = requests.request('POST', url, data=data, headers=headers)
    print('Yelp API bearer token response: {0}'.format(response.status_code))
    # Raise if there are errors
    response.raise_for_status()
    return response


def request(host, path, bearer_token, url_params=None):
    """Given a bearer token, send a GET request to the API.
    Args:
        host (str): The domain host of the API.
        path (str): The path of the API after the domain.
        bearer_token (str): OAuth bearer token, obtained using client_id and
            client_secret.
        url_params (dict): An optional set of query parameters in the request.
    Returns:
        dict: The JSON response from the request.
    Raises:
        RequestException: An error occurs from the HTTP request.
    """
    # Set parameters for request
    url_params = url_params or {}
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    headers = {
        'Authorization': 'Bearer %s' % bearer_token,
    }
    # Make request to api
    print(u'Querying {0} ...'.format(url))
    response = requests.request('GET', url, headers=headers, params=url_params)
    print(u'API Response: {0}.'.format(response.status_code))
    # Raise for any errors
    response.raise_for_status()
    return response.json()


def search(url_params):
    """Query the Search API by a search term and location.
    Args:
        url_params (dict): Parameters to pass to Yelp API.
    Returns:
        dict: The JSON response from the request.
    Raises:
        RequestException: An error occurs from the HTTP request.
    """
    # Get bearer token response
    bearer_token = get_bearer_token().json().get('access_token')
    # If there is no access token, most likely an error
    return request(API_HOST, SEARCH_PATH, bearer_token, url_params)


def get_business(bearer_token, business_id):
    """Query the Business API by a business ID.
    Args:
        bearer_token (str): OAuth bearer token, obtained using client_id and
            client_secret.
        business_id (str): The ID of the business to query.
    Returns:
        dict: The JSON response from the request.
    """
    business_path = BUSINESS_PATH + business_id
    return request(API_HOST, business_path, bearer_token)

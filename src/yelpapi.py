from __future__ import print_function

import argparse
import json
import pprint
import requests
import sys
import urllib

# Fall back to Python 2's urllib2 and urllib
from urllib2 import HTTPError
from urllib import quote
from urllib import urlencode

import config

# OAuth credential placeholders that must be filled in by users.
# You can find them on
# https://www.yelp.com/developers/v3/manage_app
CLIENT_ID = config.YELP_CLIENT_ID
CLIENT_SECRET = config.YELP_CLIENT_SECRET

# API constants, you shouldn't have to change these.
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
BUSINESS_PATH = '/v3/businesses/'  # Business ID will come after slash.
TOKEN_PATH = '/oauth2/token'
GRANT_TYPE = 'client_credentials'


def obtain_bearer_token():
    """Given a bearer token, send a GET request to the API.
    Returns:
        dict: OAuth bearer token and expiration time, obtained using client_id and client_secret.
    Raises:
        HTTPError: An error occurs from the HTTP request.
    """
    url = '{0}{1}'.format(API_HOST, quote(TOKEN_PATH.encode('utf8')))
    data = urlencode({
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': GRANT_TYPE,
    })
    headers = {
        'content-type': 'application/x-www-form-urlencoded',
    }
    response = requests.request('POST', url, data=data, headers=headers)
    bearer_token = response.json()
    return bearer_token


def get_bearer_token(stored_bearer_token):
    """Check if bearer token is valid, or obtain a new one.
    Args:
        stored_bearer_token (dict): bearer token to check if still valid
    Returns:
        dict: OAuth bearer token
    Raises:
        HTTPError: An error occurs from the HTTP request.
    """
    bearer_token = stored_bearer_token
    if not (bearer_token) or \
            not (bearer_token.get('access_token') \
                 and bearer_token.get('expires_in') > 0):
        print(u'Getting new Yelp bearer token')
        bearer_token = obtain_bearer_token()
    return bearer_token


def request(host, path, bearer_token, url_params=None):
    """Given a bearer token, send a GET request to the API.
    Args:
        host (str): The domain host of the API.
        path (str): The path of the API after the domain.
        bearer_token (str): OAuth bearer token, obtained using client_id and client_secret.
        url_params (dict): An optional set of query parameters in the request.
    Returns:
        dict: The JSON response from the request.
    Raises:
        HTTPError: An error occurs from the HTTP request.
    """
    url_params = url_params or {}
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    headers = {
        'Authorization': 'Bearer %s' % bearer_token,
    }

    print(u'Querying {0} ...'.format(url))

    response = requests.request('GET', url, headers=headers, params=url_params)

    return response.json()


def search(bearer_token, term, location, search_limit):
    """Query the Search API by a search term and location.
    Args:
        term (str): The search term passed to the API.
        location (str): The search location passed to the API.
    Returns:
        dict: The JSON response from the request.
    """
    url_params = {
        'term': term.replace(' ', '+'),
        'location': location.replace(' ', '+'),
        'limit': search_limit
    }
    return request(API_HOST, SEARCH_PATH, bearer_token['access_token'], url_params=url_params)


def get_business(bearer_token, business_id):
    """Query the Business API by a business ID.
    Args:
        business_id (str): The ID of the business to query.
    Returns:
        dict: The JSON response from the request.
    """
    business_path = BUSINESS_PATH + business_id

    return request(API_HOST, business_path, bearer_token)


def query_api(bearer_token, term, location):
    """Queries the API by the input values from the user.
    Args:
        term (str): The search term to query.
        location (str): The location of the business to query.
    """
    response = search(bearer_token, term, location)

    businesses = response.get('businesses')

    if not businesses:
        print(u'No businesses for {0} in {1} found.'.format(term, location))
        return

    # business_id = businesses[0]['id']

    print(u'{0} businesses found, querying business info '.format(len(businesses)))
    pprint.pprint(businesses, indent=2)
    # response = get_business(bearer_token, business_id)

    # print(u'Result for business "{0}" found:'.format(business_id))
    # pprint.pprint(response, indent=2)

def call_yelp_api(term, location):
    try:
        query_api(term, location)
    except HTTPError as error:
        print('Encountered HTTP error {0} on {1}:\n {2}\nAbort program.'.format(
            error.code,
            error.url,
            error.read(),
        ))

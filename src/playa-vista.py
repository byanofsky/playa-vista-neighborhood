from flask import Flask, request, render_template, session, jsonify
from config import FLASK_SECRET_KEY
import yelpapi
app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY

@app.route('/')
def yelp_search():
    categories = request.args.get('categories')
    location = request.args.get('location')
    search_limit = request.args.get('limit')
    radius = request.args.get('radius')
    sort_by = request.args.get('sort_by')
    bearer_token = session.get('yelpapi_bearer_token')
    bearer_token = yelpapi.get_bearer_token(bearer_token)
    session['yelpapi_bearer_token'] = bearer_token
    search_results = yelpapi.search(
        bearer_token=bearer_token,
        categories=categories,
        location=location,
        search_limit=search_limit,
        radius=radius,
        offset=None,
        sort_by=sort_by
    )
    print(search_results)
    if (search_results.get('error') and
            search_results['error']['code'] == 'TOKEN_INVALID'):
        return (jsonify(search_results), 401)
    else:
        return (jsonify(search_results),
                200,
                {'Access-Control-Allow-Origin': 'http://localhost:8000'})

@app.route('/categories/')
def categories_list():
    # Set search limit to Yelp API max: 50
    SEARCH_LIMIT = 50
    # Get query parameters
    categories = request.args.get('categories')
    location = request.args.get('location')
    radius = request.args.get('radius')
    bearer_token = session.get('yelpapi_bearer_token')
    # Get Yelp API bearer token
    bearer_token = yelpapi.get_bearer_token(bearer_token)
    session['yelpapi_bearer_token'] = bearer_token
    # Perform Yelp API search
    search_results = yelpapi.search(
        bearer_token=bearer_token,
        categories=categories,
        location=location,
        search_limit=SEARCH_LIMIT,
        radius=radius
    )
    # Get total from search results
    total = search_results['total']
    # Get businesses from search results
    businesses = search_results['businesses']
    print(len(businesses))
    print([b['name'] for b in businesses])

    # Perform query a few times to get a few businesses
    i = 1 # start at 1, since already performed 1 search
    total_desired = 200 # How many businesses total to capture
    # Limit total businesses either to total or total_desired, whichever is less
    total_limit = min(total, total_desired)
    while (i * SEARCH_LIMIT < total_limit):
        search_results = yelpapi.search(
            bearer_token=bearer_token,
            categories=categories,
            location=location,
            search_limit=SEARCH_LIMIT,
            radius=radius,
            offset=i*SEARCH_LIMIT
        )
        businesses.extend(search_results['businesses'])
        i += 1
        print(len(businesses))
        print([b['name'] for b in businesses])
    categories_dict = {}
    for business in businesses:
        businesses_categories = business['categories']
        for cat in businesses_categories:
            categories_dict[cat['alias']] = cat
    categories_list = [{'alias': categories_dict[c]['alias'], 'title': categories_dict[c]['title']} for c in categories_dict]
    if (search_results.get('error') and
            search_results['error']['code'] == 'TOKEN_INVALID'):
        return (jsonify(search_results), 401)
    else:
        return (jsonify(categories_list),
                200,
                {'Access-Control-Allow-Origin': 'http://localhost:8000'})

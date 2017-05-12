from flask import Flask, request, render_template, session, jsonify
from config import FLASK_SECRET_KEY
import yelpapi
app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY

@app.route('/')
def yelp_search():
    search = request.args.get('search')
    location = request.args.get('location')
    bearer_token = session.get('yelpapi_bearer_token')
    bearer_token = yelpapi.get_bearer_token(bearer_token)
    session['yelpapi_bearer_token'] = bearer_token
    search_results = yelpapi.search(
        bearer_token,
        search,
        location,
        20
    )
    print(search_results)
    if (search_results.get('error') and
            search_results['error']['code'] == 'TOKEN_INVALID'):
        return (jsonify(search_results), 401)
    else:
        return (jsonify(search_results),
                200,
                {'Access-Control-Allow-Origin': 'http://localhost:8000'})

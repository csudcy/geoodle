import logging
import os

from flask import Flask, request, jsonify, send_from_directory, render_template


app = Flask(__name__, static_url_path='/static')
logger = logging.getLogger(__name__)


@app.route('/')
def index():
    # return app.send_static_file('html/index.html')
    return render_template(
        'index.html',
        google_api_key=os.environ['GOOGLE_API_KEY'],
    )


@app.route('/static/<path:path>')
def send_js(path):
    return send_from_directory(path)


if __name__ == '__main__':
    app.run()

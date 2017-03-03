from flask import Flask, request, jsonify


app = Flask(__name__, static_url_path='/static')


@app.route("/")
def index():
    return app.send_static_file('html/index.html')


if __name__ == "__main__":
    app.run()

import os

import flask


app = flask.Flask(__name__, static_url_path='/static')
app.secret_key = os.environ['SECRET_STRING']




import functools
def require_login(func):
    @functools.wraps(func)
    def decorated(*args, **kwargs):
        if not flask.session.get('user_email', None):
            return flask.redirect(
                '/login/',
                code=302
            )
        return func(*args, **kwargs)

    return decorated



@app.route('/')
def index():
    return flask.render_template(
        'index.tpl',
        google_api_key=os.environ['GOOGLE_API_KEY'],
    )


@app.route('/login/', methods=['GET', 'POST'])
def login():
    if flask.request.method == 'POST':
        flask.session['user_email'] = flask.request.form['email']
        return flask.redirect(
            '/user_home/',
            code=302
        )
    return flask.render_template(
        'login.tpl',
    )


@app.route('/logout/')
def logout():
    flask.session.pop('user_email', None)
    return flask.redirect(
        '/',
        code=302
    )


@app.route('/user_home/')
@require_login
def user_home():
    app.logger.debug(flask.session['user'])
    return flask.render_template(
        'user_home.tpl',
        user_email=flask.session['user_email'],
    )


@app.route('/static/<path:path>')
def send_js(path):
    return flask.send_from_directory(path)


if __name__ == '__main__':
    app.run()


<!DOCTYPE html>
<html>
    <head>
        {% block head %}
            <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
            <meta charset="utf-8">
            <title>Geoodle</title>
            <link rel="icon" href="/static/favicon/ic_edit_location_black_24dp_2x.png" />
            {% block style %}
            {% endblock %}
        {% endblock %}
    </head>
    <body>
        {% block content %}
            Put some content here!
        {% endblock %}

        {% block scripts %}
        {% endblock %}
    </body>
</html>

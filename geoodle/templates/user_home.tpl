{% extends 'base.tpl' %}

{% block content %}
    Wahoo, you're logged in!
    <br/>
    {{ user_email }}
    <br/>
    <a href="/logout/">Logout</a>
{% endblock %}

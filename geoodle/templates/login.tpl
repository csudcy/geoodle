{% extends 'base.tpl' %}

{% block style %}
    <style>
         #login_links {
            margin-top: 20%;
            text-align: center;
            line-height: 150%;
         }
    </style>
{% endblock %}

{% block content %}
    <div id="login_links">
        <form action="." method="POST">
            Email: <input type="email" name="email"/>
            <br/>
            <button type="submit">Login</button>
        </form>
    </div>
{% endblock %}

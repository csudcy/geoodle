{% extends 'base.tpl' %}

{% block style %}
    <style>
         #map {
            position: absolute;
            top: 0px;
            bottom: 0px;
            left: 0px;
            right: 0px;
         }
         #title {
            position: absolute;
            top: 0px;
            left: 0px;
            right: 0px;
            text-align: center;
            font-size: 2.5em;
            font-weight: bold;
            color: #fff;
            text-shadow: 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000;
         }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.min.css" />
    <!--[if lt IE 9]>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.ie.min.css" />
    <![endif]-->
{% endblock %}

{% block content %}
    <div id="map"></div>
    <div id="title">
        Welcome to Geoodle!
    </div>
    <a
        class="github-fork-ribbon"
        href="https://github.com/csudcy/geoodle"
        title="Fork me on GitHub"
        target="_blank"
        style="zoom: 0.75;">
        Fork me on GitHub
    </a>
{% endblock %}

{% block scripts%}
    <script src="/static/js/jquery-3.2.0.js"></script>
    <script src="/static/js/jquery.noty.packaged.js"></script>
    <script src="/static/js/emitter.js"></script>
    <script src="/static/js/chance.js"></script>

    <script src="/static/js/data_geoodle_list.js"></script>
    <script src="/static/js/data_geoodle.js"></script>
    <script src="/static/js/data_participant.js"></script>
    <script src="/static/js/data_marker.js"></script>
    <script src="/static/js/control_geoodle.js"></script>

    <script src="/static/js/control_login.js"></script>
    <script src="/static/js/index.js"></script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key={{google_api_key}}&callback=initMap"></script>
{% endblock %}

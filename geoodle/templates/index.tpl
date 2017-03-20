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
    </style>
{% endblock %}

{% block content %}
    <div id="map"></div>
    <a href="https://github.com/csudcy/geoodle"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"></a>
{% endblock %}

{% block scripts%}
    <script src="/static/js/jquery-3.2.0.js"></script>
    <script src="/static/js/jquery.noty.packaged.js"></script>
    <script src="/static/js/emitter.js"></script>
    <script src="/static/js/control_geoodle.js"></script>
    <script src="/static/js/control_geoodle_participants.js"></script>
    <script src="/static/js/control_login.js"></script>
    <script src="/static/js/index.js"></script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key={{google_api_key}}&callback=initMap"></script>
{% endblock %}

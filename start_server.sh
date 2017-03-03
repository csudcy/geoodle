#/bin/bash

cd /var/app

# Install our requirements
pip install -r requirements.txt

# Install our requirements and ourselves in editable mode
# pip install -e .

# Start flask
export FLASK_APP=./geoodle/app.py
export FLASK_DEBUG=1

flask run --host=0.0.0.0

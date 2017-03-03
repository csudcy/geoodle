# coding: utf-8

import sys
from setuptools import setup, find_packages

NAME = "geoodle"
VERSION = "0.0.1"

with open('./requirements.txt', 'r') as f:
    REQUIRES = f.readlines()

with open('./README.md', 'r') as f:
    README = f.read()

setup(
    name=NAME,
    version=VERSION,
    description="Run polls to find out where to meet people",
    author_email="",
    url="",
    keywords=["Geoodle"],
    install_requires=REQUIRES,
    packages=find_packages(),
    include_package_data=True,
    long_description=README
)

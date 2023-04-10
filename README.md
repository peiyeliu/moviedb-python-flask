# moviedb-python-flask
Python and Flask based interactive webpages display information from movie database

Features:
1. User interface web pages were implemented in plain HTML, CSS and JavaScript
2. Python and Flask framework was used to fetch data from Movie Databse API and return JSON format data to front-end page
3. JavaScript was used to handle users' HTTP requests
4. Dockerfile included

To run the program:
1. Download the project folder and install required dependencies defined in `requirements.txt`
2. This project needs to call API from TMDB. To run this program, you need to apply an API key here (https://www.themoviedb.org/documentation/api)
3. When you have your API key, go to the top of `app.py` file and modify the variable `api-key` (see line #8)
4. Type the command `python3 -m flask run --host=0.0.0.0` to run the program


from flask import Flask, request, jsonify
import requests

app = Flask(__name__, static_url_path='')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

api_key = "YOUR_TMDB_API_KEY"
head = "https://www.themoviedb.org/t/p"
movie_genre_list = {}
tv_genre_list = {}
genre_stored = False


def get_movie_tv_genre():
    movie_genre_req = requests.get(
        "https://api.themoviedb.org/3/genre/movie/list?api_key=YOUR_TMDB_API_KEY&language=en-US").json()
    tv_genre_req = requests.get(
        "https://api.themoviedb.org/3/genre/tv/list?api_key=YOUR_TMDB_API_KEY&language=en-US").json()
    for i in range(len(movie_genre_req["genres"])):
        movie_genre_list[movie_genre_req["genres"][i]["id"]] = movie_genre_req["genres"][i]["name"]
    for i in range(len(tv_genre_req["genres"])):
        tv_genre_list[tv_genre_req["genres"][i]["id"]] = tv_genre_req["genres"][i]["name"]


@app.route('/')
def get_start():
    get_movie_tv_genre()
    return app.send_static_file('home.html')


@app.route('/index', methods=["GET"])
def home_page():
    full_url_mov = "https://api.themoviedb.org/3/trending/movie/week?api_key=" + api_key
    movie_trend_request = requests.get(full_url_mov).json()
    full_url_tv = "https://api.themoviedb.org/3/tv/airing_today?api_key=" + api_key
    tv_trend_request = requests.get(full_url_tv).json()
    movie_tv_list = {}
    for i in range(5):
        if i >= len(movie_trend_request['results']):
            break
        if i >= len(tv_trend_request['results']):
            break
        movie_tv_list[("mov" + str(i + 1))] = {
            "path": head + "/w780" + str(movie_trend_request['results'][i]["backdrop_path"]),
            "titleAndDate": movie_trend_request['results'][i]["title"] + "(" +
                            movie_trend_request['results'][i]["release_date"][
                            0:4] + ")"}

        movie_tv_list[("tv" + str(i + 1))] = {
            "path": head + "/w780" + str(tv_trend_request['results'][i]["backdrop_path"]),
            "titleAndDate": tv_trend_request['results'][i]["name"] + "(" +
                            tv_trend_request['results'][i]["first_air_date"][
                            0:4] + ")"}
    json_data = jsonify(movie_tv_list)
    return json_data


@app.route('/getresult', methods=["GET"])
def getsearchresult():
    key_word = request.args.get('keyword')
    option = str(request.args.get('opt'))
    if option == "movie":
        result = requests.get(
            "https://api.themoviedb.org/3/search/movie?api_key=" + api_key + "&query=" + str(
                key_word) + "&language=en-US&page=1&include_adult=false").json()
    elif option == "tv":
        result = requests.get(
            "https://api.themoviedb.org/3/search/tv?api_key=" + api_key + "&language=en-US&page=1&query=" + str(
                key_word) + "&include_adult=false").json()
    elif option == "movietv":
        result = requests.get(
            "https://api.themoviedb.org/3/search/multi?api_key=" + api_key + "&language=en-US&query=" + str(
                key_word) + "&include_adult=false").json()
    else:
        return "error"

    numOfEntry = result["total_results"]
    if numOfEntry > 10:
        numOfEntry = 10

    searchResult = {"number_of_entry": numOfEntry}

    for i in range(numOfEntry):
        if "first_air_date" in result["results"][i]:
            searchResult[str(i)] = {
                "id": result["results"][i]["id"],
                "type": "tv",
                "title": result["results"][i]["name"],
                "overview": result["results"][i]["overview"],
                "poster_path": head + "/w185" + str(result["results"][i]["poster_path"]),
                "vote_average": rating(result["results"][i]["vote_average"]),
                "vote_count": result["results"][i]["vote_count"],
                "date_genres": getYear(result["results"][i]["first_air_date"])+" | "+getGenre(result["results"][i]["genre_ids"], "tv")
            }
        elif "release_date" in result["results"][i]:
            searchResult[str(i)] = {
                "id": result["results"][i]["id"],
                "type": "movie",
                "title": result["results"][i]["title"],
                "overview": result["results"][i]["overview"],
                "poster_path": head + "/w185" + str(result["results"][i]["poster_path"]),
                "vote_average": rating(result["results"][i]["vote_average"]),
                "vote_count": result["results"][i]["vote_count"],
                "date_genres": getYear(result["results"][i]["release_date"]) +" | "+getGenre(result["results"][i]["genre_ids"], "movie")
            }
    jsonresult = jsonify(searchResult)
    return jsonresult


def getYear(year):
    if year is None:
        return "N/A"
    if year == "":
        return "N/A"
    return year[0:4]

def getGenre(genre_list, type):
    genre_str = ""
    genre_len = len(genre_list)
    if genre_len == 0:
        return "N/A"
    if type == "movie":
        l = movie_genre_list
    else:
        l = tv_genre_list
    for i in range(genre_len):
        index = genre_list[i]
        if index in l:
            genre_str += l[index]
        if i < genre_len - 1:
            genre_str += ", "
    return genre_str


def rating(r):
    if r is None:
        return "No rating"
    r /= 2
    r = round(r * 100)
    return str(r // 100) + "." + str(r % 100) + "/5"


def dateformatter(d):
    if d is None:
        return "Unknown Year"
    return d[5:7] + "/" + d[8:10] + "/" + d[0:4]


@app.route('/detail', methods=["GET"])
def getDetail():
    typeId = request.args.get('typeid')
    if typeId.startswith("movie"):
        type = "movie"
        id = typeId[5:]
    else:
        type = "tv"
        id = typeId[2:]
    query = requests.get(
        "https://api.themoviedb.org/3/" + type + "/" + id + "?api_key=" + api_key + "&language=enUS").json()
    languageStr = "Spoken languages: "
    for i in range(len(query["spoken_languages"])):
        languageStr += query["spoken_languages"][i]["english_name"]
        if i < len(query["spoken_languages"]) - 1:
            languageStr += ", "
    if len(query["spoken_languages"]) == 0:
        languageStr = "Spoken languages: N/A"

    if type == "tv":
        detail = {
            "id": query["id"],
            "title": query["name"],
            "type": "tv",
            "backdrop_path": head + "/w780" + str(query["backdrop_path"]),
            "date_genres": detailYearGenre(query["first_air_date"], query["genres"]),
            "spoken_languages": languageStr,
            "overview": query["overview"],
            "vote_average": rating(query["vote_average"]),
            "vote_count": query["vote_count"],
            "cast": {},
            "review": {},
        }

    else:
        detail = {
            "id": query["id"],
            "title": query["title"],
            "type": "movie",
            "backdrop_path": head + "/w780" + str(query["backdrop_path"]),
            "date_genres": detailYearGenre(query["release_date"], query["genres"]),
            "spoken_languages": languageStr,
            "overview": query["overview"],
            "vote_average": rating(query["vote_average"]),
            "vote_count": query["vote_count"],
            "cast": {},
            "review": {},
        }

    if str(query["backdrop_path"]) == "None":
        detail["backdrop_path"] = "None"

    castquery = requests.get(
        "https://api.themoviedb.org/3/" + type + "/" + id + "/credits?api_key=" + api_key + "&language=enUS").json()
    castnumber = 8
    if len(castquery["cast"]) < 8:
        castnumber = len(castquery["cast"])
    detail["cast"]["number_of_cast"] = castnumber
    for i in range(castnumber):
        detail["cast"][str(i + 1)] = {
            "name": castquery["cast"][i]["name"],
            "profile_path": head + "/w185" + str(castquery["cast"][i]["profile_path"]),
            "character": castquery["cast"][i]["character"]
        }
    reviewquery = requests.get(
        "https://api.themoviedb.org/3/" + type + "/" + id + "/reviews?api_key=" + api_key + "&language=enUS&page=1").json()
    reviewnumber = 5
    if len(reviewquery["results"]) < 5:
        reviewnumber = len(reviewquery["results"])
    detail["review"]["number_of_review"] = reviewnumber
    for i in range(reviewnumber):
        detail["review"][str(i + 1)] = {
            "username": reviewquery["results"][i]["author_details"]["username"],
            "content": reviewquery["results"][i]["content"],
            "rating": rating(reviewquery["results"][i]["author_details"]["rating"]),
            "created_at": dateformatter(reviewquery["results"][i]["created_at"][0:10])
        }
    return jsonify(detail)


def detailYearGenre(year, genrelist):
    if year is None or year == "":
        yearStr = "N/A"
    else:
        yearStr = year[0:4]
    if len(genrelist) == 0:
        genreStr = "N/A"
    else:
        genreStr = ""
        for i in range(len(genrelist)):
            genreStr += genrelist[i]["name"]
            if i < len(genrelist) - 1:
                genreStr += ", "
    return yearStr + " | " + genreStr


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

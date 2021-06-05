//moviesearcher7d8s5f0p.azurewebsites.net

function index(){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/index', true);//method url
    xhr.send();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(xhr.responseText);
            for (var i = 1; i <= 5; i++) {
                document.getElementById("movp"+i).src = response['mov'+i].path;
                document.getElementById("movt"+i).innerHTML = response['mov'+i].titleAndDate;
                document.getElementById("tvp"+i).src = response['tv'+i].path;
                document.getElementById("tvt" + i).innerHTML = response['tv'+i].titleAndDate;
            }
        }
    };
    
    var currIdx = 1;
    setInterval(function () {
        var next = currIdx + 1;
        if (next === 6) {
            next = 1;
        }
        document.getElementById("mov" + currIdx).className = "movie";
        document.getElementById("tv" + currIdx).className = "movie";

        document.getElementById("mov" + next).className = "movie fade";
        document.getElementById("tv" + next).className = "movie fade";
        currIdx = next;
    }, 4000);
}
window.onload = index;
form = document.getElementById("form");

function getdata(){
    var keyword = document.getElementById("kwd").value;
    var opt= document.getElementById("opt").value;
    if(opt==='blank' || keyword.trim() === ''){
        alert("Please enter valid values.");
        return;
    }
    hidediv();
    showSearchResult(keyword, opt);
};

function showSearchResult(keyword, opt){
    const xhr = new XMLHttpRequest();
    let url = "/getresult?keyword="+keyword+"&opt="+opt;
    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(xhr.responseText);
            var num = response["number_of_entry"];
            if(num === 0){
                document.getElementById("searchStatus").innerHTML = "No results found.";
                document.getElementById("searchStatus").style.display = "block";
                document.getElementById("searchStatus").style.textAlign = "center";
            }
            else {
                document.getElementById("searchStatus").innerHTML = "Showing results..";
                document.getElementById("searchStatus").style.display = "block";
                document.getElementById("searchStatus").style.textAlign = "";
                document.getElementById("searchResult").innerHTML="";
                unhidediv();
                renderpage(response);
            }
        }
    };
    xhr.send();
}



function renderpage(response){
    var num = response["number_of_entry"];
    let root = document.getElementById("searchResult");
    root.style.display= "block";
    for(var i = 0; i < num; i++){
        var currJSONFile = response[i+""];
        var entry = addEntry(currJSONFile);
        root.appendChild(entry);
    }
}

function addEntry(currJSONFile){
    var entry = document.createElement('div');
    entry.classList.add('entry');
    var imgnode = getImgNode(currJSONFile);
    var description = getDescription(currJSONFile);
    var jump = getJump(currJSONFile);
    entry.appendChild(imgnode);
    entry.appendChild(description);
    entry.appendChild(jump);
    entry.style.display = "block";
    return entry;
}

function getImgNode(currJSONFile){
    var d = document.createElement('div');
    d.classList.add('picture');
    var img = document.createElement('img');
    img.style.width = "200px";
    img.style.height = "300px";
    if(currJSONFile["poster_path"] === 'https://www.themoviedb.org/t/p/w185None') {
        img.src = "img/poster-placeholder.png";
    }
    else{
        img.src = currJSONFile["poster_path"];
    }
    d.appendChild(img);
    return d;
}

function getDescription(currJSONFile){
    var d = document.createElement('div');
    d.classList.add('description');
    d.style.color = "white";

    var title = document.createElement('div');
    title.style.fontSize = "24px";
    title.innerHTML = "<b>" + currJSONFile["title"] + "</b>";

    var yeargenre = document.createElement('div');
    yeargenre.style.fontSize = "12px";
    yeargenre.style.marginTop = "15px";
    yeargenre.innerHTML = "<span>"+ currJSONFile["date_genres"] +"<br></span><span style=\"color: #AC261C\">&#9733;" + currJSONFile["vote_average"] + "&nbsp;"+"</span><span>"+currJSONFile["vote_count"] + "&nbsp;"+ "votes"+"</span>";

    var overview = document.createElement('div');
    overview.style.fontSize = "12px";
    overview.style.marginTop = "15px";
    overview.innerHTML=currJSONFile["overview"];

    d.appendChild(title);
    d.appendChild(yeargenre);
    d.appendChild(overview);

    var button = getButton(currJSONFile["id"], currJSONFile["type"]);
    d.appendChild(button);
    return d;
}

function getButton(entryID, type){
    var d = document.createElement('div');
    d.innerHTML="<button class=\"showMore\" type=\"button\" onclick=\"showMore(this)\">show more</button>";
    d.id = type+entryID;
    return d;
}

function getJump(){
    var jump = document.createElement('div');
    jump.classList.add('jump');
    jump.style.display = "none";
    /**
    var container = document.createElement('div');
    container.classList.add('container');
    var img = getDetailImg(currJSONFile);
    var detail = getDetail(currJSONFile);
    var cast = getCast(currJSONFile);
    var review = getReview(currJSONFile);
    container.appendChild(img);
    container.appendChild(detail);
    container.appendChild(cast);
    container.appendChild(review);
    container.innerHTML += "<div class=\"close\" onclick=\"closeDetail(this)\"><b>&times;</b></div>";
    jump.appendChild(container);
     */
    return jump;
}

function getJumpDetail(jump, id) {
    var container = document.createElement('div');
    container.classList.add('container');
    var xhr = new XMLHttpRequest();
    let url = "/detail?typeid=" + id;
    xhr.open('GET', url, true);//method url
    xhr.send();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(xhr.responseText);
            var img = getDetailImg(response);
            var detail = getDetail(response);
            var cast = getCast(response);
            var review = getReview(response);
            container.appendChild(img);
            container.appendChild(detail);
            container.appendChild(cast);
            container.appendChild(review);
            container.innerHTML += "<div class=\"close\" onclick=\"closeDetail(this)\"><b>&times;</b></div>";
            jump.appendChild(container);
        }
    };
}


function getDetailImg(currJSONFile){
    var d = document.createElement('div');
    var img = document.createElement('img');
    img.classList.add("backdrop");

    if(currJSONFile["backdrop_path"] === 'None'){
        img.src = "img/movie-placeholder.jpg";
    }
    else{
        img.src = currJSONFile["backdrop_path"];
    }
    d.appendChild(img);
    return d;
}


function getDetail(currJSONFile){
    var d = document.createElement('div');
    d.style.marginLeft = "20px";
    var title = document.createElement('p');
    title.style.fontSize = "20px";
    title.innerHTML = currJSONFile["title"];

    var infoButton = document.createElement('span');
    infoButton.classList.add("infoButton");
    var link = "https://www.themoviedb.org/" + currJSONFile["type"]  + "/" + currJSONFile["id"];
    infoButton.innerHTML = "<span onclick=\"window.open(\'"+ link +"\')\">&#9432<br></span>"

    title.appendChild(infoButton);

    var yeargenre = document.createElement('p');
    yeargenre.style.fontSize = "14px";
    yeargenre.innerHTML = currJSONFile["date_genres"];

    var rate = document.createElement('p');
    rate.style.fontSize = "12px";
    rate.innerHTML = "<span style=\"color: #AC261C\">&#9733;" + currJSONFile["vote_average"] + "&nbsp;"+"</span><span>"+currJSONFile["vote_count"] + "&nbsp;"+ "votes"+"</span>";

    var overview = document.createElement('p');
    overview.style.fontSize = "16px";
    overview.innerHTML = currJSONFile["overview"];

    var language = document.createElement('p');
    language.style.fontSize = "12px";
    language.style.fontStyle = "italic";
    language.style.fontWeight = "bold";
    language.innerHTML = currJSONFile["spoken_languages"];

    d.appendChild(title);
    d.appendChild(yeargenre);
    d.appendChild(rate);
    d.appendChild(overview);
    d.appendChild(language);
    return d;
}

function getCast(currJSONFile){
    var castNum = currJSONFile["cast"]["number_of_cast"];
    var d = document.createElement('div');
    var h3 = document.createElement('h3');
    h3.innerHTML = "Cast";
    d.style.marginLeft = "20px";
    d.appendChild(h3);
    if(castNum === 0){
        h3.innerHTML = "Cast: N/A";
        return d;
    }
    var table = document.createElement('table');
    var tr1 = document.createElement('tr');
    var tr2 = document.createElement('tr');
    d.appendChild(table);
    table.appendChild(tr1);
    table.appendChild(tr2);

    for(var i = 1; i <= castNum; i++){
        if(i <= 4){
            tr1.appendChild(getCastInfo(currJSONFile["cast"][""+i]));
        }
        else{
            tr2.appendChild(getCastInfo(currJSONFile["cast"][""+i]));
        }
    }
    return d;
}

function getCastInfo(castJSON){
    var td = document.createElement('td');
    var d = document.createElement('div');
    td.appendChild(d);
    d.classList.add('castInfo')
    var castimg = document.createElement('img');
    castimg.classList.add('castImg');

    if(castJSON["profile_path"] === 'https://www.themoviedb.org/t/p/w185None'){
        castimg.src = "img/person-placeholder.png";
    }
    else{
        castimg.src = castJSON["profile_path"];
    }

    var p = document.createElement('p');
    p.innerHTML = "<span><b>"+castJSON["name"]+"</b><br></span><span>AS<br></span><span>"+castJSON["character"]+"</span>";

    d.appendChild(castimg);
    d.appendChild(p);
    return td;
}


function getReview(currJSONFile){
    var reviewNum = currJSONFile["review"]["number_of_review"];
    var d = document.createElement('div');
    d.style.marginLeft = "20px";
    var h3 = document.createElement('h3');
    if(reviewNum === 0){
        h3.innerHTML = "Reviews: N/A";
        d.appendChild(h3);
        return d;
    }
    h3.innerHTML = "Reviews";
    d.appendChild(h3);
    for (var i = 1; i <= reviewNum; i++){
        var reviewentry = currJSONFile["review"]["" + i];
        var elem = getReviewInfo(reviewentry);
        d.appendChild(elem);
    }
    return d;
}

function getReviewInfo(reviewentry){
    var d = document.createElement('div');
    if (reviewentry["rating"] === "No rating") {
        d.innerHTML="<p><b>"+reviewentry["username"] + "&nbsp;"+"</b><span>on"+"&nbsp;"+ reviewentry["created_at"] +"</span></p><p><span class=\"reviewContent\">"+reviewentry["content"]+"</span></p><HR align=\"center\">";
    } else {
        var rate = "&#9733;" + reviewentry["rating"];
        d.innerHTML="<p><b>"+reviewentry["username"] + "&nbsp;"+"</b><span>on"+"&nbsp;"+ reviewentry["created_at"] +"</span></p><p><span style=\"color: #ac261c; font-size: 12px\">"+ rate +"<br></span><span class=\"reviewContent\">"+reviewentry["content"]+"</span></p><HR align=\"center\">";
    }
    return d;
}

function unhidediv(){
    document.getElementById("searchStatus").style.display="block";
    document.getElementById("searchResult").style.display="block";
}

function hidediv(){
    document.getElementById("searchResult").innerHTML="";
    document.getElementById("searchStatus").style.display="none";
    document.getElementById("searchResult").style.display="none";
}

function goToHomePage(){
    document.getElementById("homeTab").style.color="#AC261C";
    document.getElementById("searchTab").style.color="white";
    document.getElementById("home").style.display = "block";
    document.getElementById("search").style.display = "none";
}

function goToSearchPage(){
    document.getElementById("homeTab").style.color="white";
    document.getElementById("searchTab").style.color="#AC261C";
    document.getElementById("home").style.display = "none";
    document.getElementById("search").style.display = "block";
}


function showMore(curr){
    var id = curr.parentNode.id;
    var next = curr.parentNode.parentNode.nextSibling;
    getJumpDetail(next, id);
    next.style.display = "block";
    document.getElementById("bottombar").style.position ="";
}


function closeDetail(curr){
    var x = curr.parentNode.parentNode;
    x.style.display = "none";
    document.getElementById("bottombar").style.position="absolute";
}

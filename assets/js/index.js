let retryRequest = false;
const updatePageContent = response => {
    retryRequest = false;
    const data = JSON.parse(response);
    const results = data.results;
    let fragment = new DocumentFragment();
    for (let i = 0; i < Math.min(40, results.length); i++) {
        const element = document.createElement('div');
        const url = results[i].url;
        const title = results[i].title;
        const abstract = results[i].abstract;
        let image = null;
        const multimedia = results[i].multimedia;
        let maxIndex = 0;
        for (let i = 1; i < multimedia.length; i++) {
            if (multimedia[i].width * multimedia[i].height > multimedia[maxIndex].width * multimedia[maxIndex].height)
                maxIndex = i;
        }
        if (multimedia.length > 0) {
            image = multimedia[maxIndex].url;
        }
        element.innerHTML = `
            <div class="card my-2">
                <img class="card-img-top" src="${image}" alt = "Article thumbnail" >
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${abstract}</p>
                <a href="${url}" class="d-block text-center h2"><i class="fas fa-arrow-circle-right text-secondary"></i></a>
            </div>
            </div > `
        element.setAttribute('class', 'col-12 col-md-6 col-lg-4');
        fragment.appendChild(element);
    }
    const parent = document.getElementById("content");
    parent.innerHTML = "";
    parent.appendChild(fragment);
}

const clickTarget = (el, event) => {
    if (event.fireEvent) event.fireEvent("on" + event);
    else {
        var eventObj = document.createEvent("Events");
        eventObj.initEvent(event, true, false);
        el.dispatchEvent(eventObj);
    }
}

const errorAlert = (target) => {
    const alert = document.getElementById("error");
    if (!retryRequest) {
        setTimeout(function () {
            clickTarget(target, 'click');
        }, 1000);
        retryRequest = true;
    } else {
        alert.innerHTML = ` Please make sure you are connected to the internet
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true" id="close">&times;</span>
                    </button>`;
        retryRequest = false;
        if (timeout != null)
            clearTimeout(timeout);
    }
    alert.removeAttribute('hidden');
    let timeout = setTimeout(function () {
        clickTarget(document.getElementById("close"), 'click');
    }, 4000);
}

const updateSearchText = resp => {
    retryRequest = false;
    const data = JSON.parse(resp);
    const docs = data.response.docs;
    let fragment = new DocumentFragment();
    for (let i = 0; i < Math.min(40, docs.length); i++) {
        const element = document.createElement('div');
        const url = docs[i].web_url;
        const title = docs[i].abstract;
        const abstract = docs[i].lead_paragraph;
        let image = null;
        const multimedia = docs[i].multimedia;
        let maxIndex = 0;
        for (let i = 1; i < multimedia.length; i++) {
            if (multimedia[i].width * multimedia[i].height > multimedia[maxIndex].width * multimedia[maxIndex].height)
                maxIndex = i;
        }
        if (multimedia.length > 0) {
            image = "https://www.nytimes.com/" + multimedia[maxIndex].url;
        }
        element.innerHTML = `
            <div class="card my-2">
                <img class="card-img-top" src="${image}" alt = "Article thumbnail" >
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${abstract}</p>
                <a href="${url}" class="d-block text-center h2"><i class="fas fa-arrow-circle-right text-secondary"></i></a>
            </div>
            </div > `
        element.setAttribute('class', 'col-12 col-md-6 col-lg-4');
        fragment.appendChild(element);
    }
    const parent = document.getElementById("content");
    parent.innerHTML = "";
    parent.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", function () {
    retryRequest = false;
    const API_KEY = "<your-api-key>";
    const homeRequest = new XMLHttpRequest();
    homeRequest.open("GET", `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${API_KEY}`);
    homeRequest.send();
    homeRequest.onload = function () {
        updatePageContent(this.responseText);
    }
    homeRequest.onerror = function () {
        errorAlert(document.querySelector(".sidebar-brand"));
    };


    document.getElementById("category-listener").addEventListener('click', function (e) {
        e.preventDefault();
        const target = e.target;
        document.querySelector(".sidebar-brand").removeAttribute('class');
        target.parentNode.setAttribute('class', 'sidebar-brand');
        const categoryRequest = new XMLHttpRequest();
        const category = target.textContent.replace(/\s/g, "").toLowerCase();
        categoryRequest.open("GET", `https://api.nytimes.com/svc/topstories/v2/${category}.json?api-key=${API_KEY}`);
        categoryRequest.send();
        categoryRequest.onload = function () {
            updatePageContent(this.responseText);
        }
        categoryRequest.onerror = function () {
            errorAlert(target);
        }
    })

    const searchbar = document.getElementById("searchbar");
    const makeSearchRequest = () => {
        const text = searchbar.value;
        const searchRequest = new XMLHttpRequest();
        searchRequest.open("GET", `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${text}&api-key=${API_KEY}`);
        searchRequest.send();
        searchRequest.onerror = function () {
            errorAlert(searchbar);
        }
        searchRequest.onload = function () {
            updateSearchText(this.responseText);
        }
    }

    searchbar.addEventListener("change", function () {
        makeSearchRequest();
    });
    searchbar.addEventListener("keypress", function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            makeSearchRequest();
            return false;
        }
    })
})
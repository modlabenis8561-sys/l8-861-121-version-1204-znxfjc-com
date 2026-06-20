import { searchMovies } from "./search-index.js";

var input = document.querySelector("[data-global-search]");
var results = document.querySelector("[data-search-results]");
var empty = document.querySelector("[data-search-empty]");

function normalize(value) {
    return String(value || "").toLowerCase().trim();
}

function render(items) {
    if (!results) {
        return;
    }
    results.innerHTML = items.map(function (movie) {
        return [
            "<a class=\"search-result-card\" href=\"" + movie.url + "\">",
            "<img src=\"" + movie.image + "\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "在线观看\" loading=\"lazy\">",
            "<span>",
            "<h3>" + movie.title + "</h3>",
            "<p>" + movie.year + " · " + movie.region + " · " + movie.type + "</p>",
            "<p>" + movie.oneLine + "</p>",
            "</span>",
            "</a>"
        ].join("");
    }).join("");
    if (empty) {
        empty.style.display = items.length ? "none" : "block";
    }
}

function search() {
    var keyword = normalize(input && input.value);
    var items = searchMovies.filter(function (movie) {
        if (!keyword) {
            return true;
        }
        return normalize([
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.tags,
            movie.oneLine
        ].join(" ")).indexOf(keyword) !== -1;
    }).slice(0, 80);
    render(items);
}

if (input) {
    input.addEventListener("input", search);
    search();
}

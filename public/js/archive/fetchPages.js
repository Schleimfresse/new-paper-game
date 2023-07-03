const main = document.getElementById("main-content");
const currentPage_nav = document.getElementById("currentPage");
const gotopageinput = document.getElementById("gotopage");
let currentPage = parseInt(new URLSearchParams(window.location.search).get("page"));
let resultsPerPage = 10;
let data;

const gotoPage = () => {
	let input = gotopageinput.value;
	if ((typeof input != "number" && input == 0) || input > data.total) return;
	currentPage = input;
	gotopageinput.value = "";
	changeURL(currentPage);
	fetchPages();
};

gotopageinput.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		gotoPage();
	}
});

document.getElementById("gotopagesubmit").addEventListener("click", function () {
	gotoPage();
});

document.getElementById("prev-page-btn").addEventListener("click", function () {
	if (currentPage > 1) {
		currentPage--;
		changeURL(currentPage);
		fetchPages();
	} else {
		this.disabled = true;
	}
});

document.getElementById("next-page-btn").addEventListener("click", function () {
	if (currentPage == data.total) {
		this.disabled = true;
		return;
	}
	currentPage++;
	changeURL(currentPage);
	fetchPages();
});

document.getElementById("last-page-btn").addEventListener("click", function () {
	currentPage = data.total;
	this.disabled = true;
	changeURL(currentPage);
	fetchPages();
});

document.getElementById("first-page-btn").addEventListener("click", function () {
	currentPage = 1;
	this.disabled = true;
	changeURL(currentPage);
	fetchPages();
});

const filter = document.getElementById("filter");
const search = document.getElementById("search");
const expandedSidebar = document.getElementById("expandedSidebar");

document.getElementById("openFilter").addEventListener("click", () => {
	if (search.getAttribute("data-open") == "true") {
		search.style.display = "none";
		search.removeAttribute("data-open");
	}
	if (filter.getAttribute("data-open") == "true") {
		expandedSidebar.style.display = "none";
		filter.removeAttribute("data-open");
		return;
	}
	expandedSidebar.style.display = "flex";
	filter.style.display = "block";
	filter.setAttribute("data-open", true);
});

document.getElementById("openSearch").addEventListener("click", () => {
	if (filter.getAttribute("data-open") == "true") {
		filter.style.display = "none";
		filter.removeAttribute("data-open");
	}
	if (search.getAttribute("data-open") == "true") {
		expandedSidebar.style.display = "none";
		search.removeAttribute("data-open");
		return;
	}
	expandedSidebar.style.display = "flex";
	search.style.display = "block";
	search.setAttribute("data-open", true);
});

const fetchPages = async () => {
	const url = "/api?page=" + currentPage;
	const response = await fetch(url);
	data = await response.json();
	displayPages(data.results);
	document.getElementById("prev-page-btn").disabled = currentPage === 1;
	document.getElementById("first-page-btn").disabled = currentPage === 1;
	document.getElementById("last-page-btn").disabled = currentPage === data.total;
	document.getElementById("next-page-btn").disabled = currentPage === data.total;
};

const displayPages = (data) => {
	main.innerHTML = "";
	for (item of data) {
		const temp = document.getElementsByTagName("template")[0];
		let e = temp.content.cloneNode(true).children[0];
		e.href = `/archive/${item._id}`;
		//e.addEventListener("mousemove", )
		//e.addEventListener("mouseleave", )
		e.children[0].className = "page_item";
		e.children[1].textContent = item.title;
		e.children[1].title = item.title;
		// tags
		document.getElementById("prev-page-btn").disabled = currentPage === 1;
		main.append(e);
	}
};

const changeURL = (page) => {
	currentPage_nav.textContent = page;
	const url = new URL(window.location.href);
	url.searchParams.set("page", page);
	const updatedUrl = url.href;
	window.history.pushState({ path: updatedUrl }, "", updatedUrl);
};

if (currentPage == null || isNaN(currentPage)) {
	currentPage = 1;
}

fetchPages().then(() => {
	document.getElementById("totalPages").textContent = data.total;
	if (currentPage > data.total) {
		currentPage = data.total;
	}
	changeURL(currentPage);
});

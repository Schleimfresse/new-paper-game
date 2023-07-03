const newElement = document.getElementById("addnewsection");
const elementSection = document.getElementById("element-section");
const form = document.getElementById("thread_form");
const response_box = document.getElementById("responsebox");
const upload_btn = document.getElementById("uploadCSV");
const FileInput = document.getElementById("uploadinput");
const save_content = document.getElementById("savecontent");
const SaveInput = document.getElementById("saveinput");
const deleteElement = document.getElementById("deleteelement");
const title = document.getElementById("title");
const doownloadTXT = document.getElementById("downloadTXT");
const doownloadCSV = document.getElementById("downloadCSV");
let tags;
save_content.addEventListener("click", () => {
	SaveInput.click();
});

upload_btn.addEventListener("click", () => {
	FileInput.click();
});

FileInput.addEventListener("change", (event) => {
	const file = event.target.files[0];
	const reader = new FileReader();
	reader.onload = (e) => {
		const csvData = e.target.result;
		const data = parseCSV(csvData);
		console.log(data);
		for (e of data) {
			cloneTemplate(e);
		}
	};
	reader.readAsText(file);
});

const parseCSV = (csvData) => {
	const rows = csvData.split("\n");
	let data = [];

	for (let i = 1; i < rows.length; i++) {
		const row = rows[i].trim();
		if (row !== "") {
			const columns = row.split(".");
			data = [...data, columns];
		}
	}
	return data;
};
newElement.addEventListener("click", () => {
	cloneTemplate();
});

form.addEventListener("submit", (e) => {
	e.preventDefault();
	const inputs = document.getElementsByClassName("content-input");
	const dom_tags = document.getElementsByClassName("tag");
	let content = [];
	let tags = [];
	for (let i = 0; i < inputs.length; i++) {
		content = [...content, inputs[i].value];
	}

	const body = JSON.stringify({
		title: title.value,
		content: content,
		tags: "",
		author: user,
	});
	fetch("/add", {
		headers: {
			"Content-Type": "application/json",
		},
		body: body,
		method: "POST",
	})
		.then((res) => res.json())
		.then((data) => showResponse(data, true));
});

const showResponse = (data, type) => {
	response_box.setAttribute("data-visibility", true);
	response_box.children[0].textContent = data.title;
	response_box.children[1].textContent = data.desc;
	if (data.status === 200) {
		setTimeout(() => {
			if (type) {
				window.location.href = "/archive";
			} else {
				response_box.removeAttribute("data-visibility");
			}
		}, 2000);
	}
};

const cloneTemplate = (text) => {
	const temp = document.getElementsByTagName("template")[0];
	let inputElement = temp.content.cloneNode(true).children[0];
	/*inputElement.children[1].addEventListener("click", function () {
		const parentElement = this.parentNode;
		parentElement.remove();
	});*/
	if (text !== undefined) {
		inputElement.children[0].value = text[0];
	}
	//inputElement.addEventListener("dragstart", dragStart);
	//inputElement.addEventListener("dragend", dragEnd);
	elementSection.appendChild(inputElement);
};

deleteElement.addEventListener("click", () => {
	const elements = document.querySelectorAll(".selectInputWrapper");
	if (deleteElement.getAttribute("data-active") == "true") {
		deleteElement.children[1].textContent = "Delete element";
		deleteElement.setAttribute("data-active", false);
		for (const element of elements) {
			if (element.children[0].checked) {
				element.parentNode.remove();
			} else {
				element.style.display = "none";
			}
		}
	} else {
		deleteElement.children[1].textContent = "Delete selected";
		deleteElement.setAttribute("data-active", true);
		for (const element of elements) {
			element.style.display = "flex";
		}
	}
});

const createTextFile = () => {
	const text = generateTextContent();
	const text_converted = text.join("\n");
	console.log(text_converted);
	const blob = new Blob([text_converted], { type: "text/plain" });
	downloadFile(blob, "txt");
};

const createCsvFile = () => {
	const text = generateTextContent();
	const text_converted = ["Text,Name", ...text];
	console.log(text_converted);
	csv_text = text_converted.join("\n");
	const blob = new Blob([csv_text], { type: "text/plain" });
	downloadFile(blob, "csv");
};

doownloadTXT.addEventListener("click", createTextFile);
doownloadCSV.addEventListener("click", createCsvFile);

const generateTextContent = () => {
	const contentInput = document.querySelectorAll(".content-input");
	let array = [title.value];
	for (e of contentInput) {
		array = [...array, e.value];
	}
	if ((array = [])) return;
	console.log(array);
	return array;
};

const downloadFile = (blob, ext) => {
	const link = document.createElement("a");
	link.download = `${title.value} - PaperShuffle.${ext}`;
	link.href = URL.createObjectURL(blob);
	link.click();
	URL.revokeObjectURL(link.href);
};

const tags_element = document.getElementById("tags");

document.getElementById("openTags").addEventListener("click", () => {
	if (tags_element.getAttribute("data-open") == "true") {
		expandedSidebar.style.display = "none";
		tags_element.removeAttribute("data-open");
		return;
	}
	expandedSidebar.style.display = "flex";
	tags_element.style.display = "block";
	tags_element.setAttribute("data-open", true);
});

const getTags = async () => {
	const url = "/api/tags";
	const response = await fetch(url);
	tags = await response.json();
	displayTags(tags);
};

const displayTags = (data) => {
	console.log(data);
	for (item of data) {
		const temp = document.getElementsByTagName("template")[1];
		let e = temp.content.cloneNode(true).children[0];
		e.children[0].style.backgroundColor = item.color;
		e.children[1].textContent = item.title;
		document.getElementById("option-ul").append(e);
	}
};

document.getElementById("createnewtag").addEventListener("click", () => {
	const color = document.getElementById("tag_color");
	const name = document.getElementById("tag_name");
	if (name.value == "") return;
	const body = JSON.stringify({ color: color.value, title: name.value });
	color.value = "";
	name.value = "";
	fetch("/api/tags/add", {
		headers: {
			"Content-Type": "application/json",
		},
		body: body,
		method: "POST",
	})
		.then((res) => res.json())
		.then((data) => showResponse(data, false));
});

getTags();

const fileReader = new FileReader();

let questionDiv;
let optionsDiv;
let submitBtn;
let uploadBtn;
let jsonInput;

// ==========================STATE VARIABLES================================

let selectedOption = -1;
let correctOption = -1;

// =========================================================================

window.addEventListener("load", main);

function main() {
    questionDiv = document.getElementById("question");
    optionsDiv = document.getElementById("options");
    submitBtn = document.getElementById("submit-btn");
    uploadBtn = document.getElementById("uploadJson");
    jsonInput = document.getElementById("jsonInput");

    submitBtn.addEventListener("click", onQuestionSubmitted);
    uploadBtn.addEventListener("click", onUploadBtnClicked);
    jsonInput.addEventListener("change", onFileSelected);
    fileReader.addEventListener("load", onFileLoaded);

    renderQuestion({
        question: QUESTION,
        options: OPTIONS,
        correct_option: CORRECT_OPTION
    });
}

function onQuestionSubmitted(event) {
    event.preventDefault();
    if (selectedOption === -1) return;

    revealAnswers();
    selectedOption = -1;
}

function onUploadBtnClicked(_event) {
    jsonInput.click();
}

function onFileSelected(event) {
    let file = event.target.files[0];
    if (file.type !== "application/json") alert("Select a JSON File!");
    fileReader.readAsText(file);
}

function onFileLoaded(event) {
    const res = JSON.parse(event.target.result);
    renderQuestion(res);
}

function onOptionClicked(event) {
    let optId = event.target.dataset.option - 1;
    selectedOption = optId;
    optionsDiv.childNodes.forEach(option => option.classList.remove("selected"));

    event.target.classList.add("selected");
}

function renderQuestion(object) {
    questionDiv.textContent = object.question;
    optionsDiv.innerHTML = "";
    object.options.forEach((option, idx) => {
        let btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.dataset.option = idx + 1;
        btn.innerText = option;
        btn.addEventListener("click", onOptionClicked);

        optionsDiv.appendChild(btn);
    });
    correctOption = object.correct_option;
}

function revealAnswers() {
    optionsDiv.childNodes.forEach((option, idx) => {
        if (idx === correctOption) {
            option.classList.add("correct");
            option.classList.remove("selected");
        } else if (idx === selectedOption) {
            option.classList.add("wrong");
            option.classList.remove("selected");
        }
    });
}
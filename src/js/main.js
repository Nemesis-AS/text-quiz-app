class Quiz {
    constructor(questions = [], metadata = {}, title = "Quiz") {
        this.questions = questions;
        this.metadata = metadata;
        this.title = title;

        this.markedAnswers = this.questions.map(_item => null);
        this.cursorPos = -1;
        this.submitted = false;
    }

    static fromObj(obj) {
        if (!obj.questions) return null;
        let questions = obj.questions;
        let metadata = obj.metadata || {};
        let title = obj.title || "Quiz";

        return new Quiz(questions, metadata, title);
    }

    getNext() {
        if (this.cursorPos >= this.questions.length) return null;

        this.cursorPos++;
        return this.questions[this.cursorPos];
    }

    getPrev() {
        if (this.cursorPos <= 0) return null;

        this.cursorPos--;
        return this.questions[this.cursorPos];
    }

    getCurrent() {
        return this.questions[this.cursorPos];
    }

    markAnswer(quesIdx, option) {
        this.markedAnswers[quesIdx] = option;
    }

    getCorrect() {
        return this.questions.reduce((correct, ques, idx) => {
            if (ques.correct_option == this.markedAnswers[idx]) return correct + 1;
            return correct;
        }, 0);
    }

    getWrong() {
        return this.questions.reduce((wrong, ques, idx) => {
            if (this.markedAnswers[idx] == null) return wrong;
            if (ques.correct_option != this.markedAnswers[idx]) return wrong + 1;
            return wrong;
        }, 0);
    }

    getMarks() {
        let correctQues = this.getCorrect();
        let quesMarks = this.metadata.ques_marks || 1;
        if (!this.metadata.negative_marking) return correctQues * quesMarks;

        let wrongQues = this.getWrong();
        let correctWeight = this.metadata.correct_weight || 4;
        let wrongWeight = this.metadata.wrong_weight || 1;
        return (correctQues * correctWeight) - (wrongQues * wrongWeight);
    }

    getTotalMarks() {
        let quesMarks = this.metadata.ques_marks || 1;
        return this.questions.length * quesMarks;
    }

    getResult() {
        return {
            correct: this.getCorrect(),
            totalQues: this.questions.length,
            marks: this.getMarks(),
            totalMarks: this.getTotalMarks()
        };
    }

    setSubmitted(value) {
        this.submitted = value;
    }
}

const fileReader = new FileReader();
let quiz;

let questionDiv;
let optionsDiv;
let submitBtn;
let uploadBtn;
let jsonInput;
let nextBtn;
let prevBtn;

// ==========================STATE VARIABLES================================

let currentQues;

// =========================================================================

window.addEventListener("load", main);

function main() {
    questionDiv = document.getElementById("question");
    optionsDiv = document.getElementById("options");
    submitBtn = document.getElementById("submit-btn");
    finalSubmitBtn = document.getElementById("submitQuiz");
    uploadBtn = document.getElementById("uploadJson");
    jsonInput = document.getElementById("jsonInput");
    nextBtn = document.getElementById("nextBtn");
    prevBtn = document.getElementById("prevBtn");

    submitBtn.addEventListener("click", onQuizSubmitBtnClicked);
    finalSubmitBtn.addEventListener("click", onQuizSubmitted);
    uploadBtn.addEventListener("click", onUploadBtnClicked);
    jsonInput.addEventListener("change", onFileSelected);
    fileReader.addEventListener("load", onFileLoaded);

    nextBtn.addEventListener("click", onNextBtnClicked);
    prevBtn.addEventListener("click", onPrevBtnClicked);

    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", closeModal);
    });

    renderQuestion();
}

function onQuizSubmitBtnClicked(_event) {
    if (!quiz) return;
    openModal("submitModal");
}

function onQuizSubmitted(_event) {
    closeModal({ target: { dataset: { target: "submitModal" } } });
    const modal = document.getElementById("resultModal");
    let result = quiz.getResult();
    modal.getElementsByClassName("correct-ans")[0].textContent = `${result.correct}/${result.totalQues}`;
    modal.getElementsByClassName("marks")[0].textContent = `${result.marks}/${result.totalMarks}`;
    openModal("resultModal");
    quiz.setSubmitted(true);
    renderQuestion();
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
    quiz = Quiz.fromObj(res);
    currentQues = quiz.getNext();
    renderQuestion();

    document.getElementById("totalQues").textContent = quiz.questions.length;
}

function onOptionClicked(event) {
    let optId = event.target.dataset.option - 1;
    quiz.markAnswer(quiz.cursorPos, optId);
    optionsDiv.childNodes.forEach(option => option.classList.remove("selected"));

    event.target.classList.add("selected");
}

function onNextBtnClicked(_event) {
    if (!quiz) return;
    let ques = quiz.getNext();
    if (ques) {
        currentQues = ques;
        renderQuestion();
    }
}

function onPrevBtnClicked(_event) {
    if (!quiz) return;
    let ques = quiz.getPrev();
    if (ques) {
        currentQues = ques;
        renderQuestion();
    }
}

function renderQuestion() {
    if (!currentQues) return;

    questionDiv.textContent = currentQues.question;
    optionsDiv.innerHTML = "";

    let markedIdx = quiz.markedAnswers[quiz.cursorPos];
    let submitted = quiz.submitted;
    currentQues.options.forEach((option, idx) => {
        let btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.dataset.option = idx + 1;
        btn.innerText = option;
        btn.addEventListener("click", onOptionClicked);
        if (submitted) {
            btn.classList.add("no-input");
            if (idx == currentQues.correct_option) {
                btn.classList.add("correct");
                btn.classList.remove("selected");
            } else if (idx === markedIdx) {
                btn.classList.add("wrong");
                btn.classList.remove("selected");
            }
        } else {
            if (idx == markedIdx) btn.classList.add("selected");

        }
        optionsDiv.appendChild(btn);
    });

    document.getElementById("currentIdx").textContent = quiz.cursorPos + 1;
}

// function revealAnswers() {
//     optionsDiv.childNodes.forEach((option, idx) => {
//         if (idx === correctOption) {
//             option.classList.add("correct");
//             option.classList.remove("selected");
//         } else if (idx === selectedOption) {
//             option.classList.add("wrong");
//             option.classList.remove("selected");
//         }
//     });
// }

function openModal(modalId) {
    document.getElementById("modalBg").classList.remove("hidden");
    document.getElementById(modalId).classList.remove("hidden");
}

function closeModal(event) {
    document.getElementById(event.target.dataset.target).classList.add("hidden");
    document.getElementById("modalBg").classList.add("hidden");
}
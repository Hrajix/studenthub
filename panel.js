document.addEventListener("DOMContentLoaded", () => {
  const subjectInput = document.getElementById("subjectInput");
  const addSubjectBtn = document.getElementById("addSubjectBtn");
  const subjectList = document.getElementById("subjectList");
  const timetable = document.getElementById("timetable");

  // Přidání předmětu do seznamu
  addSubjectBtn.addEventListener("click", () => {
    const name = subjectInput.value.trim();
    if (name === "") return;

    const li = document.createElement("li");
    li.textContent = name;
    li.draggable = true;
    li.addEventListener("dragstart", dragStart);
    subjectList.appendChild(li);
    subjectInput.value = "";
  });

  // Umožní přetahování předmětů do tabulky
  timetable.querySelectorAll("td").forEach(td => {
    td.addEventListener("dragover", dragOver);
    td.addEventListener("dragleave", dragLeave);
    td.addEventListener("drop", drop);
  });

  function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.textContent);
  }

  function dragOver(e) {
    e.preventDefault();
    e.target.classList.add("drop-target");
  }

  function dragLeave(e) {
    e.target.classList.remove("drop-target");
  }

  function drop(e) {
    e.preventDefault();
    const subject = e.dataTransfer.getData("text/plain");
    e.target.classList.remove("drop-target");

    if (e.target.tagName === "TD" && !e.target.classList.contains("filled")) {
      e.target.textContent = subject;
      e.target.classList.add("filled");
    }
  }
});
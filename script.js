// students stringified array of objects to be stored in localstorage with this variable name
const students_db = "students_db";

// needed document elements
const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const idInput = document.getElementById("studentId");
const emailInput = document.getElementById("email");
const contactInput = document.getElementById("contact");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const studentsTbody = document.getElementById("studentsTbody");
const countInfo = document.getElementById("countInfo");
const clearAllBtn = document.getElementById("clearAllBtn");
const listContainer = document.getElementById("listContainer");

// variable to hold array of student objects in form of {name,studentId,email,contact}
let students = [];
let editIndex = -1; // -1 means new entry, otherwise index of student being edited

/* ---------- Initialisation ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  renderTable();
  setupListeners();
  ensureScrollbar(); // on load check
});

// function to save data in localstorage
function saveToStorage() {
  localStorage.setItem(students_db, JSON.stringify(students));
}

// function to load students data from localstorage
function loadFromStorage() {
  const raw = localStorage.getItem(students_db);
  if (raw) {
    try {
      students = JSON.parse(raw) || [];
    } catch (e) {
      students = [];
      console.error("Failed to parse storage:", e);
    }
  }
}

// function to render students array in dom (html)
function renderTable() {
  studentsTbody.innerHTML = "";
  if (students.length === 0) {
    countInfo.textContent = "No records yet.";
  } else {
    countInfo.textContent = `${students.length} student(s) registered.`;
  }

  students.forEach((student, idx) => {
    const tr = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.textContent = idx + 1;
    tr.appendChild(tdIndex);

    const tdName = document.createElement("td");
    tdName.textContent = student.name;
    tr.appendChild(tdName);

    const tdId = document.createElement("td");
    tdId.textContent = student.studentId;
    tr.appendChild(tdId);

    const tdEmail = document.createElement("td");
    tdEmail.textContent = student.email;
    tr.appendChild(tdEmail);

    const tdContact = document.createElement("td");
    tdContact.textContent = student.contact;
    tr.appendChild(tdContact);

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "action-btn action-edit";
    btnEdit.textContent = "Edit";
    btnEdit.addEventListener("click", () => startEdit(idx));
    tdActions.appendChild(btnEdit);

    const btnDelete = document.createElement("button");
    btnDelete.className = "action-btn action-delete";
    btnDelete.textContent = "Delete";
    btnDelete.addEventListener("click", () => deleteStudent(idx));
    tdActions.appendChild(btnDelete);

    tr.appendChild(tdActions);

    studentsTbody.appendChild(tr);
  });

  ensureScrollbar();
}

// function to dynamically add vertical scrollbar as mentioned in the project requirements
function ensureScrollbar() {
  // small delay to ensure DOM updated
  setTimeout(() => {
    const maxVisibleHeight = 360; // px - available area before scroll
    // if the table actual height is higher than threshold, enable overflow
    if (listContainer.scrollHeight > maxVisibleHeight) {
      listContainer.style.maxHeight = maxVisibleHeight + "px";
      listContainer.style.overflowY = "auto";
    } else {
      listContainer.style.maxHeight = "none";
      listContainer.style.overflowY = "visible";
    }
  }, 0);
}

// function for form input validations
function validateInputs() {
  const name = nameInput.value.trim();
  const studentId = idInput.value.trim();
  const email = emailInput.value.trim();
  const contact = contactInput.value.trim();

  // Name: letters and spaces only (unicode letters)
  const nameOk = /^[\p{L} ]+$/u.test(name);
  if (!nameOk)
    return { ok: false, message: "Name must contain letters and spaces only." };

  // Student ID: digits only
  if (!/^\d+$/.test(studentId))
    return { ok: false, message: "Student ID must be numeric." };

  // Email basic check (HTML input will do extra, but we verify)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk)
    return { ok: false, message: "Please enter a valid email address." };

  // Contact: digits only and at least 10 digits
  if (!/^\d+$/.test(contact))
    return { ok: false, message: "Contact must contain digits only." };
  if (contact.length !== 10)
    return { ok: false, message: "Contact number must be 10 digits." };

  // Prevent duplicate empty rows - check fields non-empty
  if (!name || !studentId || !email || !contact)
    return { ok: false, message: "All fields are required." };

  return { ok: true };
}


// function to perform crud operations on students data

// add student
function addStudent(data) {
  students.push({ ...data });
  saveToStorage();
  renderTable();
  form.reset();
  editIndex = -1;
  submitBtn.textContent = "Add Student";
  showToast("Student added.");
}

// start edit student by prefilling inputs with current data
function startEdit(index) {
  const student = students[index];
  nameInput.value = student.name;
  idInput.value = student.studentId;
  emailInput.value = student.email;
  contactInput.value = student.contact;
  editIndex = index;
  submitBtn.textContent = "Save Changes";
  // scroll to form at top 
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// save edited data in localstorage
function saveEdit(index, data) {
  students[index] = { ...students[index], ...data };
  saveToStorage();
  renderTable();
  form.reset();
  editIndex = -1;
  submitBtn.textContent = "Add Student";
  showToast("Changes saved.");
}


// delete student data
function deleteStudent(index) {
  if (!confirm("Delete this student record?")) return;
  students.splice(index, 1);
  saveToStorage();
  renderTable();
  showToast("Record deleted.");
}

// delete all students data
function clearAll() {
  if (!confirm("This will delete ALL records. Continue?")) return;
  students = [];
  saveToStorage();
  renderTable();
  showToast("All records cleared.");
}


function setupListeners() {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const validation = validateInputs();
    if (!validation.ok) {
      alert(validation.message);
      return;
    }

    const data = {
      name: nameInput.value.trim(),
      studentId: idInput.value.trim(),
      email: emailInput.value.trim(),
      contact: contactInput.value.trim(),
    };

    if (editIndex >= 0) {
      saveEdit(editIndex, data);
    } else {
      addStudent(data);
    }
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    editIndex = -1;
    submitBtn.textContent = "Add Student";
  });

  clearAllBtn.addEventListener("click", clearAll);

  // Input restrictions while typing: restrict characters for some fields
  idInput.addEventListener("input", () => {
    idInput.value = idInput.value.replace(/[^\d]/g, "");
  });
  contactInput.addEventListener("input", () => {
    contactInput.value = contactInput.value.replace(/[^\d]/g, "");
  });
  nameInput.addEventListener("input", () => {
    // allow letters and spaces only
    nameInput.value = nameInput.value.replace(/[^\p{L} ]/gu, "");
  });
}


// simple toast to show a msg
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.right = "20px";
  t.style.bottom = "20px";
  t.style.background = "rgba(6,20,30,0.9)";
  t.style.color = "#d7fbe8";
  t.style.padding = "10px 14px";
  t.style.borderRadius = "8px";
  t.style.boxShadow = "0 6px 18px rgba(0,0,0,0.6)";
  document.body.appendChild(t);
  setTimeout(() => (t.style.opacity = "0.0"), 1600);
  setTimeout(() => t.remove(), 2100);
}

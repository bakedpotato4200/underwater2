// frontend/js/recurring.js
// ========================================
// Under Water 2 - Recurring Items Page
// Handles loading, creating, updating, deleting
// ========================================

import {
  apiGetRecurring,
  apiCreateRecurring,
  apiUpdateRecurring,
  apiDeleteRecurring
} from "./api.js";

import { formatMoney } from "./config.js";

// DOM Elements
const recForm = document.getElementById("recurring-form");
const recError = document.getElementById("recurring-error");
const recTableBody = document.getElementById("recurring-table-body");

// Active edit item ID
let editId = null;

// ========================================
// Load all recurring items
// Called by ui.js → showView("recurring-view")
// ========================================
export async function loadRecurringPage() {
  recError.textContent = "";
  recTableBody.innerHTML = "";

  try {
    const items = await apiGetRecurring();
    items.forEach(renderRow);
  } catch (err) {
    recError.textContent = "Failed to load recurring items.";
    console.error(err);
  }
}

// ========================================
// Render a table row for each item
// ========================================
function renderRow(item) {
  const tr = document.createElement("tr");
  
  const typeBadgeClass = item.type === "income" ? "badge-income" : "badge-expense";
  const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);

  tr.innerHTML = `
    <td>${item.name}</td>
    <td><span class="badge ${typeBadgeClass}">${typeLabel}</span></td>
    <td>${item.frequency}</td>
    <td>${formatMoney(item.amount)}</td>
    <td>${item.startDate.split("T")[0]}</td>
    <td>
      <button class="btn btn-ghost rec-edit" data-id="${item._id}" title="Edit">✏️</button>
      <button class="btn btn-ghost rec-delete" data-id="${item._id}" title="Delete">🗑️</button>
    </td>
  `;

  recTableBody.appendChild(tr);
}

// ========================================
// Handle Add / Update Form
// ========================================
recForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  recError.textContent = "";

  const item = {
    name: document.getElementById("rec-name").value.trim(),
    amount: Number(document.getElementById("rec-amount").value),
    type: document.getElementById("rec-type").value,
    frequency: document.getElementById("rec-frequency").value,
    startDate: document.getElementById("rec-start-date").value,
  };

  try {
    if (editId) {
      await apiUpdateRecurring(editId, item);
      editId = null;
    } else {
      await apiCreateRecurring(item);
    }

    recForm.reset();
    loadRecurringPage();

  } catch (err) {
    recError.textContent = err.message;
  }
});

// ========================================
// Click Events: Edit / Delete
// ========================================
recTableBody.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".rec-edit");
  const delBtn = e.target.closest(".rec-delete");

  // ----------- EDIT -----------
  if (editBtn) {
    const id = editBtn.dataset.id;
    startEdit(id);
    return;
  }

  // ----------- DELETE -----------
  if (delBtn) {
    const id = delBtn.dataset.id;

    try {
      await apiDeleteRecurring(id);
      loadRecurringPage();
    } catch (err) {
      recError.textContent = "Failed to delete item.";
    }

    return;
  }
});

// ========================================
// Load item into form for editing
// ========================================
function startEdit(id) {
  editId = id;

  // Find the table row for this ID
  const row = [...recTableBody.querySelectorAll("tr")].find((tr) =>
    tr.querySelector(".rec-edit")?.dataset.id === id
  );

  if (!row) return;

  const tds = row.querySelectorAll("td");

  document.getElementById("rec-name").value = tds[0].textContent;
  document.getElementById("rec-type").value = tds[1].textContent;
  document.getElementById("rec-frequency").value = tds[2].textContent;
  document.getElementById("rec-amount").value = Number(
    tds[3].textContent.replace(/[$,]/g, "")
  );
  document.getElementById("rec-start-date").value = tds[4].textContent;
}
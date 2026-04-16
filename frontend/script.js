const API = "https://demo-deploy-iu7p.onrender.com/api/products";

async function getProducts() {
  const response = await fetch(API);
  const products = await response.json();
  const table = document.getElementById("productList");
  table.innerHTML = "";
  closeDetail();
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    table.innerHTML += `
      <tr id="row-${p.id}">
        <td>${p.name}</td>
        <td class="price">${p.price} €</td>
        <td>
          <div class="actions">
            <button class="btn-view"   onclick="showDetail('${p.name}', ${p.price}, \`${p.description || ''}\`)">Voir</button>
            <button class="btn-edit"   onclick="startEdit(${p.id}, '${p.name}', ${p.price})">Modifier</button>
            <button class="btn-delete" onclick="removeProduct(${p.id})">Supprimer</button>
          </div>
        </td>
      </tr>
    `;
  }
}

async function addProduct() {
  const name        = document.getElementById("name").value;
  const price       = document.getElementById("price").value;
  const description = document.getElementById("description").value;
  if (name === "" || price === "") { alert("Remplir les champs"); return; }
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price: Number(price), description })
  });
  document.getElementById("name").value        = "";
  document.getElementById("price").value       = "";
  document.getElementById("description").value = "";
  getProducts();
}

async function removeProduct(id) {
  if (!confirm("Tu veux supprimer ?")) return;
  await fetch(API + "/" + id, { method: "DELETE" });
  getProducts();
}

function startEdit(id, name, price) {
  const row = document.getElementById("row-" + id);
  row.innerHTML = `
    <td><input class="edit-input" id="name-${id}"  value="${name}"></td>
    <td><input class="edit-input" id="price-${id}" value="${price}"></td>
    <td>
      <div class="actions">
        <button class="btn-save"   onclick="saveEdit(${id})">Sauver</button>
        <button class="btn-cancel" onclick="getProducts()">Annuler</button>
      </div>
    </td>
  `;
}

async function saveEdit(id) {
  const name  = document.getElementById("name-"  + id).value;
  const price = document.getElementById("price-" + id).value;
  await fetch(API + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price: Number(price) })
  });
  getProducts();
}

function showDetail(name, price, description) {
  const panel   = document.getElementById("detail-panel");
  const content = document.getElementById("detail-content");
  content.innerHTML = `
    <h3>${name}</h3>
    <div class="detail-price">${price} €</div>
    <div class="detail-desc">${description || '<em>Aucune description disponible.</em>'}</div>
  `;
  panel.style.display = "block";
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeDetail() {
  const panel = document.getElementById("detail-panel");
  if (panel) panel.style.display = "none";
}

getProducts();
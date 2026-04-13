const API = 'https://demo-deploy-iu7p.onrender.com/api/products';

  async function fetchProducts() {
    try {
      const res = await fetch(API);
      const products = await res.json();
      const tbody = document.getElementById('productList');

      if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">Aucun produit trouvé</td></tr>';
        return;
      }

      tbody.innerHTML = products.map(p => `
        <tr id="row-${p.id}">
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>${p.price} €</td>
          <td class="actions">
            <button class="btn-edit" onclick="editRow(${p.id}, '${p.name}', ${p.price})">✏️ Modifier</button>
            <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️ Supprimer</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      showToast('Erreur de connexion à l\'API', true);
    }
  }

  async function createProduct() {
    const name  = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);

    if (!name || isNaN(price)) {
      showToast('Remplis tous les champs', true); return;
    }

    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    });

    document.getElementById('name').value  = '';
    document.getElementById('price').value = '';
    showToast('Produit ajouté !');
    fetchProducts();
  }

  function editRow(id, name, price) {
    const row = document.getElementById(`row-${id}`);
    row.innerHTML = `
      <td>${id}</td>
      <td><input type="text" id="edit-name-${id}" value="${name}" /></td>
      <td><input type="number" id="edit-price-${id}" value="${price}" step="0.01" /></td>
      <td class="actions">
        <button class="btn-save" onclick="updateProduct(${id})">💾 Sauver</button>
        <button class="btn-cancel" onclick="fetchProducts()">Annuler</button>
      </td>
    `;
  }

  async function updateProduct(id) {
    const name  = document.getElementById(`edit-name-${id}`).value.trim();
    const price = parseFloat(document.getElementById(`edit-price-${id}`).value);

    if (!name || isNaN(price)) {
      showToast('Remplis tous les champs', true); return;
    }

    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    });

    showToast('Produit modifié !');
    fetchProducts();
  }

  async function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    showToast('Produit supprimé !');
    fetchProducts();
  }

  function showToast(msg, error = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (error ? ' error' : '');
    setTimeout(() => t.className = 'toast', 3000);
  }

  fetchProducts();
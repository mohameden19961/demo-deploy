  // const API = "https://demo-deploy-iu7p.onrender.com/api/products";
  const API = "http://localhost:8080/api/products";
    async function getProducts() {
      const response = await fetch(API);
      const products = await response.json();
      const table = document.getElementById("productList");
      table.innerHTML = "";
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        table.innerHTML += `
          <tr id="row-${p.id}">
            <td>${p.name}</td>
            <td>${p.price} €</td>
            <td>
              <div class="actions">
                <button onclick="startEdit(${p.id}, '${p.name}', ${p.price})">Modifier</button>
                <button onclick="removeProduct(${p.id})">Supprimer</button>
              </div>
            </td>
          </tr>
        `;
      }
    }

    async function addProduct() {
      const name = document.getElementById("name").value;
      const price = document.getElementById("price").value;
      if (name === "" || price === "") { alert("Remplir les champs"); return; }
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, price: Number(price) })
      });
      document.getElementById("name").value = "";
      document.getElementById("price").value = "";
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
        <td>${id}</td>
        <td><input id="name-${id}" value="${name}"></td>
        <td><input id="price-${id}" value="${price}"></td>
        <td>
          <div class="actions">
            <button onclick="saveEdit(${id})">Sauver</button>
            <button onclick="getProducts()">Annuler</button>
          </div>
        </td>
      `;
    }

    async function saveEdit(id) {
      const name = document.getElementById("name-" + id).value;
      const price = document.getElementById("price-" + id).value;
      await fetch(API + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, price: Number(price) })
      });
      getProducts();
    }

    getProducts();
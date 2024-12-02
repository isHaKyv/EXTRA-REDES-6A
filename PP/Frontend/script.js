const API_URL = 'http://localhost:3000/api';
let token = null;

// Iniciar sesión
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        user = data.user;
        userId = user.id;
        token = data.token;

        document.getElementById('login').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';

        loadProducts();
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: {
                'Authorization': token,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }

        const products = await response.json();

        // Verificar si `products` es un array
        if (!Array.isArray(products)) {
            console.error('La respuesta no es un array:', products);
            return;
        }

        const productsDiv = document.getElementById('products');
        productsDiv.innerHTML = products.map(product => `
            <div class="card">
                <h3>${product.name}</h3>
                <p><strong>Precio:</strong> $${product.price}</p>
                <p><strong>Creado por:</strong> ${product.created_by}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}


// Agregar producto
const form = document.getElementById('productForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;

    await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify({ name, price, userId }),
    });

    form.reset();
    loadProducts();
});


async function deleteProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
            },
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }

        alert('Producto eliminado exitosamente');
        loadProducts(); // Recargar la lista de productos
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        alert('No se pudo eliminar el producto');
    }
}

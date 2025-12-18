// DOM Elements
const adminForm = document.getElementById('adminForm');
const productList = document.getElementById('productList');

// Initialize
init();

function init() {
    loadProducts();
}

// Event Listeners
adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProduct();
});

// Logic
function getProducts() {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
}

function saveProduct() {
    const nameInput = document.getElementById('productName');
    const priceInput = document.getElementById('productPrice');

    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);

    if (!name || isNaN(price) || price < 0) {
        alert('Please enter valid product details');
        return;
    }

    const products = getProducts();

    // Check if product exists (simple check by name)
    const existingIndex = products.findIndex(p => p.name.toLowerCase() === name.toLowerCase());

    const newProduct = {
        id: Date.now(),
        name,
        price
    };

    if (existingIndex >= 0) {
        if (confirm(`"${name}" already exists. Update price to ₹${price}?`)) {
            products[existingIndex].price = price;
        } else {
            return;
        }
    } else {
        products.push(newProduct);
    }

    localStorage.setItem('products', JSON.stringify(products));

    // Reset Form
    nameInput.value = '';
    priceInput.value = '';
    nameInput.focus();

    loadProducts();
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
    }
}

function loadProducts() {
    const products = getProducts();
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<div class="empty-state"><p>No products saved yet.</p></div>';
        return;
    }

    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-item';
        div.innerHTML = `
            <div class="product-info">
                <strong>${product.name}</strong>
                <span class="product-price">₹${product.price.toFixed(2)}</span>
            </div>
            <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
        `;
        productList.appendChild(div);
    });
}

// Global scope for onclick
window.deleteProduct = deleteProduct;

// State
let billItems = [];
let billCounter = 101;

// DOM Elements
const productForm = document.getElementById('productForm');
const billBody = document.getElementById('billBody');
const emptyState = document.getElementById('emptyState');
const subTotalEl = document.getElementById('subTotal');
const gstEl = document.getElementById('gstAmount');
const grandTotalEl = document.getElementById('grandTotal');
const clearBtn = document.getElementById('clearBtn');
const printBtn = document.getElementById('printBtn');
const currentDateEl = document.getElementById('currentDate');
const billNumberEl = document.getElementById('billNumber');

// Print DOM Elements
const printBody = document.getElementById('printBody');
const printBillNo = document.getElementById('printBillNo');
const printDate = document.getElementById('printDate');
const printSubTotal = document.getElementById('printSubTotal');
const printGst = document.getElementById('printGst');
const printGrandTotal = document.getElementById('printGrandTotal');

// Initialize
function init() {
    updateDate();
    loadProductSuggestions();
    renderBill();
}

function loadProductSuggestions() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const datalist = document.getElementById('productListSuggestions');
    datalist.innerHTML = '';
    products.forEach(p => {
        const option = document.createElement('option');
        option.value = p.name;
        datalist.appendChild(option);
    });
}

// Auto-fill price on product selection
document.getElementById('productName').addEventListener('input', function (e) {
    const val = this.value;
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.name.toLowerCase() === val.toLowerCase());

    if (product) {
        document.getElementById('productPrice').value = product.price;
        // Optional: Focus quantity if price is found
        document.getElementById('productQty').focus();
    }
});

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-IN', options);
    currentDateEl.textContent = dateStr;
    printDate.textContent = now.toLocaleDateString('en-GB'); // DD/MM/YYYY for print
}

// Event Listeners
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addItem();
});

clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the current bill?')) {
        resetBill();
    }
});

printBtn.addEventListener('click', () => {
    if (billItems.length === 0) {
        alert('Please add items to the bill before printing.');
        return;
    }
    preparePrint();
    window.print();
    // Optional: Auto increment bill number after print
    // billCounter++;
    // billNumberEl.textContent = billCounter;
});

// Logic
function addItem() {
    const nameInput = document.getElementById('productName');
    const qtyInput = document.getElementById('productQty');
    const priceInput = document.getElementById('productPrice');

    const name = nameInput.value.trim();
    const qty = parseInt(qtyInput.value);
    const price = parseFloat(priceInput.value);

    // Validation handled by HTML5, but extra check doesn't hurt
    if (!name || qty <= 0 || price < 0) return;

    const total = qty * price;

    const newItem = {
        id: Date.now(),
        name,
        qty,
        price,
        total
    };

    billItems.push(newItem);

    // Reset form
    nameInput.value = '';
    qtyInput.value = 1;
    priceInput.value = '';
    nameInput.focus();

    renderBill();
}

function removeItem(id) {
    billItems = billItems.filter(item => item.id !== id);
    renderBill();
}

function resetBill() {
    billItems = [];
    renderBill();
}

function renderBill() {
    // 1. Render Table Rows
    billBody.innerHTML = '';

    if (billItems.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';

        billItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td class="text-right">${item.qty}</td>
                <td class="text-right">₹${item.price.toFixed(2)}</td>
                <td class="text-right">₹${item.total.toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn-icon" onclick="removeItem(${item.id})" title="Remove Item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </td>
            `;
            billBody.appendChild(tr);
        });
    }

    // 2. Calculate Totals
    const subTotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const gstRate = 0.05;
    const gst = subTotal * gstRate;
    const grandTotal = subTotal + gst;

    // 3. Update DOM Totals
    subTotalEl.textContent = formatCurrency(subTotal);
    gstEl.textContent = formatCurrency(gst);
    grandTotalEl.textContent = formatCurrency(grandTotal);
}

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function preparePrint() {
    // Copy data to print area
    printBillNo.textContent = billNumberEl.textContent;
    printBody.innerHTML = '';

    billItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${item.total.toFixed(2)}</td>
        `;
        printBody.appendChild(tr);
    });

    const subTotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const gst = subTotal * 0.05;
    const grandTotal = subTotal + gst;

    printSubTotal.textContent = formatCurrency(subTotal);
    printGst.textContent = formatCurrency(gst);
    printGrandTotal.textContent = formatCurrency(grandTotal);
}

// Make removeItem global so it can be called from inline onclick
window.removeItem = removeItem;

init();

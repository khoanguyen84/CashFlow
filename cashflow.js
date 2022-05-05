class Product {
    constructor(productId, productName, quantity, price) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
        this.amount = this.quantity * this.price;
    }
}

var products = [];
const key_data = "product_data";
const sort_asc = "asc";
const sort_desc = "desc";
const page_size = 5;
const default_page_number = 1;
var current_page = 1;


function init() {
    if (getData(key_data) == null) {
        products = [
            new Product(1, "Gà", 5, 150000),
            new Product(2, "Vịt", 7, 120000),
            new Product(3, "Bò", 5, 250000),
            new Product(4, "Heo", 10, 0),
        ]
        setData(key_data, products);
    }
    else {
        products = getData(key_data);
    }
}

function renderPagination(page_size, page_number){
    let total_page = Math.ceil(products.length/page_size)
    let pagination =document.querySelector(".pagination>ul");
    pagination.innerHTML = "";
    for(let i = 1; i <= total_page; i++){
        pagination.innerHTML += `<li class="page-item ${page_number==i ? 'active' : ''}"><button onclick='paging(${i})'>${i}</button></li>`
    }
}

function getData(key) {
    return JSON.parse(localStorage.getItem(key))
}
function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

function renderProduct(data, page_number) {
    let tbProduct = document.querySelector('.table>tbody');
    let pages = data.slice((page_number - 1) * page_size, page_number * page_size)
    let htmls = pages.map(function (product) {
        return `
            <tr id="tr_${product.productId}">
                <td>P-${product.productId}</td>
                <td>${product.productName}</td>
                <td class="text-right">${product.quantity}</td>
                <td class="text-right">${formatCurrency(product.price)}</td>
                <td class="text-right">${formatCurrency(product.amount)}</td>
                <td id="action_${product.productId}" class='text-right'>
                    <button class="btn btn-warning" onclick="change(${product.productId})">Edit</button>
                    <button class="btn btn-primary d-none" onclick="update(${product.productId})">Update</button>
                    <button class="btn btn-warning d-none" onclick="resetRow(${product.productId})">Cancel</button>
                    <button class="btn btn-danger" onclick="remove(${product.productId})">Remove</button>
                </td>
            </tr>
        `;
    })
    tbProduct.innerHTML = htmls.join("");
    document.querySelector("#totalAmount").innerHTML = formatCurrency(totalAmount());
}

function totalAmount() {
    let totalAmount = products.reduce(function (total, pdt) {
        return total + pdt.amount
    }, 0)
    return totalAmount;
}

function formatCurrency(number) {
    return number.toLocaleString('vi', { style: 'currency', currency: 'VND' });
}

function addProduct() {
    // b1: lấy value từ các field
    // b2: tạo ra 1 đối tượng Product
    // b3: thêm vào products
    // b4: renderProduct()
    // b5: reset/clear form
    let productName = document.querySelector("#productName").value;
    if (!validation(productName)) {
        alert("Product name is required!")
        return;
    }
    let quantity = Number(document.querySelector("#quantity").value);
    let price = Number(document.querySelector("#price").value);
    let productId = getLastestId() + 1;
    let newProduct = new Product(productId, productName, quantity, price)

    products.push(newProduct);
    setData(key_data, products);
    renderProduct(products, default_page_number);
    renderPagination(page_size, default_page_number);
    resetForm();
}

function getLastestId() {
    let productTemp = [...products];
    let maxId = productTemp.sort(function (pdt1, pdt2) {
        return pdt2.productId - pdt1.productId
    })[0].productId
    return maxId;
}

function resetForm() {
    document.querySelector("#productName").value = "";
    document.querySelector("#quantity").value = "";
    document.querySelector("#price").value = "";
}

function validation(field) {
    return field != null && field.trim() != '';
}

function remove(productId) {
    let confirmed = window.confirm("Bạn có muốn xóa sản phẩm này không?");
    if (confirmed) {
        let position = products.findIndex(function (pdt) {
            return pdt.productId == productId;
        })
        products.splice(position, 1);
        setData(key_data, products);
        renderProduct(products, default_page_number);
        renderPagination(page_size, default_page_number);
    }
}

function sort(option) {
    let { direction, field } = option;
    if (direction == sort_asc) {
        products.sort(function (pdt1, pdt2) {
            if (pdt1[field] < pdt2[field]) {
                return 1
            }
            else if (pdt1[field] > pdt2[field]) {
                return -1
            }
            else {
                return 0;
            }
        })
    }
    else {
        products.reverse();
    }
    renderProduct(products, current_page);
}

function getProductById(pdtId) {
    return products.find(function (pdt) {
        return pdt.productId == pdtId;
    })
}

function change(pdtId) {
    let tr = document.getElementById(`tr_${pdtId}`);
    let product = getProductById(pdtId);
    tr.children[1].innerHTML = `<input class='form-control-md' type='text' value='${product.productName}' />`
    tr.children[2].innerHTML = `<input class='form-control-md text-right' type='number' value='${product.quantity}' />`
    tr.children[3].innerHTML = `<input class='form-control-md text-right' type='number' value='${product.price}' />`
    let action = document.getElementById(`action_${pdtId}`);
    action.children[0].classList.add('d-none');
    action.children[1].classList.remove('d-none');
    action.children[2].classList.remove('d-none');
}

function resetRow(pdtId) {
    let tr = document.getElementById(`tr_${pdtId}`);
    let product = getProductById(pdtId);
    tr.children[1].innerHTML = product.productName;
    tr.children[2].innerHTML = product.quantity;
    tr.children[3].innerHTML = formatCurrency(product.price);
    let action = document.getElementById(`action_${pdtId}`);
    action.children[0].classList.remove('d-none');
    action.children[1].classList.add('d-none');
    action.children[2].classList.add('d-none');
}

function update(pdtId) {
    let tr = document.getElementById(`tr_${pdtId}`);
    let product = getProductById(pdtId);
    let newProductName = tr.children[1].children[0].value;
    if (!newProductName) {
        alert("Product name is required!")
        return;
    }
    let newQuantity = Number(tr.children[2].children[0].value);
    let newPrice = Number(tr.children[3].children[0].value);
    product.productName = newProductName;
    product.quantity = newQuantity;
    product.price = newPrice;
    product.amount = product.quantity * product.price;
    tr.children[4].innerHTML = formatCurrency(product.amount);
    setData(key_data, products);
    resetRow(pdtId);
    document.querySelector("#totalAmount").innerHTML = formatCurrency(totalAmount());
}

function paging(page_number){
    current_page = page_number;
    renderPagination(page_size, page_number)
    renderProduct(products, page_number);
}
function ready() {
    init();
    renderPagination(page_size, default_page_number);
    renderProduct(products, default_page_number);
}

ready();
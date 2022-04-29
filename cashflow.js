class Product{
    constructor(productId, productName, quantity, price){
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

function init(){
    if(getData(key_data) == null){
        products = [
            new Product(1, "Gà", 5, 150000),
            new Product(2, "Vịt", 7, 120000),
            new Product(3, "Bò", 5, 250000),
            new Product(4, "Heo", 10, 0),
        ]
        setData(key_data, products);
    }
    else{
        products = getData(key_data);
    }
}

function getData(key){
    return JSON.parse(localStorage.getItem(key))
}
function setData(key, data){
    localStorage.setItem(key, JSON.stringify(data))    
}

function renderProduct(){
    let tbProduct = document.querySelector('.table>tbody');
    let htmls = products.map(function(product){
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

function totalAmount(){
    let totalAmount = products.reduce(function(total ,pdt){
        return total + pdt.amount
    }, 0)
    return totalAmount;
}

function formatCurrency(number){
    return number.toLocaleString('vi', {style : 'currency', currency : 'VND'});
}

function addProduct(){
    // b1: lấy value từ các field
    // b2: tạo ra 1 đối tượng Product
    // b3: thêm vào products
    // b4: renderProduct()
    // b5: reset/clear form
    let productName = document.querySelector("#productName").value;
    if(!validation(productName)){
        alert("Product name is required!")
        return;
    }
    let quantity = Number(document.querySelector("#quantity").value);
    let price = Number(document.querySelector("#price").value);
    let productId = getLastestId() + 1;
    let newProduct = new Product(productId, productName, quantity, price)
    
    products.push(newProduct);
    setData(key_data, products);
    renderProduct();
    resetForm();
}

function getLastestId(){
    let productTemp = [...products];
    let maxId = productTemp.sort(function(pdt1, pdt2){
        return pdt2.productId - pdt1.productId
    })[0].productId
    return maxId;
}

function resetForm(){
    document.querySelector("#productName").value = "";
    document.querySelector("#quantity").value = "";
    document.querySelector("#price").value = "";
}

function validation(field){
    return field != null && field.trim() != '';
}

function remove(productId){
    let confirmed = window.confirm("Bạn có muốn xóa sản phẩm này không?");
    if(confirmed){
        let position = products.findIndex(function(pdt){
            return pdt.productId == productId;
        })
        products.splice(position, 1);
        setData(key_data, products);
        renderProduct();
    }
}

function sort(direct){
    if(direct == sort_asc){
        products.sort(function(pdt1, pdt2){
            return pdt1.price - pdt2.price;
        })
    }
    else{
        products.reverse();
    }
    renderProduct();
}

function getProductById(pdtId){
    return products.find(function(pdt){
        return pdt.productId == pdtId;
    })
}

function change(pdtId){
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

function resetRow(pdtId){
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

function update(pdtId){
    let tr = document.getElementById(`tr_${pdtId}`);
    let product = getProductById(pdtId);
    let newProductName = tr.children[1].children[0].value;
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
function ready(){
    init();
    renderProduct();
}

ready();
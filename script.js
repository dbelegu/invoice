'use strict';

var products = [
  { name: "Apple", quantity: 30, discount: 0, tax: 0.1, price: 2.5 },
  { name: "Banana", quantity: 50, discount: 0.5, tax: 0.1, price: 1.5 },
  { name: "Laptop", quantity: 10, discount: 0, tax: 0.18, price: 600 },
  { name: "Computer", quantity: 12, discount: 0.1, tax: 0.18, price: 600 },
  { name: "Monitor", quantity: 24, discount: 0, tax: 0.18, price: 400 }
];
var selectedQuantity = products.map(() => 0);
var selectedProducts = [];
var table = document.getElementById("products-table");
var checkoutButton = document.getElementById("checkout-button");
var invoiceSection = document.getElementById("invoice-section");
var invoiceTable = document.getElementById("invoice-table");
var invoiceTotalPrice = document.getElementById("invoice-total-price");

// Populate the products table
for (var i = 0; i < products.length; i++) {
  var product = products[i];
  var row = table.insertRow();

  var nameCell = row.insertCell();
  nameCell.innerHTML = product.name;

  var quantityCell = row.insertCell();
  quantityCell.innerHTML = product.quantity;

  var taxCell = row.insertCell();
  taxCell.innerHTML = product.tax;

  var priceCell = row.insertCell();
  priceCell.innerHTML = product.price;

  var discountCell = row.insertCell();
  discountCell.innerHTML = product.discount;

  var selectQuantityCell = row.insertCell();
  var selectQuantityInput = document.createElement("input");
  selectQuantityInput.type = "number";
  selectQuantityInput.min = "1";
  selectQuantityInput.max = product.quantity;
  selectQuantityInput.dataset.index = i;
  selectQuantityInput.addEventListener('change', function (e) {
    var index = parseInt(this.dataset.index);
    selectedQuantity[index] = parseInt(e.target.value);
    products[index].selectedQuantity = parseInt(e.target.value);
  });
  selectQuantityCell.appendChild(selectQuantityInput);

  var selectProductCell = row.insertCell();
  var selectProductCheckbox = document.createElement("input");
  selectProductCheckbox.type = "checkbox";
  selectProductCheckbox.dataset.product = JSON.stringify(product);
  selectProductCheckbox.dataset.index = i;
  selectProductCheckbox.addEventListener('change', function () {
    var product = JSON.parse(this.dataset.product);
    var index = JSON.parse(this.dataset.index);
    if (this.checked) {
      var selectedProduct = {
        name: product.name,
        quantity: selectedQuantity[index],
        price: product.price,
        tax: product.tax,
        totalPrice: (selectedQuantity[index] * (product.price + product.price * product.tax)),
        subTotalPrice: (selectedQuantity[index] * product.price),
      };
      selectedProducts.push(selectedProduct);
    } else {
      var index = selectedProducts.indexOf(selectedProduct);
      if (index > -1) {
        selectedProducts.splice(index, 1);
      }
    }
    if (selectedProducts.length > 0) {
      checkoutButton.disabled = false;
    } else {
      checkoutButton.disabled = true;
    }
  });
  selectProductCell.appendChild(selectProductCheckbox);
}

// Handle the checkout event
checkoutButton.onclick = function (e) {
  invoiceSection.style.display = "block";
  var totalPrice = 0;
  for (var i = 0; i < selectedProducts.length; i++) {
    var selectedProduct = selectedProducts[i];
    var row = invoiceTable.insertRow();

    var nameCell = row.insertCell();
    nameCell.innerHTML = selectedProduct.name;

    var quantityCell = row.insertCell();
    quantityCell.innerHTML = selectedProduct.quantity;

    var priceCell = row.insertCell();
    priceCell.innerHTML = selectedProduct.price;

    var totalPriceCell = row.insertCell();
    totalPriceCell.innerHTML = selectedProduct.totalPrice;

    totalPrice += selectedProduct.totalPrice;
  }
  invoiceTotalPrice.innerHTML = "Total Price: $" + totalPrice;
  // pass the selected products to the invoice algorithm
  createInvoices(selectedProducts);
};

function createInvoices(products) {
  // Initialize a list to store the invoices
  var invoices = [];

  // Initialize a new invoice
  var currentInvoice = {
    entries: [],
    totalPrice: 0,
    subTotalPrice: 0,
  };

  for (var i = 0; i < products.length; i++) {
    var product = products[i];
    var entry = {
      productName: product.name,
      quantity: product.quantity,
      price: product.price,
      tax: product.tax,
    };

    // Calculate the total price for the product
    entry.totalPrice = (entry.quantity * (entry.price + entry.price * entry.tax));
    entry.subTotalPrice = (entry.quantity * entry.price);
    //check if adding the current product to the current invoice would exceed the 500$ limit
    if (currentInvoice.totalPrice + entry.totalPrice > 0 && currentInvoice.totalPrice + entry.totalPrice <= 500) {
      currentInvoice.entries.push(entry);
      currentInvoice.totalPrice += entry.totalPrice;
      currentInvoice.subTotalPrice += entry.subTotalPrice;
      invoices.push(currentInvoice);

    } else if (currentInvoice.totalPrice + entry.totalPrice > 500) {
      currentInvoices = [];
      if (entry.quantity > 1) {
        for (let i = 0; i < entry.quantity; i++) {
          let currentInvoice = {
            entries: [{ ...entry, quantity: 1 }],
            totalPrice: entry.totalPrice / entry.quantity,
            subTotalPrice: entry.subTotalPrice / entry.quantity,
          };
          currentInvoices.push(currentInvoice);
        }
      } else {
        currentInvoices = [{
          entries: [entry],
          totalPrice: entry.totalPrice,
          subTotalPrice: entry.subTotalPrice,
        }];
      }
      currentInvoices.forEach(invoice => {
        invoices.push(invoice);
      });
    }
  }

  // display the invoices on the UI
  for (var i = 0; i < invoices.length; i++) {
    var invoiceDiv = document.createElement("div");
    invoiceDiv.style.border = "2px solid gray";
    invoiceDiv.style.margin = "2px";
    invoiceDiv.style.padding = "10px";
    invoiceDiv.style.width = "600px";
    invoiceDiv.innerHTML = "<h3>Invoice " + (i + 1) + ":</h3>";
    document.body.appendChild(invoiceDiv);

    var entriesDiv = document.createElement("div");
    entriesDiv.innerHTML = "<b>Entries:</b>";
    invoiceDiv.appendChild(entriesDiv);

    for (var j = 0; j < invoices[i].entries.length; j++) {
      var entry = invoices[i].entries[j];
      var entryDiv = document.createElement("div");
      entryDiv.innerHTML = entry.productName + " - Quantity: " + entry.quantity + ", Price: " + entry.price + ", Sub Total Price: " + entry.subTotalPrice + ", Total Price: " + entry.totalPrice;
      invoiceDiv.appendChild(entryDiv);
    }
    var totalPriceDiv = document.createElement("div");
    totalPriceDiv.style.textAlign = "right";
    totalPriceDiv.innerHTML = "Sub Total Price: $" + invoices[i].subTotalPrice + "<br></br>Total Price: $" + invoices[i].totalPrice;
    invoiceDiv.appendChild(totalPriceDiv);
  }
}
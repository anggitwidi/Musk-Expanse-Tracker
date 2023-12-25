const body = document.querySelector("body");
const sidebar = body.querySelector(".sidebar");
const toggle = body.querySelector(".toggle");
const modeSwitch = body.querySelector(".toggle-switch");
const modeText = body.querySelector(".mode-text");
let transactions = [];

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    if (sidebar.classList.contains("close")) {
        localStorage.setItem("sidebar", "close");
    } else {
        localStorage.setItem("sidebar", "open");
    }
});

modeSwitch.addEventListener("click", () => {
    body.classList.toggle("light");

    if (body.classList.contains("light")) {
        localStorage.setItem("theme", "light");
        modeText.innerText = "Dark Mode";
    } else {
        localStorage.setItem("theme", "dark");
        modeText.innerText = "Light Mode";
    }
});

if (localStorage.getItem("theme") === "light") {
    body.classList.add("light");
    modeText.innerText = "Dark Mode";
} else if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
    modeText.innerText = "Light Mode";
}

if (localStorage.getItem("sidebar") === "open") {
    sidebar.classList.remove("close");
} else if (localStorage.getItem("sidebar") === "close") {
    sidebar.classList.add("close");
}

function getTransactions() {
    try {
        const storedTransactions = localStorage.getItem('transactions');
        return storedTransactions ? JSON.parse(storedTransactions) : [];
    } catch (error) {
        console.error('Error', error);
        return [];
    }
}

function saveTransactions() {
    try {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
        console.error('Error', error);
    }
}

function addTransaction(deskripsi, jumlah, tanggal, type) {
    const newTransaction = {
        id: transactions.length + 1,
        deskripsi,
        jumlah,
        tanggal,
        type
    };

    transactions.push(newTransaction);

    saveTransactions();

    renderList();
}

function groupTransactionsByMonth(transactions) {
    const sortedTransactions = transactions.slice().sort((a, b) => {
        return new Date(b.tanggal) - new Date(a.tanggal);
    });

    const groupedTransactions = new Map();
    sortedTransactions.forEach(transaction => {
        const month = new Date(transaction.tanggal).toLocaleString('default', { month: 'long' });
        if (!groupedTransactions.has(month)) {
            groupedTransactions.set(month, []);
        }
        groupedTransactions.get(month).push(transaction);
    });
    return groupedTransactions;
}

const formatter = new Intl.NumberFormat('in-ID', {
    style: 'currency',
    currency: 'IDR',
})

function renderList() {
    transactions = getTransactions();

    if (body.classList.contains("home-page")) {
        const listtransaksi = document.getElementById("listtransaksi");
        const status = document.getElementById("status");

        listtransaksi.innerHTML = '';

        if (transactions.length === 0) {
            status.textContent = "Tidak ada transaksi.";
            return;
        }

        const recentTransactions = transactions.slice(Math.max(transactions.length - 5, 0));

        recentTransactions.slice().reverse().forEach(({ deskripsi, tanggal, jumlah, type }) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="deskripsi">
                    <h4>${deskripsi}</h4>
                    <p>${new Date(tanggal).toLocaleDateString()}</p>
                </div>   
                <div class="jumlah ${type}">
                    <span>${type === 'income' ? '+' : '-'} ${formatter.format(jumlah)}</span>
                </div>
            `;
            listtransaksi.appendChild(li);
        });

        status.textContent = '';
    } else if (body.classList.contains("history-page")) {
        renderHistoryPage();
    }
}

function renderHistoryPage() {
    const listtransaksi = document.getElementById("listtransaksi-history");
    const status = document.getElementById("status");
    const filterMonthDropdown = document.getElementById("filterMonthDropdownBtn");

    listtransaksi.innerHTML = '';
    filterMonthDropdown.innerHTML = 'Select Month';
    filterMonthDropdown.style.display = 'none';

    if (transactions.length === 0) {
        status.textContent = "Tidak ada transaksi.";
        return;
    }

    const groupedTransactions = groupTransactionsByMonth(transactions);

    for (const [month, transactionsInMonth] of groupedTransactions) {
        const monthHeader = document.createElement('h3');
        monthHeader.textContent = month;
        monthHeader.addEventListener('click', () => showTransactionsByMonth(month));
        listtransaksi.appendChild(monthHeader);
        filterMonthDropdown.style.display = 'block';

        transactionsInMonth.forEach(({ deskripsi, tanggal, jumlah, type }) => {
            if (selectedMonth === 0 || selectedMonth === new Date(tanggal).getMonth() + 1) {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="deskripsi">
                    <h4>${deskripsi}</h4>
                    <p>${new Date(tanggal).toLocaleDateString()}</p>
                </div>   
                <div class="jumlah ${type === 'income' ? 'income' : 'expense'}">
                    <span>${type === 'income' ? '+' : '-'} ${formatter.format(jumlah)}</span>
                </div>
            `;
            listtransaksi.appendChild(li);
            }
        });
     }

    if (transactions.length > 0) {
        const deleteAllButton = document.createElement('button');
        deleteAllButton.className = 'btn-delete-all';
        deleteAllButton.textContent = 'Delete All';
        deleteAllButton.addEventListener('click', deleteAllTransactions);
        listtransaksi.appendChild(deleteAllButton);
    }

    status.textContent = '';
}

let selectedMonth = 0;

// Update selected month saat di click
function showTransactionsByMonth(selectedMonth) {

    filterTransactionsByMonth({ value: selectedMonth });
    renderList();
}

function filterTransactionsByMonth(button) {
    selectedMonth = parseInt(button.value);
    renderList();
}

function deleteAllTransactions() {
    transactions = [];
    saveTransactions();
    renderList();
}

function updateModeText() {
    modeText.innerText = body.classList.contains("light") ? "Dark Mode" : "Light Mode";
}

document.addEventListener("DOMContentLoaded", function () {
    transactions = getTransactions();
    renderList();
    updateBalance();
    updateTotalBalanceWithWalletValues();
});

function updateBalance() {
    const totalBalanceElement = document.getElementById("balance");
    const incomeElement = document.getElementById("income");
    const expenseElement = document.getElementById("expense");

    const totalBalance = transactions.reduce((acc, transaction) => {
        return acc + (transaction.type === 'income' ? transaction.jumlah : -transaction.jumlah);
    }, 0);

    const income = transactions.filter(transaction => transaction.type === 'income')
        .reduce((acc, transaction) => acc + transaction.jumlah, 0);

    const expense = transactions.filter(transaction => transaction.type === 'expense')
        .reduce((acc, transaction) => acc + transaction.jumlah, 0);

    totalBalanceElement.textContent = ` ${formatter.format(totalBalance)}`;
    incomeElement.textContent = ` ${formatter.format(income)}`;
    expenseElement.textContent = ` ${formatter.format(expense)}`;
}

document.getElementById("transactionForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const deskripsi = document.getElementsByName("deskripsi")[0].value;
    const jumlah = parseFloat(document.getElementsByName("jumlah")[0].value);
    const tanggal = document.getElementsByName("tanggal")[0].value;
    const switcher = document.getElementById("switcher");

    const type = switcher.checked ? "expense" : "income";

    addTransaction(deskripsi, jumlah, tanggal, type);
    updateBalance();

    this.reset();
});

function updateTotalBalanceWithWalletValues() {
    transactions = getTransactions();

    const bcaValue = parseFloat(localStorage.getItem('bca-angka')) || 0;
    const gopayValue = parseFloat(localStorage.getItem('gopay-angka')) || 0;
    const danaValue = parseFloat(localStorage.getItem('dana-angka')) || 0;

    // Ngehitung total Wallet
    const totalWalletValue = bcaValue + gopayValue + danaValue;

    // Update Total Balance
    const totalBalanceElement = document.getElementById("balance");
    const totalBalance = transactions.reduce((acc, transaction) => {
        return acc + (transaction.type === 'income' ? transaction.jumlah : -transaction.jumlah);
    }, 0);

    const updatedTotalBalance = totalBalance + totalWalletValue;
    totalBalanceElement.textContent = ` ${formatter.format(updatedTotalBalance)}`;
}

//Bagian My Wallet Value Input nya
// BCA
function loadBcaValue() {
    let savedWalletValue = localStorage.getItem('bca-angka');
    if (savedWalletValue) {
        document.getElementById('bca-value').value = savedWalletValue;
    }
}
function saveBcaValue() {
    let walletValue = document.getElementById('bca-value').value;
    localStorage.setItem('bca-angka', walletValue);
}

loadBcaValue();

// GOPAY
function loadGopayValue() {
    let savedWalletValue = localStorage.getItem('gopay-angka');
    if (savedWalletValue) {
        document.getElementById('gopay-value').value = savedWalletValue;
    }
}
function saveGopayValue() {
    let walletValue = document.getElementById('gopay-value').value;
    localStorage.setItem('gopay-angka', walletValue);
}

loadGopayValue();

// DANA
function loadDanaValue() {
    let savedWalletValue = localStorage.getItem('dana-angka');
    if (savedWalletValue) {
        document.getElementById('dana-value').value = savedWalletValue;
    }
}
function saveDanaValue() {
    let walletValue = document.getElementById('dana-value').value;
    localStorage.setItem('dana-angka', walletValue);
}

loadDanaValue();

// Save Value Nominal Wallet
document.getElementById("addWalletForm").addEventListener("submit", function (event) {
    event.preventDefault();

    updateTotalBalanceWithWalletValues();
});
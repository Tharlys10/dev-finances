// controller modal
const modal = {
  open() {
    // add class action modal
    document
      .querySelector('.modal-overlay')
      .classList.add('active');
  },

  close() {
    // remove class action modal
    document
      .querySelector('.modal-overlay')
      .classList.remove('active');
  }
}

// storage
const storage = {
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
  },

  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  }
}

// controller transactions
const transaction = {
  all: storage.get(),

  add(item) {
    transaction.all.push(item);

    app.reload();
  },

  remove(index) {
    transaction.all.splice(index, 1);

    app.reload();
  },

  incomes() {
    // some inputs
    let income = 0;

    transaction.all.forEach((transaction) => {
      transaction.amount > 0
        ? income += transaction.amount
        : income = income
    })

    return Number(income);
  },

  expenses() {
    // some exits
    let expense = 0;

    transaction.all.forEach((transaction) => {
      transaction.amount < 0
        ? expense += transaction.amount
        : expense = expense
    })

    return Number(expense);
  },

  total() {
    // inputs - exits
    return Number(transaction.incomes()) + Number(transaction.expenses());
  }
}

// Document Object Model
const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');

    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);

    tr.dataset.index = index;

    DOM.transactionContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${transaction.amount > 0 ? 'income' : 'expense'}">
        ${utils.formatCurrency(transaction.amount)}
      </td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="transaction.remove(${index})" src="./assets/img/minus.svg" alt="Remover Transação">
      </td>
    `;

    return html;
  },

  updateBalances() {
    document.getElementById("income-display").innerHTML = utils.formatCurrency(transaction.incomes());

    document.getElementById("expense-display").innerHTML = utils.formatCurrency(transaction.expenses());

    document.querySelector(".total").style.backgroundColor = transaction.total() < 0 ? 'var(--red)' : 'var(--green)';

    document.getElementById("total-display").innerHTML = utils.formatCurrency(transaction.total());
  },

  clearTransactions() {
    DOM.transactionContainer.innerHTML = "";
  }
};

// utils
const utils = {
  formatAmount(value) {
    return Number(value.replace(/[\.\,]/g, ""));
  },

  formatDate(value) {
    const date = value.split("-");
    return `${date[2]}/${date[1]}/${date[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value;
  }
}

// form
const form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value
    };
  },

  formatValues() {
    let { description, amount, date } = form.getValues();

    amount = utils.formatAmount(amount);

    date = utils.formatDate(date);

    return {
      description,
      amount,
      date
    }
  },

  validateField() {
    const { description, amount, date } = form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  clearFields() {
    form.description.value = "";
    form.amount.value = "";
    form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      form.validateField();

      const payload = form.formatValues();
      // Save
      transaction.add(payload);
      form.clearFields();
      modal.close();
      app.reload();
    } catch (error) {
      alert(error.message)
    }
  }
}

// app
const app = {
  init() {
    transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalances(transaction.all);

    storage.set(transaction.all);
  },

  reload() {
    DOM.clearTransactions();

    app.init();
  }
}

app.init();


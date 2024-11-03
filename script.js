let balance = 10000; // Initial balance
let pin = '1234'; // Pre-set PIN for simplicity

function submitPin() {
    const pinInput = document.getElementById('pinInput').value;
    if (pinInput === pin) {
        document.getElementById('message').textContent = 'Choose an action:';
        document.getElementById('pinInput').style.display = 'none';
        document.querySelector('button[onclick="submitPin()"]').style.display = 'none';
        document.getElementById('actions').style.display = 'block';
    } else {
        document.getElementById('message').textContent = 'Incorrect PIN. Please try again.';
    }
}

function showAction(action) {
    document.getElementById('actions').style.display = 'none';
    const transactionDiv = document.getElementById('transaction');
    const transactionMessage = document.getElementById('transactionMessage');
    if (action === 'balance') {
        transactionMessage.textContent = `Your current balance is $${balance}`;
        transactionDiv.style.display = 'block';
    } else if (action === 'withdraw') {
        transactionMessage.textContent = 'Enter amount to withdraw:';
        transactionDiv.style.display = 'block';
    } else if (action === 'deposit') {
        transactionMessage.textContent = 'Enter amount to deposit:';
        transactionDiv.style.display = 'block';
    }
}

function performTransaction() {
    const amountInput = document.getElementById('amountInput').value;
    const action = document.getElementById('transactionMessage').textContent.includes('withdraw') ? 'withdraw' : 'deposit';
    if (amountInput > 0) {
        if (action === 'withdraw') {
            if (amountInput <= balance) {
                balance -= amountInput;
                alert(`You have withdrawn $${amountInput}. Your new balance is $${balance}.`);
            } else {
                alert('Insufficient balance.');
            }
        } else {
            balance += amountInput;
            alert(`You have deposited $${amountInput}. Your new balance is $${balance}.`);
        }
        cancelTransaction();
    } else {
        alert('Please enter a valid amount.');
    }
}

function cancelTransaction() {
    document.getElementById('transaction').style.display = 'none';
    document.getElementById('actions').style.display = 'block';
    document.getElementById('amountInput').value = '';
}

function logout() {
    document.getElementById('pinInput').style.display = 'block';
    document.querySelector('button[onclick="submitPin()"]').style.display = 'inline';
    document.getElementById('actions').style.display = 'none';
    document.getElementById('transaction').style.display = 'none';
    document.getElementById('message').textContent = 'Welcome! Please enter your PIN:';
}

'use strict';

// SWITCH TO LOGIN
btnSwitchMode.addEventListener('click', function () {
  registrationMode.classList.add('hidden');
  signMode.classList.remove('hidden');
});

// REGISTER
btnRegister.addEventListener('click', function (e) {
  e.preventDefault();
  let username = inputRegisterUsername.value.toLowerCase();
  let pin = inputRegisterPin.value;
  if (username && pin && pin.length === 4) {
    if (!checkForExistingUser(username)) {
      createUser(username, pin);
      registrationMode.classList.add('hidden');
      signMode.classList.remove('hidden');
    } else {
      showMessage(
        '🔴 User already exists!',
        'An account with the same owner was found.<br/>Either sign-in to your account or use another username',
        3
      );
    }
    inputRegisterUsername.value = '';
    inputRegisterPin.value = '';
  } else {
    showMessage('⚠️ Wrong inputs', 'Name or Pin is empty or Pin length is less than 4.', 3);
  }
});

// LOGIN ✅ (Updated: added checkPendingRequests after updateUI)
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  acceptanceRatio = 5;
  const now = new Date();
  currYear = now.getFullYear();
  currMonth = now.getMonth() + 1;
  currDay = now.getDate();
  currHour = now.getHours();
  currMinute = now.getMinutes();

  const usernameInput = inputLoginUsername.value.toLowerCase();
  const pinInput = inputLoginPin.value;
  checkUserSignIn(usernameInput, pinInput);
  if (activeUser) {
    signMode.classList.add('hidden');
    containerApp.classList.remove('hidden');
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    updateUI();
    checkPendingRequests(activeUser); // ✅ this line added
    startTimerCountDown();
  } else {
    showMessage('⛔ Wrong entries', "You've entered wrong user or wrong pin.", 3);
  }
});

// LOGOUT
btnLogout.addEventListener('click', function () {
  showMessage('🚶 Logged out', 'You were logged out of panel successfully.', 2);
  logoutAction(timer);
});

// TRANSFER ACTION
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const destinationAcc = inputTransferTo.value;
  const transferAmount = +inputTransferAmount.value;
  const clearInputs = () => {
    inputTransferAmount.value = '';
    inputTransferTo.value = '';
  };
  if (transferAmount <= 0) {
    showMessage(
      '⚠️ Invalid transfer value',
      'Entered transfer value should be more than zero.',
      3
    );
    clearInputs();
  } else if (sumUpTransactions(activeUser) - 10 < transferAmount) {
    showMessage(
      '💸 Transfer value exceeded the credit',
      'The amount you are trying to transfer exceeds your account credit',
      3
    );
  } else {
    const recipient = findByUsername(destinationAcc);
    if (recipient === activeUser) {
      showMessage('😑', 'Dude, did you just want to transfer money to yourself?!', 3);
    } else if (recipient) {
      creditTransfer(activeUser, recipient, transferAmount);
      updateUI(activeUser);
      clearInputs();
    } else {
      showMessage(
        '🙅 No such user!',
        'Specified user could not be found in the system',
        3
      );
    }
  }
});

// REQUEST ACTION
btnRequest.addEventListener('click', function (e) {
  e.preventDefault();
  const requestFrom = inputRequestFrom.value;
  const requestAmount = Math.floor(+inputRequestAmount.value);
  const contact = findByUsername(requestFrom);
  const clearInputs = () => {
    inputRequestFrom.value = '';
    inputRequestAmount.value = '';
  };

  if (contact && contact !== activeUser && requestAmount >= 10) {
    addPendingRequest(createNickname(activeUser.owner), createNickname(contact.owner), requestAmount);
    showMessage(
      '📨 Request sent!',
      `Your credit request was sent to ${contact.owner}. They will review it when they next log in.`,
      3
    );
    clearInputs();
  } else {
    showMessage(
      '🚫 Invalid request entries!',
      `Either ${requestFrom} was not found or request amount is less than 10.`,
      3
    );
    clearInputs();
  }
});

// LOAN ACTION
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanRequestAmount = Math.floor(+inputLoanAmount.value);
  if (!loanRequestAmount || loanRequestAmount <= 0) {
    showMessage('❗ Invalid loan amount', 'Enter a valid loan amount greater than 0.', 3);
    return;
  }

  if (!activeUser.loans) activeUser.loans = [];
  if (!activeUser.movementsDates) activeUser.movementsDates = [];

  const totalDeposits = sumUpDiff(activeUser, tr => tr > 0);
  const allowedLoanAmount = totalDeposits * 1.25;
  const permittedAmount = activeUser.loans.reduce((acc, curr) => acc - curr, allowedLoanAmount);

  if (isAllowedToGetLoan) {
    if (loanRequestAmount <= permittedAmount) {
      const timeToDeliver = genRandNum(10);
      inputLoanAmount.value = '';
      showMessage(
        '🎉 Congratulations!',
        'Your loan request was accepted.<br/>The requested amount will be transferred shortly.',
        2
      );
      isAllowedToGetLoan = false;

      setTimeout(() => {
        isAllowedToGetLoan = true;
      }, 60 * 1000);

      setTimeout(() => {
        activeUser.movements.push(loanRequestAmount);
        activeUser.movementsDates.push(submitDate());
        activeUser.loans.push(loanRequestAmount);
        updateUser(activeUser); // save loan change
        updateUI(activeUser);
      }, timeToDeliver * 1000);
    } else {
      showMessage(
        '📈 Loan quota exceeded!',
        'Requested amount exceeds permitted loan based on your deposits.',
        3
      );
      inputLoanAmount.value = '';
    }
  } else {
    showMessage(
      '⏰ Loan cooldown!',
      'Please wait before requesting another loan.',
      4
    );
  }
});

// SORT
btnSort.addEventListener('click', function () {
  const sorted = sortTransactions(activeUser);
  renderTransactions(!isSorted ? sorted : activeUser.movements);
  btnSort.classList.toggle('sorted');
  isSorted = !isSorted;
});

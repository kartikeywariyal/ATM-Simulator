'use strict';

// LocalStorage key for users
const LS_USERS_KEY = 'jsbank_users';
const LS_PENDING_REQUESTS_KEY = 'jsbank_pending_requests';

// Load users from localStorage or empty array
function loadUsers() {
  return JSON.parse(localStorage.getItem(LS_USERS_KEY)) || [];
}

// Save users array to localStorage
function saveUsers(users) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

// Show message
function showMessage(title, msg, duration) {
  messageBoard.classList.remove('hidden');
  messageBoard.style.zIndex = 999;
  labelMessageTitle.textContent = title;
  labelMessageContent.innerHTML = msg;
  setTimeout(() => messageBoard.classList.add('hidden'), duration * 1000);
}

// Random number and date utilities
const genRandNum = threshold => Math.floor(Math.random() * threshold) + 1;
const submitDate = (date = new Date()) => date.toISOString();
const dateTwoDigitsFormat = date => date.toString().padStart(2, '0');

// Format date and currency
const intlDate = (specDate, opt = {}) =>
  new Intl.DateTimeFormat(activeUser.locale, {
    year: opt.year || 'numeric',
    month: opt.month || 'long',
    day: opt.day || 'numeric',
    hour: opt.hour,
    minute: opt.minute,
  }).format(specDate);

const intlCurrency = value =>
  new Intl.NumberFormat(activeUser.locale, {
    style: 'currency',
    currency: activeUser.currency,
    useGrouping: true,
  }).format(value);

// Nickname utilities
const createNickname = fullName =>
  fullName
    .split(' ')
    .reduce((acc, curr) => acc + curr[0], '')
    .toLowerCase();

// Check if user exists
function checkForExistingUser(username) {
  const users = loadUsers();
  const lowered = username.toLowerCase();
  return users.some(
    acc =>
      createNickname(acc.owner) === lowered || acc.owner.toLowerCase() === lowered
  );
}

// Create new user
function createUser(username, pin) {
  const users = loadUsers();
  const newUser = {
    owner: username,
    movements: [100],
    movementsDates: [submitDate()],
    locale: navigator.language,
    currency: navigator.language === 'en-US' ? 'USD' : 'EUR',
    interestRate: 1,
    pin,
    loans: [],
  };
  users.push(newUser);
  saveUsers(users);
  showMessage(
    'Success!',
    `Your account was created with Username: <strong>${createNickname(newUser.owner).toUpperCase()}</strong><br/>You can now log in.`,
    8
  );
  return newUser;
}

// Find user
function findByUsername(input) {
  const users = loadUsers();
  const lowered = input.toLowerCase();
  return users.find(
    user =>
      createNickname(user.owner) === lowered || user.owner.toLowerCase() === lowered
  );
}

// Authenticate user
function checkUserSignIn(username, pin) {
  const users = loadUsers();
  activeUser = users.find(
    acc => createNickname(acc.owner) === username.toLowerCase() && acc.pin === pin
  );
}

// Update user in localStorage
function updateUser(user) {
  const users = loadUsers();
  const index = users.findIndex(
    acc => createNickname(acc.owner) === createNickname(user.owner)
  );
  if (index !== -1) {
    users[index] = user;
    saveUsers(users);
  }
}

// Balance and summaries
const calcAccountsBalance = accounts =>
  accounts.flatMap(acc => acc.movements).reduce((acc, curr) => acc + curr, 0);

const sumUpTransactions = user =>
  user.movements.reduce((acc, curr) => acc + curr, 0);

const sumUpDiff = (user, condition) =>
  user.movements.filter(condition).reduce((acc, curr) => acc + curr, 0);

function sumUpInterest(user) {
  return user.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * user.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
}

const sortTransactions = user => [...user.movements].sort((a, b) => a - b);

// Render transaction date
function renderDate(year, month, day) {
  const daysDiff = currDay - day;
  if (year === currYear && month === currMonth && daysDiff < 7) {
    switch (daysDiff) {
      case 0: return 'today';
      case 1: return 'yesterday';
      default: return `${daysDiff} days ago`;
    }
  } else return false;
}

// Render transactions
function renderTransactions(mov) {
  transactions.innerHTML = '';
  mov.forEach((element, idx) => {
    const trDate = new Date(
      activeUser.movementsDates[activeUser.movements.indexOf(element)]
    );
    const shownDate =
      renderDate(trDate.getFullYear(), trDate.getMonth() + 1, trDate.getDate()) ||
      intlDate(trDate, { year: 'numeric', month: 'numeric', day: 'numeric' });

    const transactionType = element > 0 ? 'deposit' : 'withdrawal';
    transactions.insertAdjacentHTML(
      'afterbegin',
      `<div class="movements__row ${idx % 2 === 0 ? 'odd-movement' : ''}">
        <div class="movements__type movements__type--${transactionType}">
          ${activeUser.movements.indexOf(element) + 1} ${transactionType}
        </div>
        <div class="movements__date">${shownDate}</div>
        <div class="movements__value">${intlCurrency(element)}</div>
      </div>`
    );
  });
}

// Render welcome
function renderWelcome(username) {
  if (5 < currHour && 10 >= currHour) return `Good morning, ${username}! 🌇`;
  else if (10 < currHour && 15 >= currHour) return `Good afternoon, ${username}! 🌞`;
  else if (15 < currHour && 20 >= currHour) return `Hey ${username}, good evening! 🌆`;
  else if (20 < currHour) return `Have a good night, ${username}! 🌃`;
  return `Hey there, night owl! 🦉`;
}

// Update UI
function updateUI(user = activeUser) {
  labelWelcome.textContent = renderWelcome(user.owner);
  labelDate.textContent = intlDate(new Date(), {
    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
  });
  labelBalance.textContent = intlCurrency(sumUpTransactions(user));
  renderTransactions(user.movements);
  labelSumIn.textContent = intlCurrency(sumUpDiff(user, tr => tr > 0));
  labelSumOut.textContent = intlCurrency(Math.abs(sumUpDiff(user, tr => tr < 0)));
  labelSumInterest.textContent = intlCurrency(sumUpInterest(user));
}

// Transfer logic
function creditTransfer(user, recipient, amount) {
  user.movements.push(-amount);
  user.movementsDates.push(submitDate());
  recipient.movements.push(amount);
  recipient.movementsDates.push(submitDate());
  updateUser(user);
  updateUser(recipient);
}

// Logout
function logoutAction(timer) {
  signMode.classList.remove('hidden');
  containerApp.classList.add('hidden');
  clearInterval(timer);
  activeUser = undefined;
}

// =====================
// Pending Requests Logic
// =====================

function loadPendingRequests() {
  return JSON.parse(localStorage.getItem(LS_PENDING_REQUESTS_KEY)) || [];
}

function savePendingRequests(requests) {
  localStorage.setItem(LS_PENDING_REQUESTS_KEY, JSON.stringify(requests));
}

function addPendingRequest(from, to, amount) {
  const requests = loadPendingRequests();
  requests.push({ from, to, amount, date: submitDate() });
  savePendingRequests(requests);
}

function checkPendingRequests(user) {
  const nickname = createNickname(user.owner);
  let requests = loadPendingRequests();
  const relevantRequests = requests.filter(req => req.to === nickname);

  if (relevantRequests.length === 0) return;

  let updated = false;
  relevantRequests.forEach(req => {
    const sender = findByUsername(req.from);
    if (!sender) return;

    const accept = confirm(
      `🤑 ${req.from} requested $${req.amount} from you.\nDo you accept this request?`
    );
    if (accept) {
      const balance = sumUpTransactions(user);
      if (balance >= req.amount + 10) {
        creditTransfer(user, sender, req.amount);
        showMessage('✅ Request approved!', `You sent $${req.amount} to ${req.from}.`, 3);
      } else {
        showMessage('⚠️ Insufficient balance', `You don't have enough funds to fulfill ${req.from}'s request.`, 4);
      }
    } else {
      showMessage('❌ Request rejected', `You rejected the request from ${req.from}.`, 2);
    }
    updated = true;
  });

  if (updated) {
    requests = requests.filter(req => req.to !== nickname);
    savePendingRequests(requests);
    updateUI(user);
  }
}

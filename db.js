// db.js - Simple localStorage database wrapper for users

const LS_USERS_KEY = 'jsbank_users';

const db = {
  // Get all users from localStorage
  getUsers() {
    const usersJSON = localStorage.getItem(LS_USERS_KEY);
    return usersJSON ? JSON.parse(usersJSON) : [];
  },

  // Save all users array to localStorage
  saveUsers(users) {
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  },

  // Add a new user
  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  },

  // Find a user by their username nickname
  findUserByNickname(nickname) {
    const users = this.getUsers();
    return users.find(u => this.createNickname(u.owner) === nickname);
  },

  // Update a user (replace by nickname)
  updateUser(updatedUser) {
    const users = this.getUsers();
    const idx = users.findIndex(u => this.createNickname(u.owner) === this.createNickname(updatedUser.owner));
    if (idx !== -1) {
      users[idx] = updatedUser;
      this.saveUsers(users);
    }
  },

  // Create nickname helper
  createNickname(fullName) {
    return fullName
      .split(' ')
      .reduce((acc, curr) => acc + curr[0], '')
      .toLowerCase();
  }
};

// Usage example (in your other JS files):
// const users = db.getUsers();
// db.addUser(newUser);
// const user = db.findUserByNickname('js');
// db.updateUser(user);


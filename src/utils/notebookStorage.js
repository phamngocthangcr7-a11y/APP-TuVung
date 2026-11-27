let activeAccount = null;
export const getNotebookAccount = () => activeAccount;
export const setNotebookAccount = id => { activeAccount = id; };
export const notebookKey = (key, account = activeAccount) => account ? `account:${account}:${key}` : key;

const notify = () => window.dispatchEvent(new Event("notebook-change"));

export const notebookStorage = {
  getItem: key => localStorage.getItem(notebookKey(key)),
  setItem: (key, value) => { localStorage.setItem(notebookKey(key), value); notify(); },
  removeItem: key => { localStorage.removeItem(notebookKey(key)); notify(); }
};

export function withGuestNotebook(read) {
  const previous = activeAccount;
  try {
    setNotebookAccount(null);
    return read();
  } finally {
    setNotebookAccount(previous);
  }
}


const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const loadButton = document.getElementById('load-btn');
const statusMessage = document.getElementById('status');
const notesList = document.getElementById('notes-list');

function setStatus(message, type = '') {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}

function renderNote(note) {
  const listItem = document.createElement('li');
  const title = document.createElement('h3');
  const body = document.createElement('p');

  title.textContent = note.title;
  body.textContent = note.body;

  listItem.append(title, body);
  return listItem;
}

async function loadNotes() {
  loadButton.disabled = true;
  setStatus('Loading notes...', 'loading');

  try {
    const response = await request(`${API_URL}?_limit=10`);
    const notes = await response.json();

    notesList.replaceChildren();

    if (notes.length === 0) {
      setStatus('No notes found.', 'empty');
      return;
    }

    const fragment = document.createDocumentFragment();

    notes.forEach((note) => {
      fragment.appendChild(renderNote(note));
    });

    notesList.appendChild(fragment);
    setStatus(`Loaded ${notes.length} notes from the server.`, 'success');
  } catch (error) {
    console.error('Could not load notes:', error);
    setStatus('Sorry, we could not load your notes. Please try again.', 'error');
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener('click', loadNotes);
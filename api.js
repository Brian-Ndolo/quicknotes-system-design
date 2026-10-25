const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const loadButton = document.getElementById('load-btn');
const statusMessage = document.getElementById('status');
const notesList = document.getElementById('notes-list');

const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const submitButton = document.getElementById('submit-btn');


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

// Create a note element safely.
function renderNote(note) {
  const listItem = document.createElement('li');
  const title = document.createElement('h3');
  const body = document.createElement('p');
  const deleteButton = document.createElement('button');

  title.textContent = note.title;
  body.textContent = note.body;

  deleteButton.textContent = 'Delete';
  deleteButton.type = 'button';
  deleteButton.className = 'delete-btn';

  listItem.dataset.noteId = note.id;

  deleteButton.addEventListener('click', () => {
    deleteNote(note.id, listItem, deleteButton);
  });

  listItem.append(title, body, deleteButton);

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
    setStatus(
      'Sorry, we could not load your notes. Please try again.',
      'error'
    );
  } finally {
    loadButton.disabled = false;
  }
}


async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus('Please enter a title for your note.', 'error');
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus('The title must be 100 characters or fewer.', 'error');
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  setStatus('Creating note...', 'loading');

  try {
    const response = await request(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1
      })
    });

    const newNote = await response.json();


    notesList.prepend(renderNote(newNote));

    setStatus(
      `Note created (status ${response.status}, id ${newNote.id}).`,
      'success'
    );

    noteForm.reset();
  } catch (error) {
    console.error('Could not create note:', error);
    setStatus(
      'Sorry, we could not create your note. Please try again.',
      'error'
    );
  } finally {
    submitButton.disabled = false;
  }
}


async function deleteNote(noteId, listItem, deleteButton) {
  deleteButton.disabled = true;
  setStatus('Deleting note...', 'loading');

  try {
    const response = await request(`${API_URL}/${noteId}`, {
      method: 'DELETE'
    });

    
    listItem.remove();

    if (notesList.children.length === 0) {
      setStatus('No notes left. Load notes to fetch them again.', 'empty');
    } else {
      setStatus(
        `Note ${noteId} deleted (status ${response.status}).`,
        'success'
      );
    }
  } catch (error) {
    console.error('Could not delete note:', error);
    setStatus(
      'Sorry, we could not delete this note. Please try again.',
      'error'
    );
    deleteButton.disabled = false;
  }
}

loadButton.addEventListener('click', loadNotes);
noteForm.addEventListener('submit', createNote);
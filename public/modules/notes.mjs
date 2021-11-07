const listeners = new Map();

/**
 * on adds elements to listeners
 * @param event
 * @param callback
 */
function on(event, callback) {
  listeners.set(event, callback);
}

/**
 * create creates a new note and informs other clients.
 */
function create() {
  const id = 'note_' + new Date().getTime();
  add(id);
  listeners.get('noteAdded')?.({ id });
}

/**
 * addNote creates a new sticky note and adds it to the document.
 * @param id 
 */
function add(id) {
  //Create note container
  let note = document.createElement('div');
  note.position = "absolute";
  note.cursor = "move";
  note.className = 'note';

  //Create text input for note title
  let titleInput = document.createElement('textarea');
  titleInput.placeholder = 'Title';
  titleInput.className = 'note-title';
  titleInput.onkeyup = () => listeners.get('noteTitleUpdated')?.({ id, title: titleInput.value });
  note.appendChild(titleInput);

  //Create text box for the content of the note
  let textBox = document.createElement('textarea');
  textBox.placeholder = 'Write your note here'
  textBox.className = 'note-content';
  textBox.onkeyup = () => listeners.get('noteTextUpdated')?.({ id, text: textBox.value });
  note.appendChild(textBox);

  //Create the option button for the note
  let optionButton = document.createElement('button');
  optionButton.className = 'option-button';
  optionButton.textContent = '. . .';
  optionButton.onclick = displayMenu;
  note.appendChild(optionButton);

  note.id = id;

  document.body.appendChild(note); //Add the note to the document

  titleInput.focus(); //Set focus to the title of the new note

}

/**
 * displayMenu creates the note options menu.
 */
function displayMenu() {
  let menus = document.getElementsByClassName('note-menu'); // Get all menus
  for (let i = 0; i < menus.length; i++) {
    menus[i].remove();
  }

  let noteMenu = document.createElement('div');
  noteMenu.className = "note-menu";

  let colors = [ // Nine different note colors
    'lightgoldenrodyellow',
    'lightblue',
    'lightgreen',
    'lightpink',
    'lightcoral',
    'lightskyblue',
    'lightsalmon',
    'plum',
    'lightseagreen'
  ];

  // Create nine different color buttons
  colors.forEach(color => {
    let colorOption = document.createElement('button');
    colorOption.className = "color-option";
    colorOption.style.backgroundColor = color;
    colorOption.onmousedown = () => {
      changeColor(this.parentNode.id, color);
      listeners.get('noteColorUpdated')?.({ id: this.parentNode.id, color });
    };
    noteMenu.appendChild(colorOption);
  });

  // Create a delete button
  let deleteButton = document.createElement('div');
  deleteButton.className = 'delete-note';
  deleteButton.onmousedown = () => _delete(this.parentNode.id);
  let deleteText = document.createElement('p');
  deleteText.textContent = 'Delete';
  deleteText.className = 'delete-text';
  deleteButton.appendChild(deleteText);
  let deleteIcon = document.createElement('img');
  deleteIcon.src = 'images/delete-24px-red.svg';
  deleteIcon.className = 'delete-icon';
  deleteButton.appendChild(deleteIcon);
  noteMenu.appendChild(deleteButton);

  this.parentNode.appendChild(noteMenu); // Add the menu to the note
}

/**
 * changeColor changes the color of the selected sticky note with a chosen color. 
 * @param id
 * @param color
 */
function changeColor(id, color) {
  let note = document.getElementById(id);
  note.style.backgroundColor = color;
  note.children[0].style.backgroundColor = color;
  note.children[1].style.backgroundColor = color;
}

/**
 * clearMenus clears all menus that the mouse is not hovering over. 
 */
function clearMenus() {
  let noteMenus = document.getElementsByClassName('note-menu'); // Get all menus
  for (let i = 0; i < noteMenus.length; i++) { // Loop through the menus
    noteMenus[i].remove();
  }
}

/**
 * delete deletes a note whose delete button was pressed.
 * @param id
 * @param notify
 */
function _delete(id, notify = true) {
  let note = document.getElementById(id);
  note.remove();
  if (notify) {
    listeners.get('noteDeleted')?.({ id: note.id });
  }
}

/**
 * deleteAll deletes all the notes.
 * @param notify
 */
function deleteAll(notify = true) {
  let notes = document.getElementsByClassName('note');
  while (notes.length > 0) {
    notes[0].remove();
  }
  if (notify) {
    listeners.get('notesDeleted')?.();
  }
}

/**
 * updateTitle Updates the title of the selected note
 * @param id
 * @param title
 */
function updateTitle(id, title) {
  document.getElementById(id).children[0].value = title;
}

/**
 * updateText Updates the text in the selected note.
 * @param id
 * @param text
 */
function updateText(id, text) {
  document.getElementById(id).children[1].value = text;
}

export { create, deleteAll, clearMenus, add, on, updateText, updateTitle, _delete, changeColor };

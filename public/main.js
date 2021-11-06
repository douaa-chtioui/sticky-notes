document.onmousedown = clearMenus; //Clear menus when the mouse is clicked to the side

const socket = io();

//broadcast the note add to all the users
socket.on('noteAdd', (note) => {
	console.log('note add');
	console.log(note.id );
	
	addNote(note.id);
});

/**
 * Create canvas and add onDrawListener 
 */
 
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

var lastX;
var lastY;
var currentX;
var currentY;
var drawing = false; 
var color = "#000";
var backgroundColor = "#d3d3d3"

function start(event) {
	console.log('start drawing');
	clearMenus(event);
	 if(event.offsetX!==undefined){
		  lastX = event.offsetX;
		  lastY = event.offsetY;
	 } else {
		  lastX = event.layerX - event.currentTarget.offsetLeft;
		  lastY = event.layerY - event.currentTarget.offsetTop;
	 }
	// begins new line
	ctx.beginPath();
	
	drawing = true;	
}

function stop(event) {
	drawing = false;
}

function draw(event) {
	if(drawing){
		// get current mouse position
		if(event.offsetX!==undefined){
		  currentX = event.offsetX;
		  currentY = event.offsetY;
		} else {
		  currentX = event.layerX - event.currentTarget.offsetLeft;
		  currentY = event.layerY - event.currentTarget.offsetTop;
		}

		socket.on('draw', (data) => {
			draw(data.lX, data.lY, data.cX, data.cY, data.color);	
		});

		draw(lastX, lastY, currentX, currentY, color);

		socket.emit('drawClick', { lX : lastX, lY : lastY, cX : currentX, cY : currentY, color : color})
		// set current coordinates to last one
	    lastX = currentX;
	    lastY = currentY;
	}

	function draw(lX, lY, cX, cY, color){
		console.log(color);
		// line from
		ctx.moveTo(lX,lY);
		// to
		ctx.lineTo(cX,cY);
		// color
		ctx.strokeStyle = color;
		ctx.lineWidth = 5;
		// draw it
		ctx.stroke();
	}

}

function drawInCanvas() {
	color = "#000";
	ctx.lineWidth = 5;
	canvas.addEventListener("mousedown", start);
	canvas.addEventListener("mousemove", draw);
	canvas.addEventListener("mouseup", stop);
}

function undoDraw() {
	color = backgroundColor;
	ctx.lineWidth = 10;
}

function clearDraw() {
	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext("2d");
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
}

/**
 * uploadImage 
 */
let imageInput = document.querySelector('#image_input');

function readFile(file) {                                                       
    var reader = new FileReader();
    reader.onload = readSuccess; 
		
    function readSuccess(evt) { 
		var uploadedImage = reader.result;
		console.log('value  uploadImage ' + uploadedImage );
        var field = document.createElement('div');   
		//field.style.background = "url($('reader.result'))";
		//console.log('value  field.style.background ' + field.style.background );
		
		var img = new Image();
        img.src = reader.result;
		field.appendChild(img);
		document.body.appendChild(field);

		
    };
    reader.readAsDataURL(file);                                              
} 

document.getElementById('image_input').onchange = function(e) {
    readFile(e.srcElement.files[0]);
};


/**
 * addNote creates a new sticky note and adds it to the document.
 */
function createNote(){
	const id = 'note_' + new Date().getTime();
	addNote(id);
	socket.emit('addNote',  { id : note.id});
}

function addNote(id){
    //Create note container
    let note = document.createElement('div');
	  note.position = "absolute";
	  note.cursor = "move";
    note.onmousedown = selectNote;
    note.ontouchstart = selectNote;
    note.className = 'note';

    //Create text input for note title
    let titleInput = document.createElement('textarea');
    titleInput.placeholder = 'Title';
    titleInput.className = 'note-title';
    titleInput.onkeydown = keyDown;
    note.appendChild(titleInput);

    //Create text box for the content of the note
    let textBox = document.createElement('textarea');
    textBox.placeholder = 'Write your note here'
    textBox.className = 'note-content';
    textBox.onkeydown = keyDown;
	  note.appendChild(textBox);
	
    //Create the option button for the note
    let optionButton = document.createElement('button');
    optionButton.className = 'option-button';
    optionButton.textContent = '. . .';
    optionButton.onmousedown = noteMenu;
    optionButton.ontouchstart = noteMenu;
    note.appendChild(optionButton);
	
    note.id = id;

    document.body.appendChild(note); //Add the note to the document

    titleInput.focus(); //Set focus to the title of the new note

}

/**
 * selectNote sets the selected note to the one the user clicks on.
 */
let selectedNote = null; //The note the user clicks on to move around

function selectNote() {
  selectedNote = this;
	
	//socket.emit('sticky-note', selectedNote);
	
	document.onmousemove = snapNote;
	document.ontouchmove = snapNoteTouch;
	document.onmouseup = placeNote;
	document.ontouchend = placeNote;
}

/**
 * snapNote snaps the selected note to the mouse position and swaps
 * notes when the user hovers the selected note over another note.
 * @param {MouseEvent} event 
 */
let noteCopy = {}; // A copy of the note that is what will actually be moved
let mouseDidMove = false; // Whether or not the mouse has moved enough to constitute moving the note
let currentSwap = null; // The note most recently swapped with the selected note

function snapNote(event) {
    if (selectedNote !== null) { // Check that there is a selected note

        let mouseMovement = Math.sqrt((event.movementX ** 2) + (event.movementY ** 2)); // The total distance the mouse moved

        if (!mouseDidMove && mouseMovement > 4) { // Check that the mouse has moved a reasonable distance

            console.log('Mouse moved');

            selectedNote.style.visibility = 'hidden'; // Hide the actual selected note

            currentSwap = selectedNote; 

            noteCopy = copyNote(selectedNote); // Make a copy of the selected note to move around
            noteCopy.style.position = 'fixed';
            
            document.body.appendChild(noteCopy); // Add the copy to the document

            //Snap the note to the mouse position
            noteCopy.style.top = (event.clientY - noteCopy.offsetHeight/2) + 'px';
            noteCopy.style.left = (event.clientX - noteCopy.offsetWidth/2) + 'px';

            mouseDidMove = true;

        } else if (mouseDidMove) {
            // Snap note to the mouse position
            noteCopy.style.top = (event.clientY - noteCopy.offsetHeight/2) + 'px';
            noteCopy.style.left = (event.clientX - noteCopy.offsetWidth/2) + 'px';

            let notes = document.getElementsByClassName('note'); // Get all the notes in the document

            for(let i = 0; i < notes.length; i++) { // Loop through the notes
                
                let rect = notes[i].getBoundingClientRect(); // Get the bounding rectangle to know the positon of the note

                // Swap the notes if appropriate
                if (currentSwap !== null && !noteCopy.id.includes(notes[i].id) && notes[i].id !== currentSwap.id) { // Make sure the note is a different note
                    if (event.clientX > rect.left && event.clientX < rect.right 
                        && event.clientY > rect.top && event.clientY < rect.bottom) { // Check if the mouse is over this note
                        if (notes[i].style.position !== 'fixed') { // Check if note is being animated
                            console.log('Selected: ' + noteCopy.id);
                            console.log('Swap with: ' + notes[i].id);

                            // Gather old notes positions for animating swap
                            let oldRects = new Map(); //Map for old note positions for animating
                            for (let i = 0; i < notes.length; i++) {
                                if (!notes[i].id.includes('copy')) {
                                    let oldRect = notes[i].getBoundingClientRect();
                                    oldRects.set(notes[i].id, oldRect);
                                }
                            }

                            currentSwap.style.visibility = 'visible'; // Make the old swap visible
                            checkOverflow(currentSwap.children[1]); // Resize the text box if necessary

                            swapNotes(selectedNote, currentSwap); //Undo previous swap
                            currentSwap = notes[i]; //Update currentSwap
                            swapNotes(selectedNote, currentSwap); //Perform new swap
                            
                            currentSwap.style.visibility = 'hidden'; //Hide the new swap

                            animateReorder(oldRects, 300);
                        }
                    }
                }
            }
        }
    }
}


/**
 * snapNoteTouch snaps the selected note to the touch position and swaps
 * notes when the user hovers the selected note over another note.
 * @param {TouchEvent} event 
 */
function snapNoteTouch(event) {
    if (selectNote !== null) {
        if (!mouseDidMove) { // Check that the mouse has moved a reasonable distance

            console.log('Mouse moved');

            selectedNote.style.visibility = 'hidden'; // Hide the actual selected note

            currentSwap = selectedNote; 

            noteCopy = copyNote(selectedNote); // Make a copy of the selected note to move around
            noteCopy.style.position = 'fixed';
            
            document.body.appendChild(noteCopy); // Add the copy to the document

            //Snap the note to the mouse position
            noteCopy.style.top = (event.touches[0].clientY - noteCopy.offsetHeight/2) + 'px';
            noteCopy.style.left = (event.touches[0].clientX - noteCopy.offsetWidth/2) + 'px';

            mouseDidMove = true;

        } else if (mouseDidMove) {
            // Snap note to the mouse position
            noteCopy.style.top = (event.touches[0].clientY - noteCopy.offsetHeight/2) + 'px';
            noteCopy.style.left = (event.touches[0].clientX - noteCopy.offsetWidth/2) + 'px';

            let notes = document.getElementsByClassName('note'); // Get all the notes in the document

            for(let i = 0; i < notes.length; i++) { // Loop through the notes
                
                let rect = notes[i].getBoundingClientRect(); // Get the bounding rectangle to know the positon of the note

                // Swap the notes if appropriate
                if (currentSwap !== null && !noteCopy.id.includes(notes[i].id) && notes[i].id !== currentSwap.id) { // Make sure the note is a different note
                    if (event.touches[0].clientX > rect.left && event.touches[0].clientX < rect.right 
                        && event.touches[0].clientY > rect.top && event.touches[0].clientY < rect.bottom) { // Check if the mouse is over this note
                        if (notes[i].style.position !== 'fixed') {
                            console.log('Selected: ' + noteCopy.id);
                            console.log('Swap with: ' + notes[i].id);

                            // Gather old notes positions for animating swap
                            let oldRects = new Map(); //Map for old note positions for animating
                            for (let i = 0; i < notes.length; i++) {
                                if (!notes[i].id.includes('copy')) {
                                    let oldRect = notes[i].getBoundingClientRect();
                                    oldRects.set(notes[i].id, oldRect);
                                }
                            }

                            currentSwap.style.visibility = 'visible'; // Make the old swap visible
                            checkOverflow(currentSwap.children[1]); // Resize the text box if necessary

                            swapNotes(selectedNote, currentSwap); //Undo previous swap
                            currentSwap = notes[i]; //Update currentSwap
                            swapNotes(selectedNote, currentSwap); //Perform new swap
                            
                            currentSwap.style.visibility = 'hidden'; //Hide the new swap

                            animateReorder(oldRects, 300);
                        }
                    }
                }
            }
        }
    }
}

function placeNote() {
    if (selectedNote !== null) { //Check if there is a note selected
        selectedNote.style.visibility = 'visible';
        checkOverflow(selectedNote.children[1]);
        selectedNote = null;
        
        if (mouseDidMove) {
			console.log('mouseDidMove');
            noteCopy.remove();
            mouseDidMove = false;
        }

        if (currentSwap !== null) {
			console.log('currentSwap !== null');
            currentSwap.style.visibility = 'visible';
            checkOverflow(currentSwap.children[1]);
            currentSwap = null;
        }
    }
}

/**
 * swapNotes swaps the content and appropriate properties of each note.
 * @param {HTMLDivElement} note1 The first note to swap
 * @param {HTMLDivElement} note2 The second note to swap
 */
function swapNotes(note1, note2) {
    //Save note1 values
    let title1 = note1.children[0].value;
    let content1 = note1.children[1].value;
    let id1 = note1.id
    let height1 = note1.children[1].style.height;
    let color1 = note1.style.backgroundColor;

    //Update note1 values
    note1.children[0].value = note2.children[0].value;
    note1.children[1].value = note2.children[1].value;
    note1.children[1].style.height = note2.children[1].style.height;
    note1.id = note2.id
    note1.style.backgroundColor = note2.style.backgroundColor;
    note1.children[0].style.backgroundColor = note2.style.backgroundColor;
    note1.children[1].style.backgroundColor = note2.style.backgroundColor;
    
    //Update note2 values
    note2.children[0].value = title1;
    note2.children[1].value = content1;
    note2.children[1].style.height = height1;
    note2.id = id1;
    note2.style.backgroundColor = color1;
    note2.children[0].style.backgroundColor = color1;
    note2.children[1].style.backgroundColor = color1;
}

/**
 * copyNote copies the content and appropriate properties of a note and returns the copy.
 * @param {HTMLDivElement} originalNote
 * @returns {HTMLDivElement} The copy of the original note
 */
function copyNote(originalNote) {
    let noteCopy = document.createElement('div');
    noteCopy.className = 'note';
    noteCopy.innerHTML = originalNote.innerHTML;
	//noteCopy.children[0].value = originalNote.children[0].value;
	//noteCopy.children[1].value = originalNote.children[1].value;
    noteCopy.id = originalNote.id + 'copy';
/*
    let color = originalNote.style.backgroundColor;

    noteCopy.style.backgroundColor = color;
    noteCopy.children[0].style.backgroundColor = color;
    noteCopy.children[1].style.backgroundColor = color;
*/
    noteCopy.style.animationName = 'none'; //Remove fade-in animation

    return noteCopy;
}

/**
 * Takes the old positions of elements and animates them to their new positions
 * @param {Map} oldRects dictionary of note id's and their rects
 * @param {number} duration
 */
function animateReorder(oldRects, duration) {
    console.log(oldRects);
    let notes = document.getElementsByClassName('note'); // Get all the notes
    let newRects = new Map(); // Initialize array for collecting new positions

    // Collect the new positions
    for (let i = 0; i < notes.length; i++) {
        let newRect = notes[i].getBoundingClientRect();
        newRects.set(notes[i].id, newRect);
    }


    // Set initial positions
    let offsetX = parseFloat(window.getComputedStyle(notes[0]).marginLeft);
    let offsetY = parseFloat(window.getComputedStyle(notes[0]).marginTop);
    let width = parseFloat(window.getComputedStyle(notes[0]).width);
    for (let i = 0; i < notes.length; i++) {
        if (oldRects.has(notes[i].id) && newRects.has(notes[i].id)) {

            notes[i].style.position = 'fixed';
            notes[i].style.left = (oldRects.get(notes[i].id).left - offsetX) + 'px';
            notes[i].style.top = (oldRects.get(notes[i].id).top - offsetY) + 'px';
            notes[i].style.width = width + 'px';
        }
    }

    let timePassed = 0; // Time passed since animation began, in ms
    let lastFrame = Date.now(); //The timestamp of the previous frame


    // This function animates a single frame of the animation and then passed itself to `requestAnimationFrame`.
    function animateFrame() {
        
        let deltaT = Date.now() - lastFrame; // Time difference between now and the last frame
        timePassed += deltaT;
        lastFrame = Date.now();

        // Update the positions of the notes
        for (let i = 0; i < notes.length; i++) {
            if (oldRects.has(notes[i].id) && newRects.has(notes[i].id)) {
                let deltaX = (newRects.get(notes[i].id).left - oldRects.get(notes[i].id).left) * deltaT / duration;
                let deltaY = (newRects.get(notes[i].id).top - oldRects.get(notes[i].id).top) * deltaT / duration;

                notes[i].style.left = (parseFloat(notes[i].style.left) + deltaX) + 'px';
                notes[i].style.top = (parseFloat(notes[i].style.top) + deltaY) + 'px';
            }
        }

        // Check if the proper amount of time has passed
        if (timePassed < duration) {
            requestAnimationFrame(animateFrame);
        } else {
            for (let i = 0; i < notes.length; i++) {
                if (oldRects.has(notes[i].id) && newRects.has(notes[i].id)) {
                    notes[i].style.position = 'relative';
                    notes[i].style.left = '0px';
                    notes[i].style.top = '0px';
                    notes[i].style.width = "";
                }
            }
        }
    }

    animateFrame();

}

/**
 * keyDown checks the overflow of note text boxes when a key is pressed.
 */
function keyDown() {
    checkOverflow(this);
}

/**
 * checkOverflow checks if a note text box needs to be resized to fit its text.
 * @param {HTMLTextAreaElement} textBox 
 */
function checkOverflow(textBox) {
    textBox.style.height = "";
    while (textBox.scrollHeight > textBox.clientHeight) {
        textBox.style.height = (textBox.clientHeight + 2) +'px';
    }
}

/**
 * noteMenu creates the note options menu.
 */
function noteMenu() {
    console.log('option button pressed');

    let menus = document.getElementsByClassName('note-menu'); // Get all menus
    let thisNoteHasMenu = (this.parentNode.getElementsByClassName('note-menu').length != 0); //Whether this particular note has an active menu

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
        colorOption.onmousedown = setColor;
        colorOption.ontouchstart = setColor;
        noteMenu.appendChild(colorOption);
    });

    // Create a delete button
    let deleteButton = document.createElement('div');
    deleteButton.className = 'delete-note';
    deleteButton.onmousedown = (() => {setTimeout(deleteNote.bind(deleteButton), 155);}); //Add a delay to let user see button press
    let deleteText = document.createElement('p');
    deleteText.textContent = 'Delete';
    deleteText.className = 'delete-text';
    deleteButton.appendChild(deleteText);
    let deleteIcon = document.createElement('img');
    deleteIcon.src = 'images/delete-24px-red.svg';
    deleteIcon.className = 'delete-icon';
    deleteButton.appendChild(deleteIcon);
    noteMenu.appendChild(deleteButton);

    selectedNote.appendChild(noteMenu); // Add the menu to the note
}

/**
 * setColor sets the color of a note to the color of the button pressed.
 */
function setColor() {
    console.log('color button pressed');

    let note = this.parentNode.parentNode;
    let newColor = this.style.backgroundColor;
    
    note.style.backgroundColor = newColor;
    note.children[0].style.backgroundColor = newColor;
    note.children[1].style.backgroundColor = newColor;
}

/**
 * clearMenus clears all menus that the mouse is not hovering over.
 * @param {MouseEvent} event 
 */
function clearMenus(event) {

    let noteMenus = document.getElementsByClassName('note-menu'); // Get all menus
    for (let i = 0; i < noteMenus.length; i++){ // Loop through the menus
        let rect = noteMenus[i].getBoundingClientRect(); // Get the bounding rectangle to know the position
        
        // If the mouse is not above the menu, then remove it
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
			if (noteMenus[i].id == 'active') { //Remove the note only on a second click to account for clicking the option button
			   noteMenus[i].remove();
            } else {
                noteMenus[i].id = 'active';
            }
        }
    }
}

/**
 * deleteNote deletes a note whose delete button was pressed and initiates the reordering animation.
 */
function deleteNote() {
	
    let thisNote = this.parentNode.parentNode;

    let notes = document.getElementsByClassName('note');
    let oldRects = new Map(); // Initialize an array for the old note positions
    
    // Collect all the current note positions
    for (let i = 0; i < notes.length; i++) {
        let rect = notes[i].getBoundingClientRect();
        oldRects.set(notes[i].id, rect);
    }

    thisNote.remove();

    animateReorder(oldRects, 300); // Using the old positions, animate the reording of the notes over the specified time
}

/**
 * deleteNote clear the canvas from all the notes
 */
function deleteNotes() {
    let notes = document.getElementsByClassName('note');
    
    // Collect all the current note positions
    while(notes.length > 0){
      notes[0].remove();
	}
}

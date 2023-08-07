//Establishing more convenient calls for often-called elements
let outputCols = document.getElementsByClassName("outputCol");
let coreDice = document.getElementById("coreDice");
let dicePool = document.getElementById("dicePool");
let diceRoller = document.getElementById("diceRoller");
let characterName = document.getElementById("characterName");
let statBricksHeader = document.getElementById("statBricksHeader");
let trackersHeader = document.getElementById("trackersHeader");
let abilitiesHeader = document.getElementById("abilitiesHeader");

const brickClasses = ["brickName", "brickMod", "brickStat", "statSave1", "statSaveMod1", "statSave2", "statSaveMod2", "statSave3", "statSaveMod3", "statSave4", "statSaveMod4"]
const trackerClasses = ["trackerName", "trackerMax"]
const abilityClasses = ["abilityName", "diceRoll1", "diceVal1", "diceRoll2", "diceVal2", "flavText"]

function download(filename, text) {//Downloads the parameters as a file
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function handleFileSelect(event) {//Reads an uploaded file and gives it to the upload() function
	const reader = new FileReader()
	reader.onload = upload;
	reader.readAsText(event.target.files[0])
}

function setInnerHtmlById(id, innerHtml) {
	document.getElementById(id).innerHTML = innerHtml;
}

function setValueById(id, value) {
	document.getElementById(id).value = value;
}

function upload(event) {//Parses an uploaded file, as in handleFileSelect
	let json = JSON.parse(event.target.result);

	setInnerHtmlById('statBricksHeader', json.statBricksHeader)
	setInnerHtmlById('trackersHeader', json.trackersHeader)
	setInnerHtmlById('abilitiesHeader', json.abilitiesHeader)
	setValueById('coreDice', json.coreDice)
	if (json.dicePool) {
		dicePool.checked = true;
	}

	setInnerHtmlById('statBricks', "")
	setInnerHtmlById('trackers', "")
	setInnerHtmlById('abilities', "")

	Object.keys(json.statBricks).forEach(function (key) {
		addStatBrick(json.statBricks[key]);
	})

	Object.keys(json.trackers).forEach(function (key) {
		addTracker(json.trackers[key]);
	})

	Object.keys(json.abilities).forEach(function (key) {
		addAbility(json.abilities[key]);
	})
}

function generateJson() {//Copies all data on the character sheet to a JSON format that can be saved by the save functions and thus read by the upload functions.
	let output = {
		"coreDice": coreDice.value,
		"dicePool": dicePool.checked,
		"statBricksHeader": statBricksHeader.innerHTML,
		"trackersHeader": trackersHeader.innerHTML,
		"abilitiesHeader": abilitiesHeader.innerHTML,
		"statBricks": {},
		"trackers": {},
		"abilities": {}
	};

	let statBricks = document.querySelectorAll('#statBricks > *');
	console.log(statBricks.length);
	for (let index = 0; index < statBricks.length; index++) {
		const brick = statBricks[index];
		output["statBricks"][index] = {};
		brickClasses.forEach(brickClass => {
			console.log(brick.getElementsByClassName(brickClass));
			output["statBricks"][index][brickClass] = brick.getElementsByClassName(brickClass)[0].innerHTML;
		});
	};

	let trackers = document.querySelectorAll('#trackers > *');
	for (let index = 0; index < trackers.length; index++) {
		const tracker = trackers[index];
		output["trackers"][index] = {};
		trackerClasses.forEach(trackerClass => {
			output["trackers"][index][trackerClass] = tracker.getElementsByClassName(trackerClass)[0].value || tracker.getElementsByClassName(trackerClass)[0].innerHTML;
		});
	};

	let abilities = document.querySelectorAll('#abilities > *');
	for (let index = 0; index < abilities.length; index++) {
		const ability = abilities[index];
		output["abilities"][index] = {};
		abilityClasses.forEach(abilityClass => {
			output["abilities"][index][abilityClass] = ability.getElementsByClassName(abilityClass)[0].value || ability.getElementsByClassName(abilityClass)[0].innerHTML;
		});
	};

	return JSON.stringify(output);
}

window.calculateDice = function (mod) {//Whenever you trigger a dice roll in the roller, this does the maths!
	let value = diceRoller.value;
	let resultsOutput = document.getElementById("diceResults");

	if (value.match(/^[+\-0-9dD]+$/g) == null) {

		resultsOutput.innerHTML = `Invalid Input`;
		return null;
	}

	let dice = value.match(/([\+\-]*[0-9dD]+)/g);
	let results = [];
	let total = 0;
	dice.forEach((die) => {
		let ints = die.toLowerCase().split("d");
		let sign = ints[0] === "+" || ints[0] >= 0 ? 1 : -1;
		let diceCount = ["", "+", "-"].includes(ints[0])
			? 1
			: Math.abs(ints[0]);
		let diceSize = ints[1];

		results.push([]);
		if (diceSize) {
			for (let index = 1; index <= diceCount; index++) {
				let diceValue = Math.ceil(Math.random() * diceSize);
				total += diceValue * sign;
				results.at(-1).push(diceValue * sign);
			}
		} else {
			total += diceCount * sign;
			results.at(-1).push(diceCount * sign);
		}
	});
	resultsOutput.innerHTML = "";
	results.forEach((batch) => {
		batch.forEach((roll) => {
			resultsOutput.innerHTML += (roll < 0 ? " " : " +") + roll;
		});
		resultsOutput.innerHTML += "<br />";
	});
	resultsOutput.innerHTML += "= " + total;
}

window.skillRoll = function (mod) {//Brings up the dice roller and sets up a core die roll (usually with a relevant modifier)
	if (dicePool.checked) {
		let dice = coreDice.value.toLowerCase().split("d");
		diceRoller.value =
			mod.innerHTML.trim() * (dice[0] || 1) + "d" + dice[1];
	} else {
		diceRoller.value = coreDice.value + mod.innerHTML.trim();
	}
	calculateDice();
};


function addStatBrick(json = {}) {//Adds a stat brick. Takes JSON info as part of loading, but can also generate a blank one.
	let html = `
	<div>
		<button class="bd-highlight form-control btn-danger" onclick="this.parentNode.remove()"><i class="fa-solid fa-x"></i></button>
		<div class="d-flex justify-content-between bd-highlight">
			<div class="my-2 px-5 bd-highlight box">
				<h6 class="brickName mt-3" contenteditable="true" >${json.brickName || "Name"}</h6>
				<h2 class="brickMod" contenteditable="true" class="my-4">${json.brickMod || "+0"}</h2>
					<button onclick="skillRoll(this.previousElementSibling)" data-toggle="modal" class="btn" data-target="#diceModal"> <i class="fa-solid fa-dice-d20" title="Click to roll"></i> </button>
				<p class="brickStat" contenteditable="true">${json.brickStat || "10"}</p>
				<br />
			</div>
			<div class="m-3 p-2 bd-highlight box">
				<h6>
					<span class="statSave1" contenteditable="true">${json.statSave1 || "Stat Save"}</span> <span class="statSaveMod1" contenteditable="true">${json.statSaveMod1 || "+0"}</span>
					<button onclick="skillRoll(this.previousElementSibling)" data-toggle="modal" class="btn" data-target="#diceModal"><i class="fa-solid fa-dice-d20" title="Click to roll"></i></button>
				</h6>
				<h6>
					<span class="statSave2" contenteditable="true">${json.statSave2 || "Skill #1"}</span> <span class="statSaveMod2" contenteditable="true">${json.statSaveMod2 || "+0"}</span>
					<button onclick="skillRoll(this.previousElementSibling)" data-toggle="modal" class="btn" data-target="#diceModal"> <i class="fa-solid fa-dice-d20" title="Click to roll"></i> </button>
				</h6>
				<h6>
					<span class="statSave3" contenteditable="true">${json.statSave3 || "Skill #2"}</span> <span class="statSaveMod3" contenteditable="true">${json.statSaveMod3 || "+0"}</span>
					<button onclick="skillRoll(this.previousElementSibling)" data-toggle="modal" class="btn" data-target="#diceModal"> <i class="fa-solid fa-dice-d20" title="Click to roll"></i> </button>
				</h6>
				<h6>
					<span class="statSave4" contenteditable="true">${json.statSave4 || "Skill #3"}</span> <span class="statSaveMod4" contenteditable="true">${json.statSaveMod4 || "+0"}</span>
					<button onclick="skillRoll(this.previousElementSibling)" data-toggle="modal" class="btn" data-target="#diceModal"> <i class="fa-solid fa-dice-d20" title="Click to roll"></i> </button>
				</h6>
			</div>
		</div>
	</div>
	`;
	$('#statBricks').append(html);
}

function addTracker(json = {}) {//Adds a tracker. Takes JSON info as part of loading, but can also generate a blank one.
	let html = `
	<div>
		<button class="bd-highlight form-control btn-danger ml-1 mb-1" onclick="this.parentNode.remove()"><i class="fa-solid fa-x"></i></button>
		<div class="d-flex bd-highlight mb-4">
			<div class="bd-highlight tracker row m-1 box">
				<div class="col-6">
					<h6 class="mt-3 trackerName" contenteditable="true" > ${json.trackerName || "Name"}</h6>
					<div class="p-2">
						<input class="form-control" type="number" style="width:100%; font-size:4vh"></input>
						<p>Current</p>
					</div>
					<br />
					</div>
				<div class="col-6">
					<input class="mt-5 trackerMax form-control" type="number" style="width:100%; font-size:3vh" value="${json.trackerMax || "10"}"></input>
					<p>Max / Default</p>
					<br />
				</div>
			</div>
		</div>
	</div>
	`;
	$('#trackers').append(html);
}

function addAbility(json = {}) {//Adds an ability box. Takes JSON info as part of loading, but can also generate a blank one.
	let html = `
	<div>
		<button class="mb-2 bd-highlight form-control btn-danger" onclick="this.parentNode.remove()"><i class="fa-solid fa-x"></i></button>
		<div class="p-2 mb-4 box">
			<span class="abilityName" contentEditable="true">${json.abilityName || "Ability name"}</span>
			<div class="row">
				<div class="col-6">
					<span class="diceRoll1" contentEditable="true">${json.diceRoll1 || "Roll 1"}</span>
					<input class="diceVal1" placeholder="1d20+3" style="width: 100%;" value="${json.diceVal1 || ""}"></input>
					<button data-toggle="modal" class="btn" data-target="#diceModal" onclick="diceRoller.value=this.previousElementSibling.value; calculateDice();"><i class="fa-solid fa-dice-d20" title="Click to roll"></i></button>
				</div>
				<div class="col-6">
				<span class="diceRoll2" contentEditable="true">${json.diceRoll2 || "Roll 2"}</span>
					<input class="diceVal2" placeholder="2d6+6" style="width: 100%;" value="${json.diceVal2 || ""}"></input>
					<button data-toggle="modal" class="btn" data-target="#diceModal" onclick="diceRoller.value=this.previousElementSibling.value; calculateDice()"><i class="fa-solid fa-dice-d20" title="Click to roll"></i></button>
				</div>
			</div>
			<div class="mt-2">
				<span>Notes </span>
				<textarea class="flavText" class="span6" rows="1" placeholder="Flavour text/notes go here!" value="${json.flavText || ""}"></textarea>
			</div>
		</div>
	</div>
	`;
	$('#abilities').append(html);
}


function addToCol(column) {//Based on a button press to add a new item, determines which kind of item to add.
	let output = column.getElementsByTagName("div")[0];
	switch (output.id) {
		case "statBricks":
			addStatBrick();
			break;
		case "trackers":
			addTracker();
			break;
		case "abilities":
			addAbility();
			break;
	}
}

function initialize() {//Runs on startup, initialising the page.
	$('[data-toggle="popover"]').popover();

	document//Adds an event listener for someone confirming a dice roll.
		.getElementById("diceRollerConfirm")
		.addEventListener("click", (event) => {
			calculateDice();
		});

	document//Adds an event listener for saving a character sheet.
		.getElementById("saveSheet")
		.addEventListener("click", (event) => {
			download(characterName.innerHTML + ".json", generateJson());
		});

	document.getElementById('file').addEventListener('change', handleFileSelect, false);//Adds an event listener for uploading a saved character sheet.

	for (let outputCol of outputCols) {//Iterates through the columns, adding an event listener for the button to add an item.
		let button = outputCol.getElementsByClassName("add")[0];

		button.addEventListener("click", (event) => {
			addToCol(outputCol);
		});
	}
}

initialize();
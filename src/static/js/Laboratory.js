// Game State (Dieser Teil bleibt global, da er den Zustand aller Rätsel verwaltet)
const gameState = {
    player: null, // Könnte 'Detective' oder 'Player' sein für ein Solo-Spiel
    roomId: null, // Wird für Solo-Spiel nicht aktiv genutzt, aber behalten
    playerName: null,
    inventory: [], // Wenn es Inventar-Items aus Rätseln gibt
    progress: 0,
    currentStage: 1,
    stages: [
        {
            name: "Chalkboard Riddle",
            player1Goal: "Solve the chalkboard riddle to find a hidden compartment.",
            player1Hint: "Think about things that consume and change what they touch.",
            completed: false,
            triggers: {
                chalkboardSolved: false,
                compartmentOpened: false
            }
        },
        {
            name: "Blood-stained Table Riddle",
            player1Goal: "Solve the blood-stained table riddle to reveal a computer terminal.",
            player1Hint: "What common device has keys but no physical locks, and space but no room to walk around?",
            completed: false,
            triggers: {
                tableSolved: false,
                terminalAccessed: false
            }
        },
        {
            name: "Computer Terminal Puzzle",
            player1Goal: "Access the 'Eternalis' data on the computer terminal.",
            player1Hint: "The 'Infinite Loop' refers to a common programming concept.",
            completed: false,
            triggers: {
                eternalisAccessed: false
            }
        }
    ],
    combinedItems: {} // Nicht verwendet in dieser spezifischen Umsetzung
};

// DOM elements (Nur die Rätsel-spezifischen Elemente)
const chalkboard = document.getElementById('chalkboard');
const chalkboardInput = document.getElementById('chalkboard-input');
const chalkboardSubmit = document.getElementById('chalkboard-submit');
const chalkboardCompartment = document.getElementById('chalkboard-compartment');

const bloodStainedTable = document.getElementById('blood-stained-table');
const tableInput = document.getElementById('table-input');
const tableSubmit = document.getElementById('table-submit');

const computerTerminal = document.getElementById('computer-terminal');
const terminalText = document.getElementById('terminal-text'); // Wenn der Terminaltext dynamisch geändert werden soll

// Hilfsfunktionen (Diese Funktionen würden im vollen Skript auch verwendet)
const successSound = new Audio('graphics/success.mp3'); // Sound für gelöste Rätsel

function addMessage(text) { // Vereinfacht für dieses Snippet
    console.log("Chat Message:", text); // Oder füge es einem simulierten Chat-Bereich hinzu
    // In einer echten Anwendung: messages.appendChild(message); messages.scrollTop = messages.scrollHeight;
}

function updateProgress() {
    // In einer echten Anwendung: gameProgress.style.width = `${progressPercent}%`;
    console.log("Progress updated to stage:", gameState.currentStage);
}

// Initialisiere die Stage (passt die Sichtbarkeit der Rätsel an)
function initializeStage(stageNumber) {
    const stage = gameState.stages[stageNumber - 1];
    gameState.currentStage = stageNumber;
    console.log("Current Objective:", stage.player1Goal); // Simuliert die Anzeige des Hinweises

    // Setze die Sichtbarkeit der Rätsel basierend auf der aktuellen Stufe
    chalkboard.style.display = 'none';
    bloodStainedTable.style.display = 'none';
    computerTerminal.style.display = 'none';

    if (stageNumber === 1) {
        chalkboard.style.display = 'flex'; // Flex, da es interne Elemente hat
        chalkboardCompartment.style.display = 'none'; // Immer zuerst verstecken
        chalkboard.classList.remove('solved');
    } else if (stageNumber === 2) {
        chalkboard.style.display = 'flex'; // Chalkboard bleibt sichtbar
        bloodStainedTable.style.display = 'flex';
    } else if (stageNumber === 3) {
        chalkboard.style.display = 'flex';
        bloodStainedTable.style.display = 'flex';
        computerTerminal.style.display = 'flex';
    }
    updateProgress();
}

// Überprüfe den Fortschritt der aktuellen Stufe
function checkStageCompletion() {
    const currentStage = gameState.stages[gameState.currentStage - 1];

    let allComplete = true;
    for (const trigger in currentStage.triggers) {
        if (!currentStage.triggers[trigger]) {
            allComplete = false;
            break;
        }
    }

    if (allComplete) {
        currentStage.completed = true;
        successSound.play();
        addMessage(`System: Stage ${gameState.currentStage} completed!`);
        advanceToNextStage();
    }
}

// Gehe zur nächsten Stufe
function advanceToNextStage() {
    if (gameState.currentStage < gameState.stages.length) {
        gameState.currentStage++;
        initializeStage(gameState.currentStage);
        addMessage(`System: Welcome to Stage ${gameState.currentStage}!`);
    } else {
        addMessage("System: Congratulations! You've successfully escaped Detective B's Laboratory!");
        // Hier könnte eine Funktion für den Spielende-Bildschirm aufgerufen werden
        console.log("Game Finished!");
    }
    updateProgress();
}

function addInventoryItem(id, name) {
    if (gameState.inventory.includes(id)) return;
    gameState.inventory.push(id);
    addMessage(`System: Item collected: ${name}`);
    console.log("Inventory:", gameState.inventory);
}


// Event Listener für Rätsel-Interaktionen
document.addEventListener('DOMContentLoaded', () => {
    // Initialisiere die erste Stufe beim Laden des Dokuments (wenn der Laborraum aktiv wäre)
    // Dies würde im Kontext des gesamten Spiels passieren, wenn man den Raum betritt.
    // Für dieses Snippet simulieren wir es hier:
    initializeStage(1);
    addMessage("Detective B's Laboratory: You are in the lab. Find the clues!");
});


chalkboardSubmit.addEventListener('click', () => {
    const answer = chalkboardInput.value.trim().toLowerCase();
    if (answer === 'fire') {
        addMessage(`System: The chalkboard riddle is solved! A latch clicks.`);
        chalkboardCompartment.style.display = 'flex'; // Zeige das versteckte Fach
        chalkboard.classList.add('solved');
        gameState.stages[0].triggers.chalkboardSolved = true;
        checkStageCompletion();
    } else {
        addMessage(`System: That's not the answer... Keep thinking.`);
    }
});

chalkboardCompartment.addEventListener('click', () => {
    if (gameState.stages[0].triggers.chalkboardSolved) {
        addMessage(`System: You found a small key inside the compartment!`);
        addInventoryItem('small_key', 'Small Key');
        chalkboardCompartment.style.display = 'none'; // Verstecke es nach dem Öffnen
        gameState.stages[0].triggers.compartmentOpened = true;
        checkStageCompletion();
    }
});

tableSubmit.addEventListener('click', () => {
    const answer = tableInput.value.trim().toLowerCase();
    if (answer === 'keyboard') {
        addMessage(`System: The table riddle is solved! The blood-stains shimmer and reveal a hidden computer terminal.`);
        computerTerminal.style.display = 'flex';
        gameState.stages[1].triggers.tableSolved = true;
        checkStageCompletion();
    } else {
        addMessage(`System: Incorrect. The answer is closer than you think...`);
    }
});

computerTerminal.addEventListener('click', () => {
    // Dieser Klick agiert als "Zugriff" auf das Terminal
    if (gameState.currentStage === 3) {
        addMessage(`System: You are now viewing data on "Eternalis". Analyze the text for clues.`);
        gameState.stages[2].triggers.terminalAccessed = true; // Trigger für den Zugriff auf das Terminal
        // Die endgültige Lösung des Terminal-Rätsels würde durch eine Benutzereingabe (z.B. im Chat) erfolgen
        // oder durch Interaktion mit anderen Elementen.
    }
});

// Simulierter Chat-Input für die letzte Rätsellösung
// (Dieser Listener würde normalerweise zum allgemeinen Chat-Formular gehören)
// Für dieses Snippet angenommen, du hast ein Input-Feld, das dies auslöst
// Wenn du keine UI dafür hast, müsstest du diese Lösung direkt in JS triggern oder über die Konsole testen.
// Beispiel: Du gibst "infinite loop" in einen Text-Input ein.
document.body.addEventListener('keypress', (e) => { // Eine einfache Simulation
    if (gameState.currentStage === 3 && e.key === 'Enter') {
        const simulatedChatInput = prompt("What's the key to activate Eternalis?");
        if (simulatedChatInput && simulatedChatInput.toLowerCase().includes('infinite loop')) {
            addMessage(`System: Correct! The 'Infinite Loop' is the key. The final data on Eternalis is now unlocked! You find the blueprint for escaping the lab!`);
            gameState.stages[2].triggers.eternalisAccessed = true;
            checkStageCompletion();
        } else if (simulatedChatInput) {
            addMessage(`System: That's not the correct activation phrase.`);
        }
    }
});
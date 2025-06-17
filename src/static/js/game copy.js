// game.js

// Ensure all logic runs after DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {

    // Simplified Game State for Riddle Logic
    const gameState = {
        player: null,
        roomId: null,
        playerName: null,
        partnerName: null,

        riddleState: {
            chest: { 
                question: "I have a heart that doesn’t beat. What am I?", 
                answer: "artichoke", 
                solved: false 
            },
            wheel: { 
                question: "What has hands but can’t clap?", 
                answer: "clock", 
                solved: false 
            },
            portrait: { 
                question: "I speak without a mouth and hear without ears. What am I?", 
                answer: "echo", 
                solved: false 
            },
            bookshelf: {
                question: "The more you take, the more you leave behind. What am I?",
                answer: "footsteps",
                solved: false
            },
            scroll: {
                question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
                answer: "m",
                solved: false
            },
            palm: {
                question: "I wave without hands and dance without feet. What am I?",
                answer: "tree",
                solved: false
            },
            cave: {
                question: "I hide treasures deep inside me. What am I?",
                answer: "cave",
                solved: false
            },
            map: {
                question: "I guide lost souls but I’m not alive. What am I?",
                answer: "map",
                solved: false
            },
            bridge: {
                question: "I connect places but I’m not a phone. What am I?",
                answer: "bridge",
                solved: false
            },
            artifact: {
                question: "I shine in the dark but I’m not a star. What am I?",
                answer: "artifact",
                solved: false
            }
        }
    };

    // DOM elements
    const lobby = document.getElementById('lobby');
    const gameContainer = document.getElementById('game-container');
    const createBtn = document.getElementById('create-btn');
    const joinBtn = document.getElementById('join-btn');
    const leaveBtn = document.getElementById('leave-btn');
    const player1Scene = document.getElementById('player1-scene');
    const player1Scene2 = document.getElementById('player1-scene-2');
    const player2Scene = document.getElementById('player2-scene');
    const player2Scene2 = document.getElementById('player2-scene-2');
    const playerRole = document.getElementById('player-role');
    const roomCodeDisplay = document.getElementById('room-code-display');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messages = document.getElementById('messages');
    const hintText = document.getElementById('hint-text');
    const currentHint = document.getElementById('current-hint');
    const hintPopup = document.getElementById('hint-popup');
    const hintContent = document.getElementById('hint-content');
    const closeHint = document.getElementById('close-hint');
    const nextRoom = document.getElementById('next-room');

    const clickSound = new Audio('/static/graphics/click.mp3');
    const successSound = new Audio('/static/graphics/success.mp3');

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => clickSound.play());
    });

    const volumeControl = document.getElementById('volume');
    const muteToggle = document.getElementById('mute-toggle');
    const audioElements = [clickSound, successSound];

    volumeControl.addEventListener('input', e => {
        const volume = e.target.value;
        audioElements.forEach(audio => audio.volume = volume);
    });

    muteToggle.addEventListener('click', () => {
        const isMuted = audioElements[0].muted;
        audioElements.forEach(audio => audio.muted = !isMuted);
        muteToggle.textContent = isMuted ? 'Mute' : 'Unmute';
    });

    function addMessage(text, playerClass = "") {
        const div = document.createElement('div');
        div.className = `message ${playerClass}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function addCompletedChallenge(objectName) {
        const displayNames = {
            chest: "✅ Chest Challenge Fixed",
            wheel: "✅ Wheel Challenge Fixed",
            portrait: "✅ Portrait Challenge Fixed",
            bookshelf: "✅ Bookshelf Challenge Fixed",
            scroll: "✅ Scroll Challenge Fixed",
            palm: "✅ Palm Tree Challenge Fixed",
            cave: "✅ Cave Challenge Fixed",
            map: "✅ Map Challenge Fixed",
            bridge: "✅ Bridge Challenge Fixed",
            artifact: "✅ Artifact Challenge Fixed"
        };

        const list = document.getElementById('challenge-list');
        const li = document.createElement('li');
        li.textContent = displayNames[objectName] || `✅ ${objectName} Challenge Fixed`;
        list.appendChild(li);
    }

    document.querySelectorAll('.game-object').forEach(obj => {
        obj.addEventListener('click', function () {
            const objectName = this.getAttribute('data-object');
            const playerClass = gameState.player === 1 ? 'player-1' : 'player-2';
            const playerName = gameState.player === 1 ? 'First Mate' : 'Captain';

            const riddle = gameState.riddleState[objectName];
            if (!riddle) return;

            if (riddle.solved) {
                addMessage(`${playerName}: You've already solved the riddle for the ${objectName}.`, playerClass);
                return;
            }

            const userAnswer = prompt(`${riddle.question}`);
            if (!userAnswer) return;

            if (userAnswer.trim().toLowerCase() === riddle.answer.toLowerCase()) {
                addMessage(`${playerName}: Solved the riddle for the ${objectName}!`, playerClass);
                riddle.solved = true;
                this.classList.add("solved-object");
                addCompletedChallenge(objectName);

                const player1Set1 = ['chest', 'wheel', 'portrait'];
                const player1Set2 = ['bookshelf', 'scroll'];
                const player2Set1 = ['palm', 'cave', 'map'];
                const player2Set2 = ['bridge', 'artifact'];

                if (gameState.player === 1 && player1Set1.every(key => gameState.riddleState[key].solved)) {
                    addMessage("System: All riddles in Scene 1 solved! Moving to the next room...", playerClass);
                    player1Scene.style.display = "none";
                    player1Scene2.style.display = "block";
                    successSound.play();
                    hintText.textContent = "Explore the hidden library for the next puzzle.";
                }

                if (gameState.player === 1 && player1Set2.every(key => gameState.riddleState[key].solved)) {
                    addMessage("System: All riddles in Scene 2 solved! Await the captain.", playerClass);
                    hintText.textContent = "You solved everything in the library. Await the captain’s signal.";
                }

                if (gameState.player === 2 && player2Set1.every(key => gameState.riddleState[key].solved)) {
                    addMessage("System: All beach riddles solved! Moving inland...", playerClass);
                    player2Scene.style.display = "none";
                    player2Scene2.style.display = "block";
                    successSound.play();
                    hintText.textContent = "Explore inland to discover the ancient relics.";
                }

                if (gameState.player === 2 && player2Set2.every(key => gameState.riddleState[key].solved)) {
                    addMessage("System: All inland riddles solved! Await the First Mate.", playerClass);
                    hintText.textContent = "You solved your part. Await your partner to proceed.";
                }
            } else {
                addMessage(`${playerName}: Hmm... That doesn't seem right.`, playerClass);
            }
        });
    });

    function showHint() {
        hintContent.textContent = "Solve all the riddles to unlock the next area.";
        hintPopup.style.display = 'block';
    }

    createBtn.addEventListener('click', () => {
        const name = document.getElementById('player1-name').value.trim();
        if (!name) return alert("Please enter your name");
        gameState.player = 1;
        gameState.playerName = name;
        gameState.roomId = Math.random().toString(36).substr(2, 4).toUpperCase();
        setTimeout(() => {
            gameState.partnerName = "Captain";
            startGame();
        }, 1000);
        alert(`Room created! Share this code with your partner: ${gameState.roomId}`);
    });

    joinBtn.addEventListener('click', () => {
        const name = document.getElementById('player2-name').value.trim();
        const room = document.getElementById('room-id').value.trim().toUpperCase();
        if (!name) return alert("Please enter your name");
        if (!room || room.length !== 4) return alert("Please enter a valid 4-character room code");
        gameState.player = 2;
        gameState.playerName = name;
        gameState.roomId = room;
        gameState.partnerName = "First Mate";
        startGame();
    });

    leaveBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to leave the game?")) {
            gameContainer.style.display = 'none';
            lobby.style.display = 'flex';
            gameState.player = null;
            gameState.roomId = null;
            document.getElementById('messages').innerHTML = '';
            document.getElementById('challenge-list').innerHTML = '';
        }
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (msg) {
            const role = gameState.player === 1 ? 'First Mate' : 'Captain';
            const cls = gameState.player === 1 ? 'player-1' : 'player-2';
            addMessage(`${role}: ${msg}`, cls);
            chatInput.value = '';
        }
    });

    function startGame() {
        lobby.style.display = 'none';
        gameContainer.style.display = 'grid';
        playerRole.textContent = gameState.player === 1 ? 'First Mate' : 'Captain';
        if (gameState.player === 1) player1Scene.style.display = 'block';
        else player2Scene.style.display = 'block';
        roomCodeDisplay.textContent = gameState.roomId;
        addMessage(`System: You are connected with ${gameState.partnerName}!`);
        addMessage(`System: Solve the riddles to unlock the path forward!`);
    }

    closeHint.addEventListener('click', () => hintPopup.style.display = 'none');
    window.addEventListener('click', e => {
        if (e.target === hintPopup) hintPopup.style.display = 'none';
    });
    document.getElementById('start-next-room').addEventListener('click', () => {
        window.location.href = "library.html";
    });
});
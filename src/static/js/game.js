// game.js

// Ensure all logic runs after DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {

    // Firebase Setup
    const firebaseConfig = {
        apiKey: "AIzaSyBs3gH6MpLbV0DlIag1B0CODKS-kTlOHEk",
        authDomain: "blackwoodmanor-1cde9.firebaseapp.com",
        projectId: "blackwoodmanor-1cde9",
        storageBucket: "blackwoodmanor-1cde9.appspot.com",
        messagingSenderId: "451127821398",
        appId: "1:451127821398:web:33566d0af016124e96a7f7",
        measurementId: "G-DSSF70V9J8"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const gameState = {
        player: null,
        roomId: null,
        playerName: null,
        partnerName: null,
        finished: false,
        riddleState: {
            lamp: { question: "Born of fire but tamed by wire, I stand guard through shadows dire. I reveal truth but have none of my own. What am I?", answer: "1", solved: false },
            typewriter: { question: "I echo thoughts in metal and ink, though I cannot feel or think. Once I start, I never speak — yet all your secrets I may leak. What am I?", answer: "1", solved: false },
            portrait: { question: "A reflection I hold, but not your face. I freeze a soul in a gilded place. I watch, I wait, with painted grace. What am I?", answer: "1", solved: false },
            chest: { question: "I keep what’s precious out of sight. I lock away both day and night. Though I hold, I do not cling — you must answer to see what I bring. What am I?", answer: "1", solved: false },
            bookshelf: { question: "I carry countless voices quiet, stories ancient, knowledge private. I never move, but minds I steer. What am I?", answer: "1", solved: false },
            candle: { question: "I vanish while I shine. I feed on breath but make no sound. My death is slow, my life is bright. What am I?", answer: "1", solved: false },
            palm: { question: "I wave without hands and dance without feet. What am I?", answer: "1", solved: false },
            chalkboard: { question: "I hide treasures deep inside me. What am I?", answer: "1", solved: false },
            bloodStainedTable: { question: "I guide lost souls but I’m not alive. What am I?", answer: "1", solved: false },
            bridge: { question: "I connect places but I’m not a phone. What am I?", answer: "1", solved: false },
            artifact: { question: "I shine in the dark but I’m not a star. What am I?", answer: "1", solved: false },
            finale: {
                question: "Who killed Alistair Blackwood? Type \"partner\" or \"blackwood\".",
                answer: "1",
                alternateAnswer: "2",
                solved: false
            }
        }
    };

    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messages = document.getElementById('messages');
    const createBtn = document.getElementById('create-btn');
    const joinBtn = document.getElementById('join-btn');
    const playerRole = document.getElementById('player-role');
    const roomCodeDisplay = document.getElementById('room-code-display');
    const lobby = document.getElementById('lobby');
    const gameContainer = document.getElementById('game-container');
    const player1Scene = document.getElementById('player1-scene');
    const player2Scene = document.getElementById('player2-scene');
    const player1Scene2 = document.getElementById('player1-scene-2');
    const player2Scene2 = document.getElementById('player2-scene-2');
    const finalScene = document.getElementById('final-scene');
    const challengeList = document.getElementById('challenge-list');
    const gameObjects = document.querySelectorAll('.game-object');
    const waitingRoom = document.getElementById('waiting-room');
    const waitingMessages = document.getElementById('waiting-messages');
    const introVideoOverlay = document.getElementById('intro-video-overlay');
    const introVideo = document.getElementById('intro-video');
    const transitionOverlay = document.getElementById('transition-overlay');
    const transitionMessage = document.getElementById('transition-message');

    function sendMessage(msg, role) {
        db.collection("rooms").doc(gameState.roomId).collection("messages").add({
            sender: role,
            text: msg,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    function listenForMessages() {
        db.collection("rooms").doc(gameState.roomId).collection("messages")
            .orderBy("timestamp")
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        const data = change.doc.data();
                        let className = 'message';
                        if (data.sender === 'System') {
                            className += ' system';
                        } else if (data.sender === 'Player 1') {
                            className += ' player-1';
                        } else if (data.sender === 'Player 2') {
                            className += ' player-2';
                        }
                        const div = document.createElement('div');
                        div.className = className;
                        div.textContent = `${data.sender}: ${data.text}`;
                        messages.appendChild(div);
                        messages.scrollTop = messages.scrollHeight;
                    }
                });
            });
    }

    function updateFinishState() {
        db.collection("rooms").doc(gameState.roomId).set({
            [gameState.player === 1 ? "player1Finished" : "player2Finished"]: true
        }, { merge: true });

        db.collection("rooms").doc(gameState.roomId).onSnapshot(doc => {
            const data = doc.data();
            if (data.player1Finished && data.player2Finished) {
                const div = document.createElement('div');
                div.className = "message system";
                div.textContent = "System: Both players are ready! Proceeding to the final stage...";
                messages.appendChild(div);
                messages.scrollTop = messages.scrollHeight;
                showTransitionOverlay();
                setTimeout(() => {
                    hideTransitionOverlay();
                    player1Scene2.style.display = "none";
                    player2Scene2.style.display = "none";
                    finalScene.style.display = 'block';
                }, 1500);
            }
        });
    }

    function addCompletedChallenge(objectName) {
        const li = document.createElement('li');
        li.textContent = `✅ ${objectName} Challenge Fixed`;
        challengeList.appendChild(li);
        const obj = document.querySelector(`.game-object[data-object="${objectName}"]`);
        if (obj) obj.classList.add("solved-object");
    }

    function handleRiddleClick(event) {
            const objectName = event.target.getAttribute('data-object');
            const riddle = gameState.riddleState[objectName];
            if (!riddle || riddle.solved) {
                alert("Already solved or invalid.");
                return;
            }
        
            // Speziell für chalkboard: Kein prompt, sondern eigenes Overlay
            if (objectName === 'chalkboard') {
                const overlay = document.getElementById('custom-chalkboard-overlay');
                const inputField = document.getElementById('chalkboard-answer-input');
                const okBtn = document.getElementById('chalkboard-ok-btn');
                const cancelBtn = document.getElementById('chalkboard-cancel-btn');
        
                // Reset Input
                inputField.value = '';
        
                // Overlay anzeigen
                overlay.style.display = 'flex';
        
                // OK-Button Event
                okBtn.onclick = () => {
                    const answer = inputField.value.trim();
                    if (!answer) {
                        alert("Bitte gib eine Antwort ein.");
                        return;
                    }
        
                    const cleaned = answer.toLowerCase();
                    const correct = cleaned === riddle.answer.toLowerCase() ||
                                    (riddle.alternateAnswer && cleaned === riddle.alternateAnswer.toLowerCase());
        
                    overlay.style.display = 'none'; // Overlay ausblenden
        
                    if (correct) {
                        riddle.solved = true;
                        sendMessage(`${gameState.playerName} solved ${objectName}`, gameState.player === 1 ? 'Player 1' : 'Player 2');
                        addCompletedChallenge(objectName);
        
                        // Optional: Transition oder andere Logik hier
                        const player2Set1 = ['chalkboard', 'bloodStainedTable'];
                        function isLastUnsolved(set) {
                            return set.filter(k => !gameState.riddleState[k].solved).length === 0 && set.includes(objectName);
                        }
                        if (gameState.player === 2 && isLastUnsolved(player2Set1)) {
                            showTransitionOverlay();
                            setTimeout(() => {
                                hideTransitionOverlay();
                                player2Scene.style.display = 'none';
                                player2Scene2.style.display = 'block';
                                sendMessage("Detective B completed Labo.", "System");
                            }, 1500);
                        }
                    } else {
                        sendMessage(`${gameState.playerName} attempted ${objectName} but failed`, gameState.player === 1 ? 'Player 1' : 'Player 2');
                        alert("Falsche Antwort. Versuche es erneut.");
                    }
                };
        
                // Cancel-Button Event
                cancelBtn.onclick = () => {
                    overlay.style.display = 'none';
                };
        
                return; // Verhindere weiteren Code (kein prompt!)
            }
        
            // Für alle anderen Rätsel bleibt alles wie bisher
            const answer = prompt(riddle.question);
            if (!answer) return;
        
        const cleaned = answer.trim().toLowerCase();

        const correct = cleaned === riddle.answer.toLowerCase() ||
            (riddle.alternateAnswer && cleaned === riddle.alternateAnswer.toLowerCase());

        if (correct) {
            riddle.solved = true;
            sendMessage(`${gameState.playerName} solved ${objectName}`, gameState.player === 1 ? 'Player 1' : 'Player 2');
            addCompletedChallenge(objectName);

            if (objectName === 'finale') {
                alert(cleaned === "partner" ? "Congratulations! You solved the mystery!" : "A terrifying truth revealed...");
                window.location.href = "victory.html";
                return;
            }

            const player1Set1 = ['lamp', 'typewriter', 'portrait'];
            const player1Set2 = ['chest', 'bookshelf', 'candle'];
            const player2Set1 = ['palm', 'chalkboard', 'bloodStainedTable'];
            const player2Set2 = ['bridge', 'artifact'];

            // Only show transition if this is the last unsolved riddle in the set
            function isLastUnsolved(set) {
                return set.filter(k => !gameState.riddleState[k].solved).length === 0 && set.includes(objectName);
            }

            if (gameState.player === 1 && isLastUnsolved(player1Set1)) {
                showTransitionOverlay();
                setTimeout(() => {
                    hideTransitionOverlay();
                    player1Scene.style.display = 'none';
                    player1Scene2.style.display = 'block';
                    sendMessage("Detective A completed Study Room.", "System");
                }, 1500);
            }

            if (gameState.player === 1 && isLastUnsolved(player1Set2)) {
                showTransitionOverlay();
                setTimeout(() => {
                    hideTransitionOverlay();
                    sendMessage("Detective A completed Library. Waiting for Detective B...", "System");
                    updateFinishState();
                }, 1500);
            }

            if (gameState.player === 2 && isLastUnsolved(player2Set1)) {
                showTransitionOverlay();
                setTimeout(() => {
                    hideTransitionOverlay();
                    player2Scene.style.display = 'none';
                    player2Scene2.style.display = 'block';
                    sendMessage("Detective B completed Labo.", "System");
                }, 1500);
            }

            if (gameState.player === 2 && isLastUnsolved(player2Set2)) {
                showTransitionOverlay();
                setTimeout(() => {
                    hideTransitionOverlay();
                    sendMessage("Detective B completed Security Room. Waiting for Detective A...", "System");
                    updateFinishState();
                }, 1500);
            }

        } else {
            sendMessage(`${gameState.playerName} attempted ${objectName} but failed`, gameState.player === 1 ? 'Player 1' : 'Player 2');
        }
    }

    function showWaitingRoom(isPlayer1) {
        lobby.style.display = 'none';
        gameContainer.style.display = 'none';
        waitingRoom.style.display = 'block';
        if (isPlayer1) {
            waitingMessages.innerHTML = `<div>Detective A joined</div><div>Waiting for Detective B</div>`;
        } else {
            waitingMessages.innerHTML = `<div>Detective A joined</div><div>Detective B joined</div><div>Proceeding to the game</div>`;
        }
    }

    function showIntroVideoAndStartGame() {
        waitingRoom.style.display = 'none';
        introVideoOverlay.style.display = 'flex';
        introVideo.currentTime = 0;
        introVideo.play();
        // Only allow proceeding after video ends
        introVideo.onended = () => {
            introVideoOverlay.style.display = 'none';
            startGame();
        };
        // Optional: allow skipping after a few seconds
        if (!document.getElementById('skip-intro-btn')) {
            const skipBtn = document.createElement('button');
            skipBtn.id = 'skip-intro-btn';
            skipBtn.textContent = 'Skip Intro';
            skipBtn.style = 'position:absolute;top:24px;right:24px;padding:10px 20px;font-size:1.2rem;z-index:10;background:#222;color:#fff;border-radius:8px;border:none;cursor:pointer;opacity:0.8;';
            skipBtn.onclick = () => {
                introVideo.pause();
                introVideoOverlay.style.display = 'none';
                startGame();
            };
            introVideoOverlay.appendChild(skipBtn);
        }
    }

    function listenForPlayers() {
        db.collection('rooms').doc(gameState.roomId).onSnapshot(doc => {
            const data = doc.data();
            if (!data) return;
            let aJoined = !!data.player1Joined;
            let bJoined = !!data.player2Joined;
            if (gameState.player === 1) {
                if (aJoined && !bJoined) {
                    showWaitingRoom(true);
                } else if (aJoined && bJoined) {
                    waitingMessages.innerHTML = `<div>Detective A joined</div><div>Detective B joined</div><div>Proceeding to the game</div>`;
                    setTimeout(() => {
                        showIntroVideoAndStartGame();
                    }, 1200);
                }
            } else if (gameState.player === 2) {
                if (aJoined && bJoined) {
                    showWaitingRoom(false);
                    setTimeout(() => {
                        showIntroVideoAndStartGame();
                    }, 1200);
                }
            }
        });
    }

    function startGame() {
        lobby.style.display = 'none';
        gameContainer.style.display = 'grid';
        playerRole.textContent = gameState.player === 1 ? 'Detective A' : 'Detective B';
        roomCodeDisplay.textContent = gameState.roomId;
        if (gameState.player === 1) player1Scene.style.display = 'block';
        else player2Scene.style.display = 'block';

        sendMessage(`You are connected with ${gameState.partnerName}`, "System");
        sendMessage("Solve your puzzles to progress!", "System");

        gameObjects.forEach(obj => obj.addEventListener('click', handleRiddleClick));
        listenForMessages();
    }

    function showTransitionOverlay(message = 'Proceeding to the next room...') {
        transitionMessage.textContent = message;
        transitionOverlay.style.display = 'flex';
    }
    function hideTransitionOverlay() {
        transitionOverlay.style.display = 'none';
    }

    createBtn.addEventListener('click', () => {
        const name = document.getElementById('player1-name').value.trim();
        if (!name) return alert("Enter name.");
        gameState.player = 1;
        gameState.playerName = name;
        gameState.roomId = Math.random().toString(36).substr(2, 4).toUpperCase();
        gameState.partnerName = "Player 2";
        // Set player1Joined in Firestore
        db.collection('rooms').doc(gameState.roomId).set({
            player1Joined: true,
            player2Joined: false
        });
        showWaitingRoom(true);
        listenForPlayers();
        alert(`Room created. Share code: ${gameState.roomId}`);
    });

    joinBtn.addEventListener('click', () => {
        const name = document.getElementById('player2-name').value.trim();
        const room = document.getElementById('room-id').value.trim().toUpperCase();
        if (!name || !room || room.length !== 4) return alert("Enter valid name and room code");
        gameState.player = 2;
        gameState.playerName = name;
        gameState.roomId = room;
        gameState.partnerName = "Player 1";
        // Set player2Joined in Firestore
        db.collection('rooms').doc(gameState.roomId).set({
            player2Joined: true
        }, { merge: true });
        listenForPlayers();
        showWaitingRoom(false);
    });

    chatForm.addEventListener('submit', e => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (msg) {
            sendMessage(msg, gameState.player === 1 ? 'Player 1' : 'Player 2');
            chatInput.value = '';
        }
    });

    // Finale click logic
    document.querySelectorAll('[data-object="finale"]').forEach(el => {
        el.addEventListener('click', () => {
            const finale = gameState.riddleState.finale;
            if (finale.solved) return alert("Already solved.");
            const input = prompt(finale.question);
            if (!input) return;
            const answer = input.trim().toLowerCase();
            if (answer === finale.answer || answer === finale.alternateAnswer) {
                finale.solved = true;
                alert(answer === "partner" ? "Congratulations! You solved the mystery!" : "You uncovered a darker truth!");
                window.location.href = "victory.html";
            } else {
                alert("Wrong answer. Try again.");
            }
        });
    });

});

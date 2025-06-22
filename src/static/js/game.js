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
            // Study (Detective A - Room 1)
            portrait: {
                question: "The man in the painting is no stranger to codes. Below him, an object stands still — once used to capture time. How many hands does it have?",
                answer: "3",
                hint: "Focus on the object just below the portrait — one hand would be for hours.",
                solved: false
            },
            typewriter: {
                question: "Old keys rattle in silence. The word ‘CODE’ is jammed. Find the sum of their row numbers.",
                answer: "7",
                hint: "It’s a single-digit number that’s the sum of the row positions for the keys C, O, D, and E. Think of a traditional QWERTY layout — top is 1, middle is 2, bottom is 3.",
                solved: false
            },
            cabinet: {
                question: "Inside the Cabinet lies a faded map marked ‘1950’. Which famous war does this year point to?",
                answer: "korean",
                hint: "This battle happened in a country presently extremely popular for pop music. Starts with K, ends with N",
                solved: false
            },
            // Hidden Library (Detective A - Room 2)
            candle: {
                question: "\"I sleep in silence, slender and dry,\nBut strike me once, and flames will fly.\nBorn from friction, short I live—\nA spark, a flare, is all I give.\nWhat am I?\"",
                answer: "match",
                hint: "A tool for lighting the candle. You’re looking for a word, number of letters matching the answer for  Detective B's Atom Count Formula riddle answer + 1 letter.",
                solved: false
            },
            bookshelf: {
                question: `Three ancient books sit side-by-side on a dusty shelf:\nOne is titled Alchemy, one is Astrology, and one is Anatomy.\nEach has a different cover: red, green, or black.\nEach is written in a different language: Latin, Greek, or Arabic.\n\nClues:\n- The Alchemy book is somewhere to the left of the green book.\n- The Latin book is immediately next to the Anatomy book.\n- The black book is not written in Arabic.\n- The Astrology book is not next to the Alchemy book.\n- The green book is in the middle.\n\nGoal: Determine the correct order (from left to right) of the books by title, cover color, and language.`,
                answer: "alchemy-red-greek,astrology-green-arabic,anatomy-black-latin",
                hint: "Start with what’s fixed. Then think about what can’t be next to what",
                solved: false
            },
            chest: {
                question: "Chest bears a padlock. Underneath it is a carving: ‘XII, IV, IX’. Convert and sum.",
                answer: "25",
                hint: "It’s the sum of three Roman numerals. One rhymes with ‘Fine’. The total is a two-digit number.",
                solved: false
            },
            // Lab (Detective B - Room 1)
            chalkboard: {
                question: "An equation reads: ‘Sun + Moon = ???’. What do many ancient cultures believe is formed when both align?",
                answer: "eclipse",
                hint: "Starts with E, ends with E, and causes shadows during day or night.",
                solved: false
            },
            bloodStainedTable: {
                question: "Three vials lie shattered. One labeled ‘Cu’, one ‘Au’, one ‘Ag’. Which has the highest value?",
                answer: "gold",
                hint: "Four-letter word. A metal fit for king's crown.",
                solved: false
            },
            hiddenFormula: {
                question: "The Eternalis formula ends in something explosive. Multiply the atom count of NaCl by H₂O.",
                answer: "6",
                hint: "You’re multiplying the number of atoms in each compound. One has X, the other has Y. What’s X × Y?",
                solved: false
            },
            // Security Room (Detective B - Room 2)
            safe: {
                question: "The answer lies in the past — piece together what your partner revealed in Portrait and Typewriter.",
                answer: "37",
                hint: "Combine the number of clock hands and the sum of the row numbers into a single passphrase in ascending order.",
                solved: false
            },
            monitor: {
                question: "A flickering feed shows a comet. It returns every 76 years. What’s its name?",
                answer: "halley",
                hint: "Sounds like ‘Valley’, and it starts with H. Famous celestial object visible to the naked eye.",
                solved: false
            },
            securityDoor: {
                question: "I can unlock any door, yet I am not a key. I am spoken, not held. I am known but not seen. Say me wrong, and you stay locked in. What am I?",
                answer: "password",
                hint: "You don’t carry this in your pocket, but you enter this to gain access. Often changed, sometimes forgotten. Starts with letter P.",
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

    // Add modal for riddle prompt and hint
    let riddleModal = document.getElementById('riddle-modal');
    if (!riddleModal) {
        // Attach modal to game-view, not body
        const gameView = document.getElementById('game-view');
        riddleModal = document.createElement('div');
        riddleModal.id = 'riddle-modal';
        riddleModal.style = 'display:none; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:520px; max-width:90vw; min-width:340px; background:rgba(34,34,34,0.98); z-index:999; justify-content:center; align-items:center; border-radius:18px; box-shadow:0 8px 32px rgba(0,0,0,0.7);';
        riddleModal.innerHTML = `
      <div id="riddle-modal-content" style="background:none; color:#fff; border-radius:16px; padding:32px 32px 24px 32px; min-width:320px; max-width:90vw; text-align:center; position:relative;">
        <div id="riddle-question" style="font-size:1.2rem; margin-bottom:16px;"></div>
        <input id="riddle-answer" type="text" style="width:90%; padding:10px; font-size:1.1rem; margin-bottom:12px; border-radius:8px; border:none;" placeholder="Your answer..." />
        <div style="margin-bottom:12px;">
          <button id="riddle-hint-btn" style="margin-right:8px; padding:8px 22px; border-radius:8px; background:#444; color:#fff; border:none; cursor:pointer;">Hint</button>
          <button id="riddle-submit-btn" style="padding:8px 22px; border-radius:8px; background:#D4AF37; color:#222; border:none; cursor:pointer;">Submit</button>
        </div>
        <div id="riddle-hint" style="display:none; background:#333; color:#FFD700; border-radius:8px; padding:10px; margin-bottom:8px; font-size:1rem;"></div>
        <button id="riddle-cancel-btn" style="position:absolute; top:8px; right:8px; background:none; color:#fff; border:none; font-size:1.2rem; cursor:pointer;">&times;</button>
      </div>
    `;
        gameView.appendChild(riddleModal);
    }

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

    function showRiddleModal(riddle, onSubmit) {
        document.getElementById('riddle-question').textContent = riddle.question;
        document.getElementById('riddle-hint').style.display = 'none';
        document.getElementById('riddle-hint').textContent = riddle.hint;
        // Custom input for bookshelf puzzle
        if (riddle === gameState.riddleState.bookshelf) {
            document.getElementById('riddle-answer').style.display = 'none';
            if (!document.getElementById('bookshelf-title')) {
                const modalContent = document.getElementById('riddle-modal-content');
                const titleInput = document.createElement('input');
                titleInput.id = 'bookshelf-title';
                titleInput.type = 'text';
                titleInput.placeholder = 'Titles (comma separated)';
                titleInput.style = 'width:80%; padding:8px; font-size:1rem; margin-bottom:8px; border-radius:6px; border:none;';
                const colorInput = document.createElement('input');
                colorInput.id = 'bookshelf-color';
                colorInput.type = 'text';
                colorInput.placeholder = 'Colors (comma separated)';
                colorInput.style = 'width:80%; padding:8px; font-size:1rem; margin-bottom:8px; border-radius:6px; border:none;';
                const langInput = document.createElement('input');
                langInput.id = 'bookshelf-language';
                langInput.type = 'text';
                langInput.placeholder = 'Languages (comma separated)';
                langInput.style = 'width:80%; padding:8px; font-size:1rem; margin-bottom:12px; border-radius:6px; border:none;';
                modalContent.insertBefore(titleInput, document.getElementById('riddle-hint-btn').parentNode);
                modalContent.insertBefore(colorInput, document.getElementById('riddle-hint-btn').parentNode);
                modalContent.insertBefore(langInput, document.getElementById('riddle-hint-btn').parentNode);
            } else {
                document.getElementById('bookshelf-title').style.display = '';
                document.getElementById('bookshelf-color').style.display = '';
                document.getElementById('bookshelf-language').style.display = '';
            }
        } else {
            document.getElementById('riddle-answer').style.display = '';
            if (document.getElementById('bookshelf-title')) {
                document.getElementById('bookshelf-title').style.display = 'none';
                document.getElementById('bookshelf-color').style.display = 'none';
                document.getElementById('bookshelf-language').style.display = 'none';
            }
        }
        riddleModal.style.display = 'flex';
        if (riddle !== gameState.riddleState.bookshelf) {
            document.getElementById('riddle-answer').focus();
        } else {
            document.getElementById('bookshelf-title').focus();
        }

        document.getElementById('riddle-hint-btn').onclick = () => {
            document.getElementById('riddle-hint').style.display = 'block';
        };
        document.getElementById('riddle-submit-btn').onclick = () => {
            if (riddle === gameState.riddleState.bookshelf) {
                const title = document.getElementById('bookshelf-title').value.trim();
                const color = document.getElementById('bookshelf-color').value.trim();
                const lang = document.getElementById('bookshelf-language').value.trim();
                riddleModal.style.display = 'none';
                onSubmit({title, color, lang});
            } else {
                const answer = document.getElementById('riddle-answer').value;
                riddleModal.style.display = 'none';
                onSubmit(answer);
            }
        };
        document.getElementById('riddle-cancel-btn').onclick = () => {
            riddleModal.style.display = 'none';
        };
    }

    function handleRiddleClick(event) {
        const objectName = event.target.getAttribute('data-object');
        const riddle = gameState.riddleState[objectName];
        if (!riddle || riddle.solved) {
            alert("Already solved or invalid.");
            return;
        }

        showRiddleModal(riddle, function(answer) {
            if (!answer) return;
            let correct = false;
            if (objectName === 'bookshelf') {
                // Accept answer as object: {title, color, lang}
                const t = answer.title.toLowerCase().replace(/\s+/g, '');
                const c = answer.color.toLowerCase().replace(/\s+/g, '');
                const l = answer.lang.toLowerCase().replace(/\s+/g, '');
                // Accept comma or dash separated, any order
                const userCombo = `${t}-${c}-${l}`;
                const expected = [
                  'alchemy-red-greek',
                  'astrology-green-arabic',
                  'anatomy-black-latin'
                ];
                // Accept all three in order, comma separated
                correct = (
                  userCombo === expected[0] ||
                  userCombo === expected[1] ||
                  userCombo === expected[2] ||
                  `${t},${c},${l}` === riddle.answer
                );
                // Accept all three as a single string
                if (
                  `${t},${c},${l}`.replace(/\s+/g, '') === riddle.answer.replace(/\s+/g, '')
                ) correct = true;
            } else {
                const cleaned = typeof answer === 'string' ? answer.trim().toLowerCase() : '';
                correct = cleaned === riddle.answer.toLowerCase() ||
                    (riddle.alternateAnswer && cleaned === riddle.alternateAnswer.toLowerCase());
            }

            if (correct) {
                riddle.solved = true;
                sendMessage(`${gameState.playerName} solved ${objectName}`, gameState.player === 1 ? 'Player 1' : 'Player 2');
                addCompletedChallenge(objectName);

                if (objectName === 'finale') {
                    alert(typeof answer === 'string' && answer.trim().toLowerCase() === "partner" ? "Congratulations! You solved the mystery!" : "A terrifying truth revealed...");
                    window.location.href = "victory.html";
                    return;
                }

                const player1Set1 = ['portrait', 'typewriter', 'cabinet'];
                const player1Set2 = ['chest', 'bookshelf', 'candle'];
                const player2Set1 = ['chalkboard', 'bloodStainedTable', 'hiddenFormula'];
                const player2Set2 = ['safe', 'monitor', 'securityDoor'];

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
        });
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

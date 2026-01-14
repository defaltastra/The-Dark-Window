

class VisualNovel {
    constructor() {
        this.nodes = {};
        this.currentNode = null;
        this.storyContent = '';
    }

    async loadStory() {
        try {
            const response = await fetch('/story');
            const data = await response.json();
            this.storyContent = data.content;
            this.parseStory();
            this.startGame();
        } catch (error) {
            console.error('Failed to load story:', error);
            document.getElementById('scene-text').textContent = 'فشل تحميل القصة';
        }
    }

    parseStory() {
        const lines = this.storyContent.split('\n');
        let currentScene = null;
        let sceneText = '';
        let choices = [];
        let isReadingText = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('المشهد')) {
                if (currentScene) {
                    this.nodes[currentScene] = {
                        title: currentScene,
                        text: sceneText.trim(),
                        choices: choices
                    };
                }

                const match = line.match(/المشهد\s+(\S+):\s*(.+)/);
                if (match) {
                    currentScene = match[1];
                    sceneText = '';
                    choices = [];
                    isReadingText = true;
                }
            } else if (line.startsWith('خيارات')) {
                isReadingText = false;
            } else if (line.match(/^.+-\d+$/)) {
                const choiceMatch = line.match(/^(.+)-(\d+)$/);
                if (choiceMatch) {
                    choices.push({
                        text: choiceMatch[1].trim(),
                        next: choiceMatch[2]
                    });
                }
            } else if (line.startsWith('المسار')) {
                if (currentScene) {
                    this.nodes[currentScene] = {
                        title: currentScene,
                        text: sceneText.trim(),
                        choices: choices
                    };
                }

                const match = line.match(/المسار\s+(\S+):\s*(.+)/);
                if (match) {
                    currentScene = match[1];
                    sceneText = '';
                    choices = [];
                    isReadingText = true;
                }

            } else if (isReadingText && line && !line.startsWith('عنوان') && !line.startsWith('خيارات')) {
                sceneText += line + '\n';
            }
        }

        if (currentScene) {
            this.nodes[currentScene] = {
                title: currentScene,
                text: sceneText.trim(),
                choices: choices
            };
        }

        this.createNodeConnections();
    }

    createNodeConnections() {
        for (const nodeId in this.nodes) {
            const node = this.nodes[nodeId];
            const isIntentionalEnding = node.text.includes('نهاية');

            if (node.choices.length === 0 && !isIntentionalEnding && nodeId !== '1') {
                const nextNodes = this.findNextNode(nodeId);
                if (nextNodes.length > 0) {
                    node.choices = nextNodes.map(next => ({
                        text: 'تابع',
                        next: next
                    }));
                }
            }

            node.choices = node.choices.map(choice => {
                const targetNode = this.findNodeByPattern(nodeId, choice.next, choice.text);
                return {
                    text: choice.text,
                    targetNode: targetNode
                };
            });
        }
    }

    findNodeByPattern(currentNodeId, choiceNum, choiceText = '') {
        const cleanId = String(currentNodeId);

        // Special mapping for Scene 6A to correct endings
        if (cleanId === '6A') {
            if (parseInt(choiceNum) === 1) return '6D'; // Empathy -> Peace
            if (parseInt(choiceNum) === 2) return '6B'; // Challenge -> Anger
        }

        if (choiceText === 'تابع' || choiceText.includes('تابع')) {
            const match = cleanId.match(/^(\d+)/);
            if (match) {
                const nextSceneNum = parseInt(match[1]) + 1;
                if (this.nodes[String(nextSceneNum)]) return String(nextSceneNum);
                if (this.nodes[nextSceneNum + 'A']) return nextSceneNum + 'A';
                const found = Object.keys(this.nodes).find(id => id.startsWith(String(nextSceneNum)));
                if (found) return found;
            }
        }

        const match = cleanId.match(/^(\d+)([A-D]?)$/);
        if (!match) return null;

        const sceneNumber = parseInt(match[1]);
        const sceneLetter = match[2] || '';
        const choice = parseInt(choiceNum);

        if (sceneLetter) {
            const nextSceneNumber = sceneNumber + 1;
            const letterIndex = sceneLetter.charCodeAt(0) - 65;
            const nextLetterIndex = letterIndex * 2 + (choice - 1);
            const nextLetter = String.fromCharCode(65 + nextLetterIndex);
            const targetId = nextSceneNumber + nextLetter;
            if (this.nodes[targetId]) return targetId;
        } else {
            const targetLetter = String.fromCharCode(65 + (choice - 1));
            const targetId = (sceneNumber + 1) + targetLetter;
            if (this.nodes[targetId]) return targetId;
        }

        const nextScene = sceneNumber + 1;
        if (this.nodes[String(nextScene)]) return String(nextScene);
        if (this.nodes[nextScene + 'A']) return nextScene + 'A';
        const allNodes = Object.keys(this.nodes);
        const fallback = allNodes.find(id => id.startsWith(String(nextScene)));
        if (fallback) return fallback;

        return null;
    }

    findNextNode(currentNodeId) {
        const baseId = parseInt(String(currentNodeId).replace(/[A-Z]/g, ''));
        const nextId = baseId + 1;
        const results = [];
        for (const nodeId in this.nodes) {
            if (nodeId.startsWith(String(nextId))) results.push(nodeId);
        }
        return results;
    }

    makeChoice(targetNode) {
        if (targetNode && this.nodes[targetNode]) {
            this.currentNode = targetNode;
            this.displayNode();
        } else {
            const node = this.nodes[this.currentNode];
            if (node && node.text.includes('نهاية')) {
                this.showEnding();
            } else {
                const nextNodes = this.findNextNode(this.currentNode);
                if (nextNodes.length > 0) {
                    this.currentNode = nextNodes[0];
                    this.displayNode();
                } else {
                    this.showEnding();
                }
            }
        }
    }

    startGame() {
        this.currentNode = '1';
        this.displayNode();
    }

    displayNode() {
        const node = this.nodes[this.currentNode];
        if (!node) {
            this.showEnding();
            return;
        }

        const sceneTitle = document.getElementById('scene-title');
        const sceneText = document.getElementById('scene-text');
        const choicesContainer = document.getElementById('choices-container');
        const restartBtn = document.getElementById('restart-btn');

        sceneTitle.textContent = node.title;
        sceneText.textContent = '';
        choicesContainer.innerHTML = '';
        restartBtn.style.display = 'none';
        sceneTitle.style.color = '#ff6b6b';

        this.typeText(node.text, sceneText, () => {
            if (node.choices.length === 0 && !node.text.includes('نهاية')) {
                const nextNodes = this.findNextNode(this.currentNode);
                if (nextNodes.length > 0) {
                    this.currentNode = nextNodes[0];
                    this.displayNode();
                } else {
                    this.showEnding();
                }
            } else if (node.text.includes('نهاية')) {
                this.showEnding();
            } else {
                this.displayChoices(node.choices);
            }
        });
    }

    typeText(text, element, callback) {
        let index = 0;
        const speed = 30;
        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                callback();
            }
        };
        type();
    }

    displayChoices(choices) {
        const choicesContainer = document.getElementById('choices-container');
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.onclick = () => this.makeChoice(choice.targetNode);
            choicesContainer.appendChild(button);
        });
    }

    showEnding() {
        const sceneTitle = document.getElementById('scene-title');
        const sceneText = document.getElementById('scene-text');
        const choicesContainer = document.getElementById('choices-container');
        const restartBtn = document.getElementById('restart-btn');

        const node = this.nodes[this.currentNode];
        const text = node ? node.text : '';
        const title = node ? node.title : 'النهاية';

        sceneTitle.textContent = title;
        sceneText.textContent = text;

        const endingType = text.includes('مسار الغضب') || text.includes('نهاية سيئة') ? 'bad' :
            text.includes('مسار النجاة') || text.includes('نهاية جيدة') ? 'good' :
                text.includes('مسار السلام') || text.includes('نهاية مثالية') ? 'perfect' : 'neutral';

        sceneTitle.style.color = endingType === 'bad' ? '#ff4444' :
            endingType === 'good' ? '#ffaa44' :
                endingType === 'perfect' ? '#44ff88' : '#ff6b6b';

        // Apply dynamic background class
        document.body.className = ''; // Reset classes
        if (endingType === 'bad') document.body.classList.add('ending-bad');
        else if (endingType === 'good') document.body.classList.add('ending-good');
        else if (endingType === 'perfect') document.body.classList.add('ending-perfect');

        choicesContainer.innerHTML = '';
        restartBtn.style.display = 'block';
        restartBtn.textContent = 'ابدأ من جديد';

        restartBtn.onclick = () => {
            sceneTitle.style.color = '#ff6b6b';
            document.body.className = ''; // Reset background on restart
            this.startGame();
        };
    }
}

const game = new VisualNovel();
game.loadStory();

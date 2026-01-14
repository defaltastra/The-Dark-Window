const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/story', (req, res) => {
    const storyPath = path.join(__dirname, 'عنوان اللعبة النافذة المظلمة.md');
    fs.readFile(storyPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load story' });
        }
        res.json({ content: data });
    });
});

app.listen(PORT, () => {
    console.log(`Horror Visual Novel running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});

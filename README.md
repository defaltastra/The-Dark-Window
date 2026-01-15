# النافذة المظلمة - Horror Visual Novel

A complete horror visual novel game built with Node.js and Express.

## Setup & Installation

1. Clone the repository:
```bash
git clone https://github.com/defaltastra/The-Dark-Window.git
cd The-Dark-Window
```

2. Install dependencies:
```bash
npm install
```

## Running the Game

```bash
npm start
```

Then open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
story-node/
├── server.js                           # Express server
├── package.json                        # Dependencies
├── عنوان اللعبة النافذة المظلمة.md    # Story content (Arabic)
├── public/
│   ├── index.html                      # Game UI
│   ├── game.js                         # Game engine & parser
│   └── style.css                       # Horror-themed styling
└── README.md                           # This file
```

## Features

- Markdown-based story format
- Node-based narrative structure
- Choice-driven gameplay
- Horror atmosphere with dark UI
- Arabic language support (RTL)
- Typewriter text effect
- Responsive design

## How It Works

1. Server reads the Markdown story file
2. Client fetches story via `/story` endpoint
3. Parser extracts scenes and choices
4. Game engine manages node transitions
5. Player choices advance through story nodes

## Controls

- Click choice buttons to progress
- Restart button appears at endings
- All text is displayed with atmospheric typing effect

## Credits

- **Story & Writing**: Special thanks to [Rihab Nadi](https://github.com/rihabnadi) for the writing.
- **Development**: Built with Node.js and Vanilla JS.

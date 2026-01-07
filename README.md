# Claude Conversations Dashboard

A simple dashboard to help Claude Code users declutter and remember what they're working on.

## Features

- **Auto-scan** conversations from `~/.claude/`
- **Auto-categorize** by project type (Work / Side Projects / Other)
- **Smart Resume** - surfaces stale work, hot projects, and active branches
- **Weekly Report** - generates a status summary using Claude (button-triggered)
- **Filter & search** across all conversations
- **One-click copy** of resume commands
- **Terminal-style UI** (monospace, minimal, dark theme)

## Quick Start

One-liner install:

```bash
curl -fsSL https://raw.githubusercontent.com/cozmic-creatives/claude-convos/main/install.sh | bash
```

This will:
- Clone the repo to `~/.convos` (or your chosen directory)
- Install dependencies and build
- Set up the `convos` alias in your shell
- Configure your preferred terminal for resuming conversations

Then just run `convos` to start!

### Manual Installation

```bash
git clone https://github.com/cozmic-creatives/claude-convos
cd claude-convos
npm install
npm start
```

Browser opens automatically at http://localhost:3847

## Usage

### Smart Resume

The dashboard automatically analyzes your conversations and surfaces:
- **Hot projects** - multiple conversations in the last few days
- **Stale work** - projects you haven't touched in 2-7 days
- **Active branches** - feature branches with recent activity

Click "resume" to copy the command for any suggestion.

### Generate Report

Click "generate report" to create a weekly status summary. This uses `claude -p` to analyze your recent conversations and produce a brief report of:
- Projects you've focused on
- Key tasks completed
- Patterns in your work

**Note:** Report generation uses your Claude CLI, so it will consume tokens. Only generated when you click the button.

### Filtering

- **Category**: Filter by Work, Side Projects, or Other
- **Time**: Show only Today, This Week, or This Month
- **Search**: Search across project names, topics, and git branches

### Resume a Conversation

Click "copy cmd" on any card, then paste in your terminal:

```bash
claude --resume <session-id>
```

## Configuration

### Custom Category Rules

Create a `config.json` file to customize categorization:

```json
{
  "categories": {
    "work": ["mycompany", "client-", "work/"],
    "sideProject": ["hobby-", "personal/", "learning/"]
  }
}
```

### Default Rules

- **Work**: Paths containing "bricsys", "company", "work", "client"
- **Side Project**: Paths containing "/projects/", "portfolio", "experiment", "learning"
- **Other**: Everything else

## Project Structure

```
claude-convos/
├── install.sh            # One-liner installer
├── index.js              # Entry point
├── package.json
├── config.json           # Custom category rules (optional)
├── src/
│   ├── server.js         # HTTP server
│   ├── scanner.js        # Conversation scanner + insights
│   ├── categorizer.js    # Auto-categorization
│   ├── reporter.js       # Claude-powered report generation
│   └── frontend/         # Svelte frontend
│       ├── App.svelte
│       ├── stores.js
│       └── components/
└── dist/                 # Built frontend (generated)
```

## How It Works

Claude Code stores conversations in `~/.claude/projects/` as JSONL files. This dashboard:

1. Scans all project directories
2. Parses first/last lines of each file for metadata
3. Extracts: session ID, timestamps, git branch, first user message
4. Categorizes based on project path
5. Generates smart insights (no Claude needed)
6. Serves a web dashboard for browsing

## Shell Alias

If you used the installer, the `convos` alias is already set up.

For manual installs, add to `~/.zshrc` or `~/.bashrc`:

```bash
export CONVOS_HOME="$HOME/path/to/claude-convos"
export CONVOS_TERMINAL="terminal"  # or: iterm, ghostty, kitty, alacritty, warp
alias convos='cd "$CONVOS_HOME" && npm start'
```

Then just run `convos` anytime.

## Requirements

- Node.js 18+
- Claude Code installed (with conversations in `~/.claude/`)
- Claude CLI configured (for report generation)

## License

MIT

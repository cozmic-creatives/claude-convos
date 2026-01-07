#!/bin/bash

# Claude Convos Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/cozmic-creatives/claude-convos/main/install.sh | bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

# Config
DEFAULT_INSTALL_DIR="$HOME/.convos"
REPO_URL="https://github.com/cozmic-creatives/claude-convos.git"
INSTALL_DIR=""
CLEANUP_ON_ERROR=false

# Cleanup trap
cleanup() {
  if $CLEANUP_ON_ERROR && [ -n "$INSTALL_DIR" ] && [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    echo -e "\n${YELLOW}Cleaned up partial installation${NC}"
  fi
}
trap cleanup EXIT

# Helpers
success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}!${NC} $1"; }

# Spinner for long operations
spin() {
  local pid=$1
  local msg=$2
  local spinchars='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local i=0
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  ${DIM}%s${NC} %s" "${spinchars:i++%10:1}" "$msg"
    sleep 0.1
  done
  printf "\r"
}

# Run command with spinner
run_with_spinner() {
  local msg=$1
  shift
  "$@" &>/dev/null &
  spin $! "$msg"
  wait $!
}

# Banner with blink animation
print_banner() {
  echo ""
  for _ in 1 2 3; do
    printf "\r  ${CYAN}(◕‿◕)${NC}  Hi! Let's set up Claude Convos"
    sleep 0.3
    printf "\r  ${CYAN}(─‿─)${NC}  Hi! Let's set up Claude Convos"
    sleep 0.15
  done
  printf "\r  ${CYAN}(◕‿◕)${NC}  Hi! Let's set up Claude Convos\n\n"
}

# Check prerequisites
check_prereqs() {
  echo "Checking prerequisites..."
  echo ""

  command -v git &>/dev/null || error "Git required - https://git-scm.com"
  success "git"

  command -v node &>/dev/null || error "Node.js 18+ required - https://nodejs.org"
  local node_ver=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  [ "$node_ver" -ge 18 ] || error "Node.js 18+ required (found v$node_ver)"
  success "node $(node -v)"

  command -v npm &>/dev/null || error "npm required"
  success "npm"
  echo ""
}

# Get install directory
get_install_dir() {
  printf "Install location [${DIM}%s${NC}]: " "$DEFAULT_INSTALL_DIR"
  read -r INSTALL_DIR </dev/tty || INSTALL_DIR=""
  INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
  INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"
  echo ""
}

# Clone repository
clone_repo() {
  if [ -d "$INSTALL_DIR" ]; then
    warn "Directory exists: $INSTALL_DIR"
    printf "Remove and reinstall? [y/N]: "
    read -r confirm </dev/tty || confirm=""
    [[ "$confirm" =~ ^[Yy]$ ]] || { echo "Cancelled."; exit 0; }
    rm -rf "$INSTALL_DIR"
  fi

  CLEANUP_ON_ERROR=true
  run_with_spinner "Cloning repository..." git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
  success "Cloned to $INSTALL_DIR"
}

# Install deps and build (combined)
setup_project() {
  cd "$INSTALL_DIR" || error "Cannot enter $INSTALL_DIR"

  run_with_spinner "Installing dependencies..." npm install --silent
  success "Dependencies installed"

  run_with_spinner "Building frontend..." npm run build --silent
  success "Built"

  CLEANUP_ON_ERROR=false
}

# Get terminal preference
get_terminal() {
  echo ""
  echo "Select your terminal:"
  echo -e "  ${DIM}1)${NC} terminal  ${DIM}(macOS default)${NC}"
  echo -e "  ${DIM}2)${NC} iterm"
  echo -e "  ${DIM}3)${NC} ghostty"
  echo ""
  printf "Choice [${DIM}1${NC}]: "
  read -r choice </dev/tty || choice=""

  case "$choice" in
    2) TERMINAL="iterm" ;;
    3) TERMINAL="ghostty" ;;
    *) TERMINAL="terminal" ;;
  esac
  success "Terminal: $TERMINAL"
}

# Setup shell config
setup_shell() {
  # Detect shell config
  if [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
  elif [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
  else
    SHELL_RC="$HOME/.profile"
  fi

  # Remove old config if exists
  if grep -q "# CONVOS START" "$SHELL_RC" 2>/dev/null; then
    sed -i.bak '/# CONVOS START/,/# CONVOS END/d' "$SHELL_RC"
  fi

  # Add new config
  cat >> "$SHELL_RC" << EOF

# CONVOS START
export CONVOS_HOME="$INSTALL_DIR"
export CONVOS_TERMINAL="$TERMINAL"
convos() {
  cd "\$CONVOS_HOME" || return
  git fetch -q
  if [ "\$(git rev-parse HEAD)" != "\$(git rev-parse @{u})" ]; then
    echo "Updating..."
    git pull -q && npm install --silent && npm run build --silent
    lsof -ti:3847 | xargs kill 2>/dev/null
    echo "Updated!"
  fi
  npm start
}
# CONVOS END
EOF

  success "Added to $(basename "$SHELL_RC")"
}

# Finish and launch
finish() {
  echo ""
  echo -e "${GREEN}Done!${NC} Launching convos..."
  echo ""

  # Source and run
  export CONVOS_HOME="$INSTALL_DIR"
  export CONVOS_TERMINAL="$TERMINAL"
  cd "$INSTALL_DIR" && npm start
}

# Main
main() {
  print_banner
  check_prereqs
  get_install_dir
  clone_repo
  setup_project
  get_terminal
  setup_shell
  finish
}

main

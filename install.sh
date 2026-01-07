#!/bin/bash

# Claude Convos Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/cozmic-creatives/claude-convos/main/install.sh | bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Default values
DEFAULT_INSTALL_DIR="$HOME/.convos"
REPO_URL="https://github.com/cozmic-creatives/claude-convos.git"

# Print banner
print_banner() {
  echo ""
  echo -e "${CYAN}    .--."
  echo "   |o_o |"
  echo -e "   |:_/ |   ${NC}Hi! Let's set up Claude Convos"
  echo -e "${CYAN}  //   \\ \\"
  echo " (|     | )"
  echo "/'\_   _/\`\\"
  echo -e "\\___)=(___)/${NC}"
  echo ""
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

error() {
  echo -e "${RED}✗ Error:${NC} $1"
  exit 1
}

warn() {
  echo -e "${YELLOW}!${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  echo "Checking prerequisites..."
  echo ""

  command -v git >/dev/null 2>&1 || error "Git is required. Install from https://git-scm.com"
  success "Git found"

  command -v node >/dev/null 2>&1 || error "Node.js 18+ required. Install from https://nodejs.org"
  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  [ "$NODE_VERSION" -ge 18 ] || error "Node.js 18+ required (found v$NODE_VERSION)"
  success "Node.js v$(node -v | cut -d'v' -f2) found"

  command -v npm >/dev/null 2>&1 || error "npm is required"
  success "npm found"
  echo ""
}

# Get install directory
get_install_dir() {
  echo "Where should we install Claude Convos?"
  printf "Directory [%s]: " "$DEFAULT_INSTALL_DIR"
  read -r INSTALL_DIR </dev/tty || INSTALL_DIR=""
  INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
  INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"
  echo ""
}

# Clone repository
clone_repo() {
  if [ -d "$INSTALL_DIR" ]; then
    warn "Directory already exists: $INSTALL_DIR"
    printf "Remove and reinstall? [y/N]: "
    read -r CONFIRM </dev/tty || CONFIRM=""
    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
      rm -rf "$INSTALL_DIR"
    else
      echo "Installation cancelled."
      exit 0
    fi
  fi

  echo "Cloning repository..."
  if git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" >/dev/null 2>&1; then
    success "Cloned to $INSTALL_DIR"
  else
    error "Failed to clone repository"
  fi
}

# Install dependencies
install_deps() {
  echo "Installing dependencies (this may take a moment)..."
  cd "$INSTALL_DIR" || error "Cannot enter $INSTALL_DIR"
  if npm install --silent >/dev/null 2>&1; then
    success "Dependencies installed"
  else
    error "Failed to install dependencies"
  fi
}

# Build frontend
build_frontend() {
  echo "Building frontend..."
  cd "$INSTALL_DIR" || error "Cannot enter $INSTALL_DIR"
  if npm run build --silent >/dev/null 2>&1; then
    success "Frontend built"
  else
    error "Failed to build frontend"
  fi
}

# Get terminal preference
get_terminal() {
  echo ""
  echo "Select your preferred terminal:"
  echo "  1) terminal   (macOS default)"
  echo "  2) iterm      (iTerm2)"
  echo "  3) ghostty"
  echo "  4) kitty"
  echo "  5) alacritty"
  echo "  6) warp"
  echo ""
  printf "Choice [1-6, default 1]: "
  read -r TERM_CHOICE </dev/tty || TERM_CHOICE=""

  case "$TERM_CHOICE" in
    2) TERMINAL="iterm" ;;
    3) TERMINAL="ghostty" ;;
    4) TERMINAL="kitty" ;;
    5) TERMINAL="alacritty" ;;
    6) TERMINAL="warp" ;;
    *) TERMINAL="terminal" ;;
  esac

  success "Terminal set to: $TERMINAL"
}

# Detect shell config
detect_shell_config() {
  if [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
  elif [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
  else
    SHELL_RC="$HOME/.profile"
  fi
}

# Setup shell alias
setup_shell() {
  detect_shell_config

  # Remove old config if exists
  if grep -q "# CONVOS START" "$SHELL_RC" 2>/dev/null; then
    sed -i.bak '/# CONVOS START/,/# CONVOS END/d' "$SHELL_RC"
  fi

  cat >> "$SHELL_RC" << EOF

# CONVOS START
export CONVOS_HOME="$INSTALL_DIR"
export CONVOS_TERMINAL="$TERMINAL"
alias convos='cd "\$CONVOS_HOME" && npm start'
# CONVOS END
EOF

  success "Added 'convos' alias to $(basename "$SHELL_RC")"
}

# Print completion
print_complete() {
  echo ""
  echo -e "${GREEN}Installation complete!${NC}"
  echo ""
  echo "  Run this to reload your shell:"
  echo -e "    ${CYAN}source $SHELL_RC${NC}"
  echo ""
  echo "  Then start the app:"
  echo -e "    ${CYAN}convos${NC}"
  echo ""
}

# Main
main() {
  print_banner
  check_prerequisites
  get_install_dir
  clone_repo
  install_deps
  build_frontend
  get_terminal
  setup_shell
  print_complete
}

main

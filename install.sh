#!/bin/bash

# Claude Convos Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/cozmic-creatives/claude-convos/main/install.sh | bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

# Print success checkmark
success() {
  echo -e "${GREEN}✓${NC} $1"
}

# Print error
error() {
  echo -e "${RED}✗ Error:${NC} $1"
  exit 1
}

# Print warning
warn() {
  echo -e "${YELLOW}!${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  echo "Checking prerequisites..."
  echo ""

  # Check git
  if ! command -v git &> /dev/null; then
    error "Git is required but not installed. Install it from https://git-scm.com"
  fi
  success "Git found"

  # Check node
  if ! command -v node &> /dev/null; then
    error "Node.js 18+ is required. Install it from https://nodejs.org"
  fi

  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ required (found v$NODE_VERSION). Update at https://nodejs.org"
  fi
  success "Node.js v$(node -v | cut -d'v' -f2) found"

  # Check npm
  if ! command -v npm &> /dev/null; then
    error "npm is required but not installed"
  fi
  success "npm found"
  echo ""
}

# Get install directory from user
get_install_dir() {
  echo -e "Where should we install Claude Convos?"
  read -p "Directory [$DEFAULT_INSTALL_DIR]: " INSTALL_DIR
  INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"

  # Expand ~ to home directory
  INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"

  echo ""
}

# Clone repository
clone_repo() {
  if [ -d "$INSTALL_DIR" ]; then
    warn "Directory already exists: $INSTALL_DIR"
    read -p "Remove and reinstall? [y/N]: " CONFIRM
    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
      rm -rf "$INSTALL_DIR"
    else
      echo "Installation cancelled."
      exit 0
    fi
  fi

  echo "Cloning repository..."
  git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" > /dev/null 2>&1
  success "Cloned to $INSTALL_DIR"
}

# Install dependencies
install_deps() {
  echo "Installing dependencies (this may take a moment)..."
  cd "$INSTALL_DIR"
  npm install --silent > /dev/null 2>&1
  success "Dependencies installed"
}

# Build frontend
build_frontend() {
  echo "Building frontend..."
  cd "$INSTALL_DIR"
  npm run build --silent > /dev/null 2>&1
  success "Frontend built"
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
  read -p "Choice [1-6, default 1]: " TERM_CHOICE

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

# Detect shell config file
detect_shell_config() {
  if [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
  elif [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
  else
    SHELL_RC="$HOME/.profile"
  fi
}

# Add alias and config to shell
setup_shell() {
  detect_shell_config

  # Remove old config if exists (idempotent)
  if grep -q "# CONVOS START" "$SHELL_RC" 2>/dev/null; then
    # Create backup and remove old config
    sed -i.bak '/# CONVOS START/,/# CONVOS END/d' "$SHELL_RC"
  fi

  # Add new config
  cat >> "$SHELL_RC" << EOF

# CONVOS START
export CONVOS_HOME="$INSTALL_DIR"
export CONVOS_TERMINAL="$TERMINAL"
alias convos='cd "\$CONVOS_HOME" && npm start'
# CONVOS END
EOF

  success "Added 'convos' alias to $(basename $SHELL_RC)"
}

# Print completion message
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

# Main installation flow
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

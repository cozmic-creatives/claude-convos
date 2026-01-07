import { spawn } from 'child_process';

// Terminal launch configurations (macOS)
const LAUNCHERS = {
  terminal: (cwd, cmd) => ({
    cmd: 'osascript',
    args: ['-e', `tell app "Terminal" to do script "cd '${cwd}' && ${cmd}"`]
  }),
  iterm: (cwd, cmd) => ({
    cmd: 'osascript',
    args: ['-e', `tell app "iTerm" to create window with default profile command "cd '${cwd}' && ${cmd}"`]
  }),
  ghostty: (cwd, cmd) => ({
    cmd: 'osascript',
    args: [
      '-e', 'tell app "Ghostty" to activate',
      '-e', `tell app "System Events" to keystroke "t" using command down`,
      '-e', 'delay 0.3',
      '-e', `tell app "System Events" to keystroke "cd '${cwd}' && ${cmd}"`,
      '-e', 'tell app "System Events" to key code 36'
    ]
  })
};

/**
 * Launch terminal with claude --resume command
 * @param {string} sessionId - Session ID to resume
 * @param {string} projectPath - Directory to open terminal in
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export function launchTerminal(sessionId, projectPath) {
  const terminal = process.env.CONVOS_TERMINAL || 'terminal';
  const launcher = LAUNCHERS[terminal];

  if (!launcher) {
    return Promise.resolve({
      success: false,
      error: `Unknown terminal: ${terminal}. Supported: ${Object.keys(LAUNCHERS).join(', ')}`
    });
  }

  const command = `claude --resume ${sessionId}`;
  const { cmd, args } = launcher(projectPath, command);

  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore'
    });

    proc.on('error', (err) => {
      resolve({
        success: false,
        error: err.code === 'ENOENT'
          ? `Terminal command not found: ${cmd}`
          : `Failed to launch terminal: ${err.message}`
      });
    });

    proc.unref();
    setTimeout(() => resolve({ success: true }), 100);
  });
}

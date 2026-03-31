/*
 * ATALHO GLOBAL PARA DESKTOP (IMPLEMENTAR NO FUTURO)
 *
 * Quando o Lontra virar app desktop com Electron:
 *
 * const { globalShortcut } = require('electron')
 *
 * globalShortcut.register('CommandOrControl+Shift+N', () => {
 *   mainWindow.show()
 *   mainWindow.focus()
 *   mainWindow.webContents.send('open-quick-note')
 * })
 *
 * Com Tauri:
 * import { register } from '@tauri-apps/api/globalShortcut'
 * await register('CommandOrControl+Shift+N', () => {
 *   invoke('open_quick_note_window')
 * })
 *
 * O atalho global funciona mesmo com o app minimizado ou
 * sem foco — o usuário pode estar no VS Code e apertar
 * Ctrl+Shift+N para abrir o Lontra direto na interface de IA.
 */

export const QUICK_NOTE_SHORTCUT = 'Ctrl+Shift+K';
export const QUICK_NOTE_SHORTCUT_MAC = 'Cmd+Shift+K';

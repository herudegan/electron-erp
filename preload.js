const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeRestoreWindow: () => ipcRenderer.send('maximize-restore-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  openMenu: () => ipcRenderer.send('open-menu')
})

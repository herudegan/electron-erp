const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeRestoreWindow: () => ipcRenderer.send('maximize-restore-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  openMenu: () => ipcRenderer.send('open-menu'),


  // Database
  clients: {
    select: () => ipcRenderer.invoke('clients:select'),
    insert: (client) => ipcRenderer.invoke('clients:insert', client),
    update: (client) => ipcRenderer.invoke('clients:update', client),
    delete: (id) => ipcRenderer.invoke('clients:delete', id)
  },
  products: {
    select: () => ipcRenderer.invoke('products:select'),
    insert: (product) => ipcRenderer.invoke('products:insert', product),
    update: (product) => ipcRenderer.invoke('products:update', product),
    delete: (id) => ipcRenderer.invoke('products:delete', id)
  }
})

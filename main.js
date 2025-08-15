const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const createWindow = (page) => {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false, // Disabled for security
      contextIsolation: true, // Enabled for security
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    show: false,
  })

  win.maximize()
  win.show()

  win.loadFile(page)

  ipcMain.on('minimize-window', () => {
    win.minimize()
  })

  ipcMain.on('maximize-restore-window', () => {
    if (win.isMaximized()) {
      win.restore()
    } else {
      win.maximize()
    }
  })

  ipcMain.on('close-window', () => {
    win.close()
  })
}

app.whenReady().then(() => {
  createWindow("app/index.html")
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
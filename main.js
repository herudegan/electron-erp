const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
require('dotenv').config()
const { getSupabase } = require('./supabaseClient')

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

  
  // IPC Database handling
  ipcMain.handle('clients:select', async (_evt) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('clients').select('*');
      if (error) return { error: { message: error.message, details: error.details } };
      return { data };
    } catch (err) {
      return { error: { message: err.message || String(err) } };
    }
  })
  ipcMain.handle('clients:insert', async (_evt, client) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('clients').insert([
        { cnpj: client.cnpj, name: client.name, email: client.email }
      ]);
      if (error) return { error: { message: error.message, details: error.details } };
      return { data };
    } catch (err) {
      return { error: { message: err.message || String(err) } };
    }
  })
  ipcMain.handle('clients:update', async (_evt, client) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('clients').update([
        { cnpj: client.cnpj, name: client.name, email: client.email }
    ]).eq('id_client', client.editingId);
      if (error) return { error: { message: error.message, details: error.details } };
      return { data };
    } catch (err) {
      return { error: { message: err.message || String(err) } };
    }
  })
  ipcMain.handle('clients:delete', async (_evt, id) => {
    try {
      const supabase = getSupabase();
    const { data, error } = await supabase.from('clients').delete().eq('id_client', id);
      if (error) return { error: { message: error.message, details: error.details } };
      return { data };
    } catch (err) {
      return { error: { message: err.message || String(err) } };
    }
  })

  // Products IPC
  ipcMain.handle('products:select', async (_evt) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('products').select('*');
      if (error) return { error: { message: error.message, details: error.details } };
      return { data };
    } catch (err) {
      return { error: { message: err.message || String(err) } };
    }
  })
  ipcMain.handle('products:insert', async (_evt, product) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('products').insert([
        { name: product.name, sku: product.sku, price: product.price }
      ]);
      if (error) return { error: { message: error.message, details: error.details } };
      return { data };
    } catch (err) {
      return { error: { message: err.message || String(err) } };
    }
  })
  ipcMain.handle('products:update', async (_evt, product) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('products').update([
        { name: product.name, sku: product.sku, price: product.price }
      ]).eq('id_product', product.editingId);
      if (error) return { error: { message: error.message, details: error.details } };
      return { data };
    } catch (err) {
      return { error: { message: err.message || String(err) } };
    }
  })
  ipcMain.handle('products:delete', async (_evt, id) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('products').delete().eq('id_product', id);
      if (error) return { error: { message: error.message, details: error.details } };
      return { data };
    } catch (err) {
      return { error: { message: err.message || String(err) } };
    }
  })
}




app.whenReady().then(() => {
  createWindow("app/index.html")
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
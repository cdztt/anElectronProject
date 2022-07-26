'use strict'

const { ipcRenderer } = require('electron')
window._ipcRenderer = ipcRenderer

const os = require('os')
const localIP = os.networkInterfaces().WLAN[1].address
window._localIP = localIP

const http = require('http')
window._server = http.createServer()

import formidable from 'formidable'
window._formidable = formidable

const path = require('path')
window._path = path

const fs = require('fs')
window._fs = fs


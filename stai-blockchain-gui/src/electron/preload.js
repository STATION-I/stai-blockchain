const { ipcRenderer,shell } = require('electron');

const geoip =require("geoip-lite");

window.ipcRenderer = ipcRenderer;
window.shell = shell;
window.geoip = geoip;
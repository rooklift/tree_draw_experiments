"use strict";

const electron = require("electron");
const path = require("path");
const url = require("url");

const alert = require("./modules/alert_main");
const config_io = require("./modules/config_io");
const stringify = require("./modules/stringify");

config_io.load();
let config = config_io.config;

let menu = menu_build();
let win;						// We're supposed to keep global references to every window we make.

if (electron.app.isReady()) {
	startup();
} else {
	electron.app.once("ready", () => {
		startup();
	});
}

// --------------------------------------------------------------------------------------------------------------

const save_dialog = electron.dialog.showSaveDialogSync || electron.dialog.showSaveDialog;
const open_dialog = electron.dialog.showOpenDialogSync || electron.dialog.showOpenDialog;

// --------------------------------------------------------------------------------------------------------------

function startup() {

	win = new electron.BrowserWindow({
		width: config.width,
		height: config.height,
		backgroundColor: "#000000",
		resizable: true,
		show: false,
		useContentSize: true,
		webPreferences: {
			backgroundThrottling: false,
			contextIsolation: false,
			nodeIntegration: true,
			spellcheck: false,
			zoomFactor: 1 / electron.screen.getPrimaryDisplay().scaleFactor		// Unreliable, see https://github.com/electron/electron/issues/10572
		}
	});

	win.once("ready-to-show", () => {
		try {
			win.webContents.setZoomFactor(1 / electron.screen.getPrimaryDisplay().scaleFactor);	// This seems to work, note issue 10572 above.
		} catch (err) {
			win.webContents.zoomFactor = 1 / electron.screen.getPrimaryDisplay().scaleFactor;	// The method above "will be removed" in future.
		}
		win.show();
		win.focus();
	});

	electron.app.on("window-all-closed", () => {
		electron.app.quit();
	});

	electron.ipcMain.on("alert", (event, msg) => {
		alert(msg);
	});

	// Actually load the page last, I guess, so the event handlers above are already set up.
	// Send some possibly useful info as a query.

	let query = {};
	query.user_data_path = electron.app.getPath("userData");

	win.loadFile(
		path.join(__dirname, "renderer.html"),
		{query: query}
	);

	electron.Menu.setApplicationMenu(menu);
}

// --------------------------------------------------------------------------------------------------------------

function menu_build() {
	const template = [
		{
			label: "App",
			submenu: [
				{
					label: "About",
					click: () => {
						alert(`${electron.app.getName()} (${electron.app.getVersion()}) in Electron (${process.versions.electron})`);
					}
				},
				{
					type: "separator",
				},
				{
					role: "toggledevtools"
				},
				{
					label: `Show ${config_io.filename}`,
					click: () => {
						electron.shell.showItemInFolder(config_io.filepath);
					}
				},
				{
					type: "separator",
				},
				{
					label: "Open SGF...",
					accelerator: "CommandOrControl+O",
					click: () => {
						let files = open_dialog();
						if (Array.isArray(files) && files.length > 0) {
							win.webContents.send("call", {
								fn: "open",
								args: [files[0]]
							});
						}
					}
				},
				{
					label: "Redraw",
					click: () => {
						win.webContents.send("call", "draw");
					}
				},
				{
					type: "separator",
				},
				{
					label: "Quit",
					accelerator: "CommandOrControl+Q",
					role: "quit"
				},
			]
		},
	];

	return electron.Menu.buildFromTemplate(template);
}


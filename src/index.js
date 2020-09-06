#!/usr/bin/env node
const fs = require('fs')
const util = require('util')
const childProcess = require('child_process')
const exec = childProcess.exec
const spawn = childProcess.spawn
const path = require('path')

const filename = path.resolve(process.argv[2])
const autoExport = process.argv[3]

const gi = require('node-gtk')

const Gtk = gi.require('Gtk', '3.0')
const Gdk = gi.require('Gdk')
const Pango = gi.require('Pango')
const Vte = gi.require('Vte')
const GLib = gi.require('GLib')
const WebKit2 = gi.require('WebKit2')

const ncp = require('copy-paste')
const ChildProcess = require('child_process')

let engine = { exportForOtherBrowsers: () => '' }

// Start the GLib event loop
gi.startLoop()

// Necessary to initialize the graphic environment.
// If this fails it means the host cannot show Gtk-3.0
Gtk.init()

console.log('initialized')

// Main program window
const window = new Gtk.Window({
	type: Gtk.WindowType.TOPLEVEL,
})

window.setTitle(path.dirname(filename).split('/').pop())

function getAllFuncs(obj) {
	let methods = []
	while ((obj = Reflect.getPrototypeOf(obj))) {
		let keys = Reflect.ownKeys(obj)
		keys.forEach((k) => methods.push(k))
	}
	return methods
}

const terminal = new Vte.Terminal()

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

const colors = {
	background: '255,255,255',
	foreground: '43,42,42',
	bold: '0,0,0',
}

Object.getOwnPropertyNames(colors).forEach((id) => {
	const color = colors[id]
	colors[id] = new Gdk.RGBA()
	colors[id].parse('rgb(' + color + ')')
	terminal['setColor' + capitalize(id)](colors[id])
})

//TODO : add options to customize apparence
//terminal.setFont(Pango.fontDescriptionFromString(''))
//terminal.setFont(Pango.fontDescriptionFromString('Courier 10 Pitch; Normal 8'))

/*const termStyle = terminal.getStyle()
termStyle.
terminal.setStyle(termStyle)*/

//terminal.setSize(132, 69)

terminal.setInputEnabled(true)

const webView = new WebKit2.WebView()

const hbox = new Gtk.Box({
	orientation: Gtk.Orientation.HORIZONTAL,
})
const vbox = new Gtk.Box({
	orientation: Gtk.Orientation.VERTICAL,
})
const toolbar = new Gtk.Toolbar()

console.log('before set zoom')

//TODO : calculate zoom factor on start depending on window width
/*webView.on('size-allocate', rectangle => {
	console.log('size-allocated:' + rectangle.width / 793.688)
	console.log('zoom-level : ' + JSON.stringify(webView.getZoomLevel()))
	webView.setZoomLevel(rectangle.width / 793.688)
})*/

webView.setZoomLevel(0.86)

vbox.packStart(terminal, true, true, 0)
vbox.packStart(toolbar, false, false, 0)

const button = {
	print: Gtk.ToolButton.newFromStock(Gtk.STOCK_PRINT),
	html: Gtk.ToolButton.newFromStock(Gtk.STOCK_HARDDISK),
	newImage: Gtk.ToolButton.newFromStock(
		Gtk.STOCK_COLOR_PICKER
	),
	hidePreview: Gtk.ToolButton.newFromStock(Gtk.STOCK_EDIT),
	copy: Gtk.ToolButton.newFromStock(Gtk.STOCK_COPY),
	paste: Gtk.ToolButton.newFromStock(Gtk.STOCK_PASTE),
	reloadImages: Gtk.ToolButton.newFromStock(
		Gtk.STOCK_REFRESH
	),
}

Object.getOwnPropertyNames(button).forEach((id) =>
	toolbar.add(button[id])
)

button.reloadImages.on('clicked', () => {
	const code = `(()=>{
		mde.reloadImages()
	})()`

	webView.runJavascript(code, null, () => {}, {})
})

button.copy.on('clicked', () => {
	terminal.copyClipboard()
	const cpb = terminal.getClipboard(Gdk.SELECTION_CLIPBOARD)
	console.log(cpb)
})

button.paste.on('clicked', async () => {
	ncp.paste((err, esc) => {
		//	const esc = await clipboardy.read();
		console.log(err)
		console.log(esc)

		esc = Array.from(esc).reduce((sum, e, id) => {
			sum.push(esc.charCodeAt(id))
			return sum
		}, [])

		terminal.feedChildBinary(esc, esc.length)
	})
})

let webkitVisibility = true
button.hidePreview.on('clicked', () => {
	if (webkitVisibility) {
		webkitVisibility = false
		webView.hide()
	} else {
		webkitVisibility = true
		webView.show()
	}
})

let lastRender = ''

const htmlExport = () =>
	new Promise(async (resolve, reject) => {
		//const printOperation = WebKit2.printOperationNew(webView)
		const htmlFilename =
			path.resolve(
				path.dirname(filename),
				path.basename(filename, path.extname(filename))
			) + '.html'

		console.log(htmlFilename)

		const body = fs
			.readFileSync(
				path.resolve(__dirname, '../') +
					'/front/body.html',
				'utf-8'
			)
			.toString()

		const html =
			body +
			(await engine.exportForOtherBrowsers()) +
			'</main></body></html>' //TODO : Beurkkkkkkk   beautify that shit

		fs.writeFile(htmlFilename, html, (err) => {
			if (err) throw err
			console.log('The html file has been saved!')
			resolve(htmlFilename)
		})
	})

const pdfConversion = (htmlFilename) =>
	new Promise(async (resolve, reject) => {
		ls = spawn(
			'/home/epakompri/Documents/scripts/convertToMD/front/app/convertToPDF.sh',
			[htmlFilename]
		)
		// the second arg is the command options

		ls.stdout.on('data', function (data) {
			// register one or more handlers
			//console.log('stdout: ' + data)
		})

		ls.stderr.on('data', function (data) {
			console.log('stderr: ' + data)

			try {
				if (
					data
						.toString()
						.split('\n')
						.map((e) => e.trim())
						.includes(
							"pdfjam: Finished.  Output was to 'out-cli-2pp.pdf'."
						)
				) {
					resolve()
					//here script end
					//webView.runJavascript(`alert('fichier exporté')`, null, ()=>{}, {})
				}
			} catch (error) {
				console.log(error)
			}
		})

		ls.on('exit', function (code) {
			console.log('child process exited with code ' + code)
		})
	})

button.html.on('clicked', htmlExport)

button.print.on('clicked', async () => {
	const htmlFilename = await htmlExport()
	await pdfConversion(htmlFilename)

	/*
	() => {
		//const printOperation = WebKit2.printOperationNew(webView)
		const code = 'window.print()'

		webView.runJavascript(code, null, () => {}, {})
	})*/
})

button.newImage.on('clicked', () => {
	//require to be in write mode

	getFreeFilename((newFilename) => {
		console.log(newFilename)

		let esc = `![](${path.basename(newFilename)})`
		esc = Array.from(esc).reduce((sum, e, id) => {
			sum.push(esc.charCodeAt(id))
			return sum
		}, [])

		terminal.feedChildBinary(esc, esc.length)

		fs.copyFile(
			path.resolve(__dirname, '../') +
				'/front/images/empty.png',
			newFilename,
			(err) => {
				if (err) console.error(err)

				const child = ChildProcess.spawn(
					'gimp',
					[newFilename],
					{
						detached: true,
						stdio: ['ignore', 'ignore', 'ignore'],
					}
				)
				child.unref()
			}
		)
	})

	function getFreeFilename(cb, id = '') {
		const formatLength = function (str) {
			str = str.toString()
			return '00'.slice(str.length) + str
		}

		const now = new Date()

		const newFilename =
			path.resolve(
				path.dirname(filename),
				path.basename(filename, path.extname(filename))
			) +
			'-' +
			now.getFullYear() +
			'-' +
			formatLength(now.getMonth() + 1) +
			'-' +
			formatLength(now.getDate()) +
			'-' +
			formatLength(now.getHours()) +
			':' +
			formatLength(now.getMinutes()) +
			':' +
			formatLength(now.getSeconds()) +
			(id !== '' ? '-' + id : '') +
			'.png'

		// Check if the file exists in the current directory.
		fs.access(newFilename, fs.constants.F_OK, (err) => {
			if (err) {
				cb(newFilename)
			} else {
				if (id === '') id = 0
				id++
				getFilename(cb, id)
			}
		})
	}
})

toolbar.setIconSize(Gtk.IconSize.SMALL_TOOLBAR)

hbox.packStart(vbox, true, true, 0)
hbox.packStart(webView, true, true, 0)
hbox.setHomogeneous(true)

window.add(hbox)
window.setResizable(true)
window.maximize()
/*
 * Settings
 */

// Setting up optional Dark theme (gotta love it!)
//if (process.argv.some(color => color === 'dark')) {
let gtkSettings = Gtk.Settings.getDefault()
gtkSettings.gtkApplicationPreferDarkTheme = false
gtkSettings.gtkThemeName = 'Adwaita'
//}

// Update some webview settings
const webSettings = webView.getSettings()
webSettings.enableDeveloperExtras = true
webSettings.enableCaretBrowsing = true
webSettings.setEnableSmoothScrolling(false)
webSettings.enableFileAccessFromFileUris = true
webSettings.allowFileAccessFromFileUrls = true
webSettings.allowUniversalAccessFromFileUrls = true
webSettings.setEnablePageCache(false)
webSettings.enablePageCache = false

/*
 * Event handlers
 */

window.on('show', async () => {
	// bring it on top in OSX
	// window.setKeepAbove(true)

	// This start the Gtk event loop. It is required to process user events.
	// It doesn't return until you don't need Gtk anymore, usually on window close.
	// Gtk.main()

	if (
		autoExport === 'exportPdf' ||
		autoExport === 'exportHtml'
	) {
		window.hide()
	}

	//HACK: GTK block the event loop, this hack with intervals preserve from it

	let interval
	let runMainLoop = true
	let count = 0

	interval = setInterval(() => {
		if (runMainLoop !== true) {
			clearInterval(interval)
		}

		if (count === 0) {
			count++
			Gtk.mainIterationDo(false)
		}

		Gtk.mainIterationDo(false)
	}, 0)
	//	setInterval(() => console.log('interval before work'), 1500)
	let inter = setInterval(() => {
		clearInterval(inter)
		//	console.log('before work')
		//setInterval(() => console.log('new interval after work'), 5000)

		engine = require('./engine.js')(filename, true)
		let previousScrolling = 0

		let stack = []

		engine.on('append', (output) => {
			stack.push([
				'append',
				{
					output: output.output,
					beforeId: output.beforeId,
				},
			])
		})

		engine.on('delete', (keepIds) => {
			console.log('delete', keepIds)

			stack.push(['delete', keepIds])
		})

		engine.on('order', (tree) => {
			stack.push(['order', tree])
		})

		const getPreviousScrolling = () => {
			const tmp = webView.getTitle()
			let previousScrolling = 0

			if (tmp !== '') {
				;[previousScrolling, atEndOfPage] = JSON.parse(
					webView.getTitle().toString()
				)
				if (atEndOfPage)
					previousScrolling += Math.pow(3520, 2)
			}

			return previousScrolling
		}

		engine.on('releaseStack', async (tree) => {
			if (autoExport === 'exportPdf') {
				const htmlFilename = await htmlExport()
				await pdfConversion(htmlFilename)

				process.exit()
			} else {
				stack.push(['scrollTo', getPreviousScrolling()])

				const code = `(async ()=>{
					await mde.releaseStack(${JSON.stringify(
						stack.map((e) => e)
					)})
				})()`

				stack = []

				await new Promise((resolve, reject) =>
					webView.runJavascript(code, null, resolve, {})
				)
			}
		})

		engine.on('load', async () => {
			//console.log('load fiored')
			console.log(engine.cmd)

			const editor = '/usr/bin/nvim'

			terminal.spawnSync(
				Vte.PtyFlags.DEFAULT,
				//require('os').homedir(),
				path.resolve(__dirname, '../../'),
				[editor, filename, '--cmd', engine.cmd, '-V0'],
				['/bin/bash'],
				GLib.SpawnFlags.DO_NOT_REAP_CHILD,
				() => {
					//console.log('setup')

					//TODO : correct nvim size bug, actually not working
					window.unmaximize()
					window.maximize()
					window.unmaximize()
					window.maximize()
				}
			)
			terminal.setFontScale(0.8)

			webView.loadUri(
				'file://' +
					path.resolve(__dirname, '../') +
					'/front/body.html'
			)
		})
	}, 1000)
	Gtk.main()
})

window.on('destroy', () => {
	process.exit()

	return Gtk.mainQuit()
})

webView.loadUri('http://localhost:3001/sample.html')
webView.loadHtml(
	`<p>editor is loading the file.<br>
	If this message doesn't disapear in seconds, please restart the editor<p>`,
	'file:///404.html'
)

window.showAll()

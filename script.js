#!/usr/bin/env node
const fs = require('fs')

const style = fs
	.readFileSync(__dirname + '/front/style.css', 'utf-8')
	.toString()

const body = eval(
	'`' +
		fs
			.readFileSync(__dirname + '/front/body.html', 'utf-8')
			.toString() +
		'`'
) //require body and inject inside the css style

/*
 * A basic node-gtk Webkit based browser example.
 * Similar logic and basic interface found in this PyGTK example:
 * http://www.eurion.net/python-snippets/snippet/Webkit%20Browser.html
 */
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

console.log('title set')

function getAllFuncs(obj) {
	let methods = []
	while ((obj = Reflect.getPrototypeOf(obj))) {
		let keys = Reflect.ownKeys(obj)
		keys.forEach((k) => methods.push(k))
	}
	return methods
}

const terminal = new Vte.Terminal()

//const internal = require('node-gtk/lib/native.js')
//internal.ObjectPropertySetter(terminal, 'spawn_sync', 1)

//console.log(getAllFuncs(terminal))
//console.log(getAllFuncs(new Vte.Pty()))
//console.log(Vte)

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

const colors = {
	background: '255,255,255',
	foreground: '43,42,42',
	//foreground:'0,0,0',
	bold: '0,0,0',
}

Object.getOwnPropertyNames(colors).forEach((id) => {
	const color = colors[id]
	colors[id] = new Gdk.RGBA()
	colors[id].parse('rgb(' + color + ')')
	terminal['setColor' + capitalize(id)](colors[id])
})

//terminal.setFont(Pango.fontDescriptionFromString(''))
//terminal.setFont(Pango.fontDescriptionFromString('Courier 10 Pitch; Normal 8'))

terminal.setInputEnabled(true)

//console.log('before webview')

/*const termStyle = terminal.getStyle()
termStyle.
terminal.setStyle(termStyle)*/

//terminal.setSize(132, 69)

const webView = new WebKit2.WebView()
/*webView.on('size-allocate', rectangle => {
	console.log('size-allocated:' + rectangle.width / 793.688)
	console.log('zoom-level : ' + JSON.stringify(webView.getZoomLevel()))
	webView.setZoomLevel(rectangle.width / 793.688)
})*/
const hbox = new Gtk.Box({
	orientation: Gtk.Orientation.HORIZONTAL,
})
const vbox = new Gtk.Box({
	orientation: Gtk.Orientation.VERTICAL,
})
const toolbar = new Gtk.Toolbar()

console.log('before set zoom')

webView.setZoomLevel(0.86)

/*
console.log('before screen')

const screen = window.getScreen()

console.log('after screen')
*/
vbox.packStart(terminal, true, true, 0)
vbox.packStart(toolbar, false, false, 0)

//console.log('before buttons')

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

const dblclick = `async (e)=>{
	const result = await rq('http://127.0.0.1:3045/open/' + encodeURIComponent(JSON.stringify({file: img.src.replace('file://', '')})))
	.catch(console.error)

	console.log(result)
}`

button.reloadImages.on('clicked', () => {
	const code = `
	(()=>{
		scrollState = window.pageYOffset
		d = new Date()
		const s = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

		Array.from(document.querySelectorAll('img')).forEach(e=>{
			window.URL.revokeObjectURL(e.src)

			let img = document.createElement('img')
			/*img.onload = ()=>{
				console.log('image fully loaded, scrolling to previous scrollState')
				window.scrollTo(0, scrollState)
			}
			img.addEventListener('load', img.onload);*/
			img.src = e.src+'?t='+d.getTime()
			if(e.classList.contains('alted')) img.classList.add('alted')
			img.style = e.style
			img.ondblclick = ${dblclick}
			e.src = s //trick to clean cache
			e.parentNode.insertBefore(img, e)
			e.parentNode.removeChild(e)
			setTimeout(()=>{e = null}, 1000) //trick to clean cache
		})
	})()`

	webView.runJavascript(code, null, () => {}, {})
})

function filterIt(obj, searchKey) {
	let reg = new RegExp(searchKey, 'gi')
	return Object.getOwnPropertyNames(obj).filter(function (
		key
	) {
		return key.match(reg)
	})
}
//console.log(filterIt(Gdk, 'selection'))
//window.clipboard = Gtk.Clipboard.get(Gdk.selectionClipboard)

button.copy.on('clicked', () => {
	terminal.copyClipboard()
	const cpb = terminal.getClipboard(Gdk.SELECTION_CLIPBOARD)
	console.log(cpb)
	//terminal.copyClipboardFormat(Vte.FORMAT_TEXT)
})

const ncp = require('copy-paste')

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

		//let wb = webView.get

		const html =
			body +
			(await engine.exportForOtherBrowsers()) +
			'</body></html>'

		fs.writeFile(htmlFilename, html, (err) => {
			if (err) throw err
			console.log('The html file has been saved!')
			resolve(htmlFilename)
		})
	})

const pdfConversion = (htmlFilename) =>
	new Promise(async (resolve, reject) => {
		const util = require('util')
		const exec = require('child_process').exec
		const spawn = require('child_process').spawn

		ls = spawn(
			'/home/epakompri/Documents/scripts/convertToMD/front/app/convertToPDF.sh',
			[htmlFilename]
		)
		// the second arg is the command
		// options

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

		/*const child = exec('./cleanPdf.sh out-cli.pdf out-cli.pdf', // command line argument directly in string
		function (error, stdout, stderr) {
			// one easy function to capture data/errors
			
			console.log('stdout: ' + stdout)
			console.log('stderr: ' + stderr)
			if (error !== null) {
				console.log('exec error: ' + error)
			}
		})*/
	})

button.html.on('clicked', htmlExport)

button.print.on('clicked', async () => {
	const htmlFilename = await htmlExport()
	await pdfConversion(htmlFilename)
})
/*
() => {
	//const printOperation = WebKit2.printOperationNew(webView)
	const code = 'window.print()'

	webView.runJavascript(code, null, () => {}, {})
})*/

button.newImage.on('clicked', () => {
	getFilename((newFilename) => {
		console.log(newFilename)

		let esc = `![sketch](${path.basename(newFilename)})`
		esc = Array.from(esc).reduce((sum, e, id) => {
			sum.push(esc.charCodeAt(id))
			return sum
		}, [])

		terminal.feedChildBinary(esc, esc.length)

		fs.copyFile(
			__dirname + '/empty.png',
			newFilename,
			(err) => {
				if (err) console.error(err)

				const cp = require('child_process')
				const child = cp.spawn('gimp', [newFilename], {
					detached: true,
					stdio: ['ignore', 'ignore', 'ignore'],
				})
				child.unref()
			}
		)
	})

	function getFilename(cb, id = '') {
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
			formatLength(now.getDate()) +
			'-' +
			formatLength(now.getMonth() + 1) +
			'-' +
			now.getFullYear() +
			'-' +
			formatLength(now.getHours()) +
			':' +
			formatLength(now.getMinutes()) +
			':' +
			formatLength(now.getSeconds()) +
			(id !== '' ? '-' + id : '') +
			'.png'

		//console.log(filename)

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

// whenever a new page is loaded ...
webView.on('load-changed', (loadEvent) => {
	switch (loadEvent) {
		case WebKit2.LoadEvent.COMMITTED:
			// Update the URL bar with the current adress
			//urlBar.setText(webView.getUri())
			//button.back.setSensitive(webView.canGoBack())
			//button.forward.setSensitive(webView.canGoForward())
			break
	}
})

// configure buttons actions
//button.refresh.on('clicked', webView.reload)

//console.log('before show')

window.on('show', async () => {
	// bring it on top in OSX
	// window.setKeepAbove(true)
	// This start the Gtk event loop. It is required to process user events.
	// It doesn't return until you don't need Gtk anymore, usually on window close.
	/*console.log('main')
	Gtk.main()*/
	if (
		autoExport === 'exportPdf' ||
		autoExport === 'exportHtml'
	) {
		window.hide()
	}

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
			//console.log('after main')
		}
		//console.log('iterationfalse')
		Gtk.mainIterationDo(false)
	}, 0)
	//	setInterval(() => console.log('interval before work'), 1500)
	let inter = setInterval(() => {
		clearInterval(inter)
		//	console.log('before work')
		//setInterval(() => console.log('new interval after work'), 5000)

		engine = require('./md2html/engine.js')(filename, true)
		let previousScrolling = 0

		let stack = []

		engine.on('append', (output) => {
			const code = `(async ()=>{
				const wrapper= document.createElement('div');
				wrapper.innerHTML= ${JSON.stringify(output.output)}

				Array.from(wrapper.querySelectorAll('span.img + br + br + span.img')).forEach(e=>{
					e.parentNode.removeChild(e.previousElementSibling)
					e.parentNode.removeChild(e.previousElementSibling)
				})
				/*Array.from(wrapper.querySelectorAll('img')).map(e=>e.parentNode).forEach(e=>{
					const br = document.createElement('br')
					br.style = "display: table; width: 100%; content: '\A';"
					e.parentNode.insertBefore(br, e)
				})
				
				
				Array.from(wrapper.querySelectorAll('img')).forEach(img=>{
					const span = document.createElement('span')
					span.textContent = img.getAttribute('alt')
					if(span.textContent === '0'){
						span.textContent = ''
						img.style['margin-top'] = '0px'
					}
					span.setAttribute('width', img.getAttribute('width'))
					img.setAttribute('width', 'auto')

					img.parentNode.appendChild(span)
					span.appendChild(img)
					span.style = "max-width:100%; float: left; display: table;border: solid 1px #c6c6c6; text-align: center; margin-right: 10px; font-style: italic; color: #141414;"
				})*/
				

				insertAfter(wrapper.firstChild, await waitElement('#${
					output.beforeId
				}'))
				
				
			})()`
			stack.push(code)
			//webView.runJavascript(code, null, output.cb, {})
		})

		engine.on('delete', (keepIds) => {
			console.log('delete', keepIds)

			const code = `(async ()=>{
				const keepIds = ${JSON.stringify(keepIds)}
				console.log('delete', keepIds)

				Array.from(document.querySelectorAll('body > div:not(#init)')).forEach(el=>{
					if(!keepIds.includes(el.id)){
						console.log('remove', el.id)
						el.parentNode.removeChild(el)
						el = null
					}
				})
				
				/*ids.forEach(id=>{
					console.log('delete', id)

					try{
						let el = document.querySelector('#'+id)
						el.parentNode.removeChild(el)
						el = null
					}catch(err){
						console.log(err)
					}
				})*/
			})()`
			stack.push(code)
			//webView.runJavascript(code, null, ()=>{}, {})
		})

		engine.on('order', (tree) => {
			const code = `(async ()=>{
				const tree = ${JSON.stringify(tree)}

				await Promise.all(tree.map(async ([e, previous], id)=>{
					/*if(id === 0)
						previous = 'init'
					else
						previous = tree[id - 1]
*/
					if(e === 'a4870605ca6bdb7d0174a1efe32f4604d')
						console.log('a4870605ca6bdb7d0174a1efe32f4604d will come after', previous)

					//console.log('order : ', JSON.stringify(e), JSON.stringify(previous))
					//console.log('order : ', e, previous)

					try{
						insertAfter(
							await waitElement('#'+e),
							await waitElement('#'+previous)
						)
					}catch(err){
						console.error(e, previous)
						console.error(err)
					}
				}))
			})()`
			stack.push(code)
			//webView.runJavascript(code, null, ()=>{}, {})
		})

		engine.on('releaseStack', async (tree) => {
			if (autoExport === 'exportPdf') {
				const htmlFilename = await htmlExport()
				await pdfConversion(htmlFilename)
				process.exit()
			}

			let tmp = webView.getTitle()
			let previousScrolling = 0
			if (tmp !== '') {
				;[previousScrolling, atEndOfPage] = JSON.parse(
					webView.getTitle().toString()
				)
				if (atEndOfPage)
					previousScrolling += Math.pow(3520, 2)
			}

			//	while(stack.length > 0)
			//	{
			const code = `(async ()=>{
				console.log(Array.from(document.querySelectorAll('body > div:not(#init)')).map(el=>el.id))

				${stack.map((e) => 'await ' + e + '; \n').join('')}
				
				Array.from(document.querySelectorAll('body > div')).map(el=>{
					const setMarge = function(el, lvl){
						el.style['margin-left'] = lvl*30 + 'px'
					}

					const level = parseInt(el.getAttribute('level'))-1
					//console.log('el', el)
					if(level < 0) level = 0
					setMarge(el, level)

					const titre = el.querySelector('h1, h2, h3, h4, h5, h6, h7, h8, h9')
					if(titre !== null){
						if(level > 0.5)
							setMarge(titre, -0.5)
						else
							setMarge(titre, -level)
					}

					Array.from(el.querySelectorAll('img'))
						.map(img=>img.parentNode.parentNode)
						.concat(Array.from(
							el.querySelectorAll('table')
						))
						.forEach(img=>{
						//img.style.overflow = 'scroll'
						if(level > 2)
							setMarge(img, -2)
						else
							setMarge(img, -level)
					})


				})

				Array.from(document.querySelectorAll('img')).forEach(img=>{
					img.ondblclick = ${dblclick}
				})
				
				removeFirstInlinedTitleMargin()

			})()`

			stack = []

			await new Promise((resolve, reject) =>
				webView.runJavascript(code, null, resolve, {})
			)
			//}

			const cde = `(()=>{
				console.log('scrollTo'+${previousScrolling})
				window.scrollTo(0, ${previousScrolling})
			})()`
			webView.runJavascript(cde, null, () => {}, {})
		})

		engine.on('render', (output) => {
			let tmp = webView.getTitle()
			if (tmp !== '') {
				;[previousScrolling, atEndOfPage] = JSON.parse(
					webView.getTitle().toString()
				)
				if (atEndOfPage)
					previousScrolling += Math.pow(3520, 2)
			}

			lastRender = output
			/*webView.runJavascript(
				`navigator.userAgent`,
				null,
				(source, res, givenData) => {
					//console.log(source, res, givenData)
					//console.log(webView.runJavascriptFinish(res))
				},
				{}
			)*/
			//console.log('render end' + output.slice(0, 50))
			//	fs.writeFileSync('../../converted/sample.html', output)
			webView.loadHtml(
				output +
					`<script>window.onload = ()=>{ console.log('scrollTo'+${previousScrolling}); window.scrollTo(0, ${previousScrolling})}
					(function(){
let level = 0
return Array.from(document.querySelectorAll('body > *')).map(el=>{
	const setMarge = (lvl) =>{
		if(lvl < 0) lvl = 0
		el.style['margin-left'] = (parseInt(el.style['margin-left'].replace('px', '') || 0) + lvl*30) + 'px'
	}

	if(typeof el.classList !== 'undefined' && el.classList.contains('break')){
	}else if(/h[1-9]/.test(el.tagName.toLowerCase())){
		level = parseInt(el.tagName.toLowerCase().replace('h', '')) - 1
		setMarge(level-0.5)
	}else if(el.tagName.toLowerCase() === 'p' && Array.from(el.childNodes).length > 0 && typeof Array.from(el.childNodes)[0] === 'object' && typeof Array.from(el.childNodes)[0].tagName !== 'undefined' && Array.from(el.childNodes)[0].tagName.toLowerCase() === 'img'){
                setMarge(level-1.5)
	}else{
		setMarge(level)
	}

})
})()</script>`,
				'file://' + filename
			)
		})

		engine.on('load', async () => {
			console.log('load fiored')
			console.log(engine.cmd)

			const editor = '/usr/bin/nvim'

			terminal.spawnSync(
				Vte.PtyFlags.DEFAULT,
				//require('os').homedir(),
				path.resolve(__dirname, '../'),
				[editor, filename, '--cmd', engine.cmd, '-V0'],
				['/bin/bash'],
				GLib.SpawnFlags.DO_NOT_REAP_CHILD,
				() => {
					console.log('setup')

					//to correct nvim size bug
					window.unmaximize()
					window.maximize()
				}
			)
			terminal.setFontScale(0.8)

			webView.loadHtml(
				body + `</body></html>`,
				'file://' + filename
			)
		})
	}, 1000)
	Gtk.main()

	/*console.log('yeah')
	let c = 0
	while (c < 1) {
		c++
		Gtk.mainIterationDo(false)
	}

	console.log('main iteration false')

	let i = setInterval(() => console.log('interval work'), 1500)
	return
*/
	//await engine.listen()
})

window.on('destroy', () => {
	console.log('destroy')
	process.exit()
	return Gtk.mainQuit()
})

// the user can't close the window if we return `true`
window.on('delete-event', () => {
	console.log('delete-event')
	//terminal.feedChild(':q!\n\0', -1) //maybe one error in the code, but working ¯\_(ツ)_/¯
	return false
})

webView.loadUri('http://localhost:3001/sample.html')

window.showAll()

const url = (href) =>
	/^([a-z]{2,}):/.test(href) ? href : 'http://' + href

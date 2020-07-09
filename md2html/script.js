const path = require('path')
const fs = require('fs')

const child_process = require('child_process')
const editor = 'nv' | process.env.EDITOR || 'vi'

const md5 = require('md5')

let silent = true
const events = require('small-events-manager')
const c = { on: events.on }
module.exports = (filename, s = false) => {
	silent = s
	//
	//
	/*const MongoMemoryReplSet = require('mongodb-memory-server').MongoMemoryReplSet

	const replSet = new MongoMemoryReplSet({
		debug: false,
		replSet: {storageEngine: 'wiredTiger'}
	})
	await replSet.waitUntilRunning()

	let data = await Promise.all([
		replSet.getUri()
	*/
	/*replSet.getPort(),
		replSet.getDbPath(),
		replSet.getDbName()*/
	/*])
	//data = {uri: data[0], port: data[1], path: data[2], name: data[3]}

	// some code
	//   ... where you may use `uri` for as a connection string for mongodb or mongoose

	// you may check instance status, after you got `uri` it must be `true`
	console.log(data)
*/
	//console.log('startedddddd')
	let memory = []
	let servSock = false

	/*	dir = child_process.exec('get-port', function(err, stdout, stderr) {
		if (err) {
			// should have err.code here?
		}
		console.log(stdout)
	})

	dir.on('exit', function(code) {
		// exit code is code
	})
*/

	//
	//
	;(async () => {
		//console.log('inside simmediate')

		//console.log('inside interval')

		const getPort = require('get-port')
		//console.log(getPort)
		//console.log('getting port')
		port = await getPort()
		console.log(port)

		const childFilename = path.resolve(
			__dirname,
			'../neovim-hook-handler.js'
		)

		const cmd =
			'autocmd! TextChangedI,TextChanged * :write ! node ' +
			childFilename +
			' ' +
			' % ' +
			port
		const silentCmd =
			'autocmd TextChangedI,TextChanged * silent! :write ! node ' +
			childFilename +
			' ' +
			' "%" ' +
			port
		;(' >/dev/null 2>&1')

		c.cmd = silent ? silentCmd : cmd
		c.cmd = silentCmd

		/*const child = child_process.spawn(editor, [filename, '--cmd', choosedCmd, '-V0'], {
			stdio: 'inherit'
		})

		child.on('exit', function(e, code) {
			console.log('finished')

			process.exit()
		})*/
		//console.log('require render')

		function throttle(fn, delay) {
			let acceptNew = true
			let lastOne = {
				f: async () => {},
				a: [],
				resolve: () => {},
				reject: () => {},
			}

			return (...args) =>
				new Promise(async (resolve, reject) => {
					if (acceptNew) {
						acceptNew = false
						setTimeout(() => {
							acceptNew = true
							lastOne.resolve(lastOne.f(...lastOne.a))
							lastOne = {
								f: async () => {},
								a: [],
								resolve: () => {},
								reject: () => {},
							}
						}, delay)
					} else {
						lastOne.reject('throttling')
					}

					lastOne = { f: fn, a: args, resolve, reject }
				})
		}

		const renderNotThrottled = require('./render.js')
		const render = throttle(renderNotThrottled, 1000)

		console.log(render)

		const order = function () {
			/*console.log(
				'memory',
				memory.map((e) => e.id)
			)*/

			const tree = memory
				.map((e) => e.id)
				.map((e, id, arr) => {
					if (id === 0) return [e, 'init']
					else return [e, arr[id - 1]]
				})

			//console.log('tree', tree)

			events.run('order', tree)
		}

		const renderCB = function (out) {
			//console.log(typeof out)

			let lastId = out.insertionId - 1

			while (
				lastId >= 0 &&
				typeof memory[lastId] === 'undefined'
			) {
				lastId--
			}

			if (lastId < 0) out.idBefore = 'init'
			else out.idBefore = memory[lastId].id

			//console.log(memory[out.insertionId], out.insertionId)
			memory[out.insertionId] = out

			events.run('append', out)
			//order()
		}

		async function rd(content) {
			//TODO mutualiser code

			content += '\n\n![]()' //to prevent the last image from overflow

			const cpMemory = Array.from(memory)
			//console.log(cpMemory.map(e=>e.id))

			const output = await render(
				content,
				cpMemory,
				silent,
				true
			)

			memory = output.newMem
			console.log('firing delete')
			events.run(
				'delete',
				memory.filter((e) => !e.isNew).map((e) => e.id)
			)

			const news = await output.all
			news.forEach(renderCB)

			if (!silent) console.log('render is done')
			console.log('render end')

			order()

			events.run('releaseStack', true)
		}

		fs.readFile(filename, async (err, content) => {
			if (err) throw err

			await rd(content)
			console.log('first render end')
			//console.log(memory)
		})

		c.exportForOtherBrowsers = async () => {
			return await render('', memory, silent, true, true)
		}

		const net = require('net')
		const server = net.createServer((c) => {
			if (!silent) console.log('client connected')
			let data = ''

			c.on('end', async () => {
				if (!silent) console.log('client disconnected')
				try {
					const content = JSON.parse(data)
					//console.log('content : "' + content.slice(0, 300) + '"')

					if (!silent) console.log('no error on parsing')

					//console.log(memory.filter(e=>typeof e !== 'undefined').map(e=>({id:e.id})))
					//console.log(tree)
					await rd(content)
				} catch (e) {
					//if (!silent)
					console.log(e)
				}
			})
			c.on('data', (chunk) => {
				data += chunk.toString()
			})
			c.on('error', (err) => {
				if (!silent) console.log(err)
			})
		})
		server.on('error', (err) => {
			if (!silent) console.log(err)
		})

		console.log('start listen')
		server.listen(port, () => {
			if (!silent) console.log('server bound on ' + port)
			//console.log('load is ended')
			events.run('load', true)
		})
	})()
	/*
	require('uWebSockets.js')
		.App({})
		.ws('/getMemory', {
			message: (ws, message, isBinary) => {
				console.log('send memory')

				ws.send('memory', JSON.stringify(memory))
			}
		})
		.ws('/setMemory', {
			message: (ws, message, isBinary) => {
				console.log('set memory')

				memory = JSON.parse(message)

				ws.send('memoryReceived', '')
			}
		})
		.ws('/*', {
			message: (ws, message, isBinary) => {
				console.log(message)
			}
		})
		.listen(port, listenSocket => {
			if (listenSocket) {
				console.log('Listening to port ' + port)
				servSock = listenSocket
			}
		})
*/
	/*ipc.serve(
	//'/tmp/app.master-editor-/home/epakompri/cours/scripts/convertToMD/converted/markdown.md',
	() => {
		ipc.server.on('getMemory', (message, socket) => {
			console.log('send memory')

			ipc.server.emit(socket, 'memory', JSON.stringify(memory))
		})
		ipc.server.on('setMemory', (message, socket) => {
			console.log('set memory')

			memory = JSON.parse(message)

			ipc.server.emit(socket, 'memoryReceived', '')
		})
	}
)
ipc.server.start()

*/
	//
	//
	/*} catch (err) {
		console.log(err)
	}*/
	return c
}

require('unified') //preload for first render

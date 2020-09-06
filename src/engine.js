const path = require('path')
const fs = require('fs')
const net = require('net')

const editor = 'nv' | process.env.EDITOR || 'vi'

const events = require('small-events-manager')
const getPort = require('get-port')

let silent = true
const c = { on: events.on }

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

module.exports = (filename, s = false) => {
	silent = s

	let memory = []
	let servSock = false

	//
	//
	;(async () => {
		port = await getPort()
		console.log(port)

		const childFilename = path.resolve(
			__dirname,
			'./neovim-hook-handler.js'
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

		const renderNotThrottled = require('./render.js')
		const render = throttle(renderNotThrottled, 1000)

		const order = function () {
			const tree = memory
				.map((e) => e.id)
				.map((e, id, arr) => {
					if (id === 0) return [e, 'init']
					else return [e, arr[id - 1]]
				})

			events.run('order', tree)
		}

		const renderCB = function (out) {
			let lastId = out.insertionId - 1

			while (
				lastId >= 0 &&
				typeof memory[lastId] === 'undefined'
			) {
				lastId--
			}

			if (lastId < 0) out.idBefore = 'init'
			else out.idBefore = memory[lastId].id

			memory[out.insertionId] = out

			events.run('append', out)
		}

		async function rd(content) {
			//TODO mutualiser code

			const cpMemory = Array.from(memory)

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

		c.exportForOtherBrowsers = async () => {
			return await render('', memory, silent, true, true)
		}

		const server = net.createServer((c) => {
			if (!silent) console.log('client connected')
			let data = ''

			c.on('end', async () => {
				if (!silent) console.log('client disconnected')
				try {
					const content = JSON.parse(data)

					if (!silent) console.log('no error on parsing')

					await rd(content)
				} catch (e) {
					if (!silent) console.log(e)
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

			events.run('load', true)
		})

		fs.readFile(filename, async (err, content) => {
			if (err) throw err

			await rd(content)
			await rd(content) // HACK to correct first render inlined title mis-render (style = display:block but rendered like if display:flex)
			console.log('first render end')
		})
	})()

	return c
}

//require('unified') //preload in node memory for first render

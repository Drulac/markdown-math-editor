;(async () => {
	console.log(process.argv)
	const port = process.argv[2]

	const SocketWithOn = require('uws-with-on.js')
	const Socket = require('socket.io-with-get')

	const sleep = require('sleepjs')
	const chalk = require('chalk')

	/*
function MakeQuerablePromise(promise) {
	// Don't modify any promise that has been already modified.
	if (promise.isResolved) return promise

	// Set initial state
	var isPending = true
	var isRejected = false
	var isFulfilled = false

	// Observe the promise, saving the fulfillment in a closure scope.
	var result = promise.then(
		function (v) {
			isFulfilled = true
			isPending = false
			return v
		},
		function (e) {
			isRejected = true
			isPending = false
			throw e
		}
	)

	result.isFulfilled = function () {
		return isFulfilled
	}
	result.isPending = function () {
		return isPending
	}
	result.isRejected = function () {
		return isRejected
	}
	return result
}*/

	const md2html = await require('../md2html.js')()

	const isLoad = async () => {
		if (md2html === 'wait-for-load') {
			await sleep(50)
			await isLoad()
		}
	}

	//console.log(chalk.blue('script started'))

	const net = require('net')
	const client = net.createConnection(
		{ port },
		async () => {
			//console.log(chalk.blue('connected to server!'))

			socket = new SocketWithOn(client)
			socket = new Socket(socket)

			socket.on('md2html', async (src, cb) => {
				//	console.log(chalk.blue('event received'))

				const output = await md2html(src).catch(
					console.error
				)

				cb(output)
			})

			let data = await socket
				.get('ping', { start: new Date().getTime() })
				.catch((err) => {
					throw new Error(err)
				})
			let pingTime = new Date().getTime() - data.start

			//console.log(pingTime + ' ms')
			//client.end(JSON.stringify(content))
		}
	)
	client.on('end', () => {
		console.log(chalk.blue('disconnected from server'))
	})
	client.on('error', (err) => {
		console.log('Caught flash policy server socket error: ')
		console.log(chalk.blue(err.stack))
	})
})()

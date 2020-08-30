//const Events = require('./front/eventManager.js')
const SocketWithOn = require('uws-with-on.js')
const Socket = require('socket.io-with-get')
const getPort = require('get-port')
const sleep = require('sleepjs').sleep
const chalk = require('chalk')

const silent = true

let load = false
const isLoad = async () => {
	if (load === false) {
		await sleep(50)
		await isLoad()
	}
}
//
//
;(async () => {
	port = await getPort()
	console.log('md2html port :' + port)

	const net = require('net')
	const server = net.createServer(async (c) => {
		c.setNoDelay(true)

		if (!silent) console.log('client connected')

		c.on('end', async () => {
			if (!silent) console.log('client disconnected')
		})
		c.on('error', (err) => {
			if (!silent) console.log(err)
		})

		const socket = new Socket(new SocketWithOn(c))
		load = socket
		//console.log('load = socket')

		socket.on('ping', (data, cb) => {
			cb(data)
		})

		/*const data = await socket.get('name', {}).catch(err => {
			throw new Error(err)
		})
		console.log(data)*/
	})
	server.on('error', (err) => {
		if (!silent) console.log(err)
	})

	//console.log('start listen')
	server.listen(port, () => {
		if (!silent) console.log('server bound on ' + port)
		//console.log('load is ended')
		//events.run('load', true)
	})

	/****************************************/
	/*		run the daemon		*/
	/****************************************/

	const { spawn } = require('child_process')
	const path = require('path')
	const scriptFilename = path.resolve(
		__dirname,
		'../ipc/daemon.js'
	)
	const ls = spawn('node', [scriptFilename, port])

	ls.stdout.on('data', (data) => {
		//console.log(chalk.blue(`stdout: ${data}`))
	})

	ls.stderr.on('data', (data) => {
		console.error(chalk.blue(`stderr: ${data}`))
	})

	ls.on('close', (code) => {
		console.log(
			chalk.blue(`child process exited with code ${code}`)
		)
	})

	/*const exec = require('child_process').exec
	dir = exec('node mathml-daemon.js ' + port, function(err, stdout, stderr) {
		if (err) {
			// should have err.code here?
			console.log('error during md2html cli :')
			console.log(err)
		}
		console.log('daemon closed')
		console.log(stdout)
	})

	dir.on('exit', function(code) {
		console.log('exit code :' + code)
		// exit code is code
	})*/
})()

module.exports = async (src) => {
	//console.log('module.exports')
	await isLoad()
	//console.log('module.exports loaded')
	return await load.get('md2html', src)
}

//
//
/*setTimeout(async () => {
	console.log('start render')
	console.log(await module.exports('# lol '))
	console.log(await module.exports('# lol $5 = 120$'))
}, 3000)*/

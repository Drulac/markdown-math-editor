//console.log(process.argv)
const port = process.argv[process.argv.length-1]

let content = ''

process.stdin.setEncoding('utf8')
process.stdin.on('readable', async () => {
	let chunk
	while ((chunk = process.stdin.read()) !== null) {
		content += chunk
	}
})

process.stdin.on('end', () => {
	//console.log('end of input')
	const net = require('net')
	const client = net.createConnection({port}, () => {
		//console.log('connected to server!')

		client.end(JSON.stringify(content))
	})
	client.on('end', () => {
		//console.log('disconnected from server')
	})
	client.on('error', err => {
		//console.log('Caught flash policy server socket error: ')
		//console.log(err.stack)
	})
})

return
/*
process.stdin.setEncoding('utf8')

process.stdin.on('readable', () => {
	let chunk
	// Use a loop to make sure we read all available data.
	while ((chunk = process.stdin.read()) !== null) {
		let content = chunk //because the script is async
		const ipc = require('node-ipc')

		const master = 'master-editor-' + md5(filename)

		//	const master = 'master-editor-'
		console.log(master)

		ipc.config.id = 'child-editor-' + filename
		ipc.config.retry = 4000
		//	ipc.config.silent = true
		ipc.connectTo(master, () => {
			ipc.of[master].on('connect', () => {
				console.log('connected to ' + master)

				ipc.of[master].on('memory', async memory => {
					memory = JSON.parse(memory)
					console.log('retrieved memory')

					let chunks = content
						.split(/^#/m)
						.filter(e => e !== '')
						.map(e => '#' + e)
*/

/*.reduce((sum, e, id, arr) => {
							if (e.search(/^(|#+)$/m) !== -1) {
								arr[id + 1] = '#' + arr[id + 1]
							} else {
								sum.push(e)
							}
							return sum
						}, [])*/

/*
						.map(e => ({md5: md5(e), content: e}))
					//console.log(chunks)

					chunks = await Promise.all(
						chunks
							.map(e => {
								const old = memory.filter(m => m.md5 === e.md5)
								if (old.length === 0) {
									e.output = md2html(e.content)
								} else {
									e.output = old.output
								}
								return e
							})
							.map(async e => {
								if (typeof e.output.then == 'function') {
									e.output = await e.output
								}
								return e
							})
					)

					console.log(chunks)

					console.log(
						content
							.split('\n')
							.slice(0, 30)
							.join('\n')
					)

					chunks = chunks.map(e => ({md5: e.md5, output: e.output}))

					ipc.of[master].emit('setMemory', JSON.stringify(chunks))

					const result = chunks.map(e => e.output).join('')
					console.log(
						result
							.split('\n')
							.slice(0, 30)
							.join('\n')
					)

					fs.writeFileSync('sample.html', result)

					ipc.of[master].on('memoryReceived', async memory => {
						ipc.disconnect(master)
						process.exit()
					})
				})

				ipc.of[master].emit('getMemory', 'wesh') //wil be called back with "memory"
			})
		})
	}
})

process.stdin.on('end', () => {
	//process.stdout.write('end')
})*/

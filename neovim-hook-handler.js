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

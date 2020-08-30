const axios = require('axios')
const sleep = require('sleepjs').sleep

const startZmd = require('../zmarkdown.js')().then(
	async () => {
		for (let i = 0; i < 40; i++) {
			try {
				let res = await axios({
					url: 'http://localhost:27272',
					method: 'get',
					headers: {},
				}).catch(() => {})

				if (res.status == 200) {
					// test for status you want, etc
					console.log(res.status)
					return res.data
				}
			} catch (err) {
				console.error(err)
			}
			await sleep(500)
		}

		// Don't forget to return something
		return 'not running'
	}
)

startZmd.then(console.log).catch(console.error)

module.exports = async (md) => {
	await startZmd

	return axios
		.post('http://localhost:27272/html', {
			md,
		})
		.catch((error) => {
			console.error(error)
		})
		.then((res) => ({
			output: res.data[0],
			level: res.data[1].depth,
		}))
}
//
//
;(async () => {
	await startZmd

	console.log(await module.exports('$test$'))

})()

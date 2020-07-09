function parse(str, deep = 0) {
	//console.log('----start---- on ' + JSON.stringify(str))
	str = str.replace(/{{/g, '{ {')

	let c = []

	while (1) {
		//console.log('|||||||||||||||||||||||||')
		//const regex = /[^\\{]{([^}{]*[^\\}])}/g

		//	let a = str.split(/[^\\{]{[^}{]*[^\\}]}/g, 1)
		let a = str.indexOf('{')
		if (a === -1) {
			//	console.log('break : ' + JSON.stringify(str))
			c = c.concat(str.trim().split(' '))
			break
		}

		let count = 1
		let index = a
		while (count > 0) {
			index++

			let char = str[index]
			if (char === '}') count--
			if (char === '{') count++
		}

		let b = str.substring(a + 1, index)
		a = str.substring(0, a)

		//			console.log([a, b])

		//		console.log(a.length, b.length)
		str = str.substr(a.length + b.length + 2)

		//	console.log([a, b, str])

		b = parse(b.trim())

		//if (b.indexOf(' ') !== -1) b = '\\&#123;' + b + '\\&#125;'

		c = c.concat(a.trim().split(' '))
		c.push(b)
		///////////////TODO :: continuer modif b n'est plus un array

		//console.log('\t'.repeat(1) + JSON.stringify(c))
	}
	//console.log('\t'.repeat(2) + JSON.stringify(c))
	//	.map(e => e.split(/}/g))

	c = c.reduce((sum, e, id, arr) => {
		//			console.log(JSON.stringify(e))
		if (e === 'over') {
			let tmp = sum.pop()
			sum.push('\\frac ')
			sum.push('\\&#123;' + tmp + '\\&#125;')
			sum.push('\\&#123;' + arr[id + 1] + '\\&#125;')
			delete arr[id + 1]
		} else if (e === 'sum') {
			sum.push('sum ' + arr[id + 1] + '')
			delete arr[id + 1]
		} else if (e === 'rsub') {
			let tmp = sum.pop()
			sum.push(tmp + '_\\&#123;' + arr[id + 1] + '\\&#125;')
			delete arr[id + 1]
		} else if (e === 'sqrt') {
			sum.push('\\sqrt\\&#123;' + arr[id + 1] + '\\&#125;')
			delete arr[id + 1]
		} else if (e === 'acute') {
			sum.push(arr[id + 1] + "^'")
			delete arr[id + 1]
		} else if (e === 'infinity' || e === 'infty') {
			sum.push('ꚙ')
			delete arr[id + 1]
		} else if (['partial', 'abs', 'overline', 'bar'].includes(e)) {
			sum.push('\\' + e + ' ')
		} else {
			sum.push(e)
		}
		//console.log('-' + JSON.stringify(sum[sum.length - 1]))

		return sum
	}, [])

	//console.log('\t'.repeat(3) + JSON.stringify(c))

	//console.log('------------------ return ' + c.join(''))
	return c.join('')
}

function convertToLatex(str) {
	str = str
		.replace(/(right|left)/g, '')
		.replace(/(widevec)/g, 'vec')
		.replace(/\(/g, '&%28;')
		.replace(/\)/g, '&%29;')
		.replace(/("[^\"]+")/g, function replacer(match, p1, p2, p3, offset, string) {
			// p1 is nondigits, p2 digits, and p3 non-alphanumerics
			return p1.replace(/\t/, '    ').replace(/\s/g, '&nbsp;')
		})
	//console.log('escaped : ' + JSON.stringify(str))
	return parse(str)
		.replace(/&#123;/g, '{')
		.replace(/&#125;/g, '}')
		.replace(/&%28;/g, '(')
		.replace(/&%29;/g, ')')
		.replace(/&nbsp;/g, ' ')
		.replace(/²/g, '^2')
		.replace(/–/g, '-')
		.replace(/overline/g, '\\overline')
}

module.exports = convertToLatex

/*console.log(
	convertToLatex(
		`ρ left (X,Y right ) = {cov(X,Y)} over {sqrt {var left (X right ) var left (Y right )}} = {{σ} rsub {XY}} over {{σ} rsub {X} {σ} rsub {Y}}`
	))*/

module.exports = async () => {
	console.time('load')
	console.time('load0')
	const unified = require('unified')

	const path = require('path')
	const markdown = require('remark-parse')
	//const remark2rehype = require('remark-rehype')
	//const doc = require('rehype-document')
	const format = require('rehype-format')
	const html = require('remark-html')
	//const stringify = require('rehype-stringify')
	//const report = require('vfile-reporter')
	console.timeEnd('load0')
	console.time('load1')
	const remarkGridTables = require('remark-grid-tables')
	const embed = require('remark-embed-images')
	const breaks = require('remark-breaks')
	//const attr = require('remark-attr')

	console.timeEnd('load1')
	console.time('load2')
	const convertFormule = require('./mathml/convertFormule.js')
	console.timeEnd('load2')
	console.time('load3')
	const mmlN = await require('./mathml/mathjax.js')()
	//const mmlN = await require('./mathjax.js')
	//const a2h = require(path.resolve('./MathJax-demos-node/direct/am2chtml.js'))
	console.timeEnd('load3')
	console.time('load4')
	const md5 = require('md5')

	const fs = require('fs')

	console.timeEnd('load4')

	console.time('load5')
	var merge = require('deepmerge')
	var gh = require('hast-util-sanitize/lib/github')
	var sanitize = require('rehype-sanitize')

	var schema = merge(gh, {
		tagNames: [
			'math',
			'mi',
			'p',
			'br',
			'h1',
			'mjx-container',
		],
	})
	console.timeEnd('load5')

	console.timeEnd('load')

	function replaceAsync(str, re, callback) {
		str = String(str)
		let parts = [],
			i = 0
		if (
			Object.prototype.toString.call(re) ==
			'[object RegExp]'
		) {
			if (re.global) re.lastIndex = i
			let m
			while ((m = re.exec(str))) {
				let args = m.concat([m.index, m.input])
				parts.push(
					str.slice(i, m.index),
					callback.apply(null, args)
				)
				i = re.lastIndex
				if (!re.global) break // for non-global regexes only take the first match
				if (m[0].length == 0) re.lastIndex++
			}
		} else {
			re = String(re)
			i = str.indexOf(re)
			parts.push(
				str.slice(0, i),
				callback.apply(null, [re, i, str])
			)
			i += re.length
		}
		parts.push(str.slice(i))
		return Promise.all(parts).then(function (strings) {
			return strings.join('')
		})
	}

	var mathMemory = []

	const newLineH = '#' + md5('newLine')
	const newLineRegExp = new RegExp(newLineH, 'g')

	return async (str) =>
		new Promise(async (resolve, reject) => {
			const pics = []
			const links = []
			const maths = []
			const titles = []
			let levelUp = 1
			const br = []

			if (str.toString() === 'undefined') return resolve('')
			//console.log('theoricly not undefined :' + str.slice(0, 500))

			str = str
				.replace(
					/<[=-]?>/gm,
					(match, p1, p2, p3, offset, string) => {
						return `↔`
					}
				)
				.replace(
					/([^-])[=-]>/gm,
					(match, p1, p2, p3, offset, string) => {
						return `${p1}→`
					}
				)
				.replace(
					/<[=-]([^-])/gm,
					(match, p1, p2, p3, offset, string) => {
						return `←${p1}`
					}
				)

			str = await replaceAsync(
				str,
				/\$([^\$]+)\$/g,
				async (match, p1, p2, p3, offset, string) => {
					//console.log('p1 = ' + JSON.stringify(p1))
					if (
						p1.split('{').length !== p1.split('}').length
					) {
						p1 = '"not same `{`, `}`count"'
					}

					p1 = p1
						.replace(/&gt;/g, '>')
						.replace(/&lt;/g, '<')
						.replace(/&nbsp;/g, ' ')
						.replace(/\s/g, ' ')
						.replace(/[ ]+\)/g, ')')
					//.replace(/\(/g, '\\(')
					//.replace(/\)/g, '\\)')
					//console.log(JSON.stringify(p1))

					p1 = convertFormule(p1)
					//console.log('--> ' + p1)

					if (p1 !== '') {
						const h = md5(p1)

						const memId = mathMemory.indexOf(
							mathMemory.filter(([hm, rm]) => hm === h)[0]
						)
						if (memId === -1) {
							try {
								//console.log(JSON.stringify(p1))
								//console.error(mmlN)
								const tmp = mmlN(p1, {
									formatName: 'AsciiMath',
									imageFilename:
										'./converted/img/' + h + '.svg',
									fontSize: 11,
									color: '#000000',
								})

								//console.error(tmp)
								//console.log(mmlN.MathMLNow)
								const r = tmp
								/*.split('\n')
									.map((e) => e.trim())
									.join('\n')
									.trim()
								*/

								maths.push([h, r])
							} catch (err) {
								console.error('error during mathmlnow', err)
								return '[Math error]'
							}
						} else {
							maths.push(mathMemory[memId])
						}
						//console.log('----------------\n' + p1 + '\n-----\n' + r + '\n-----------------')

						return '#' + h
					}
					return ''
				}
			).catch((err) => {
				//console.log('--oops--')
				console.log(
					'originalStr :' +
						JSON.stringify(str) +
						'-\n\n------------------------------'
				)
				console.log(err)
				//fs.writeFileSync('log.txt', err.stack)
			})

			mathMemory = maths

			/*console.log(
				'str :' +
					JSON.stringify(str) +
					'-\n\n------------------------------'
			)*/

			function escapeHtml(text) {
				var map = {
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#039;',
				}

				return text.replace(/[&<>"']/g, function (m) {
					return map[m]
				})
			}

			str = escapeHtml(str)

			str = (
				(str + ' ')
					.replace(
						/^-(#+)/gm,
						(match, level, offset, string) => {
							levelUp = level.length - 1

							return ''
						}
					)
					.replace(
						/!\[\]\(\)/g,
						(match, offset, string) => {
							return newLineH
						}
					)
					.replace(
						/!\[([^\]]*)\]\(([^ \)]*)([^\)]*)\)/g,
						(match, alt, uri, size, offset, string) => {
							const h = md5(alt + uri + size)

							if (size !== '') {
								size = size
									.replace('=', '')
									.trim()
									.split('x')
							}

							pics.push([h, alt, uri, size])

							return '#' + h
						}
					)
					.replace(
						/\[([^\]]*)\]\(([^\)]*)\)/g,
						(match, alt, uri, size, offset, string) => {
							const h = md5(alt + uri)

							links.push([h, alt, uri])

							return '#' + h
						}
					)
					.replace(
						/^(#+)([ ]+)(.+)/gm,
						(
							match,
							level,
							spaces,
							content,
							p3,
							offset,
							string
						) => {
							const h = md5(level + content)

							titles.push([
								h,
								level.length,
								spaces.length === 1,
								content,
							])

							return '#' + h
						}
					) + ' '
			)
				.replace(
					/(^[^*\n]*)\*([^*\n][^\n]+[^*\n])\*([^*]*)$/gm,
					(match, p1, p2, p3, offset, string) => {
						return `${p1}<div class="overline">${p2}</div>${p3}`
					}
				)
				.replace(
					/\*\*([^*\n]+)\*\*/gm,
					(match, p1, p2, p3, offset, string) => {
						return `<strong>${p1}</strong>`
					}
				)
				.replace(
					/\_([^_\n]+)\_/gm,
					(match, p1, p2, p3, offset, string) => {
						return `<em>${p1}</em>`
					}
				)
				.replace(
					/\[Warning: ([^\]]+)\]/gm,
					(match, p1, p2, p3, offset, string) => {
						return `<div class="conversion-error">${p1}</div>`
					}
				)

				.replace(
					/(\n{3,})([^#\n])/gm,
					(match, p1, p2, p3, offset, string) => {
						return `\n\n${'<br'.repeat(
							Math.round(p2.length / 3)
						)}\n\n${p2}`
					}
				)
				.replace(
					/\<br\>/gm,
					(match, level, content, p3, offset, string) => {
						const h = md5(match)

						br.push([h])

						return '#' + h
					}
				)

			function capitalize(content) {
				return (
					content.charAt(0).toUpperCase() + content.slice(1)
				)
			}

			unified()
				.use(markdown)
				.use(embed)
				.use(breaks)
				.use(format)
				.use(remarkGridTables)
				.use(html)
				//.use(sanitize, schema)
				.process(str, function (err, file) {
					//		console.error(report(err || file))
					let result = String(file)

					pics.forEach(([h, alt, uri, size]) => {
						let sizeStr = ''
						let imgClassStr = ''
						let spanStyleStr = ''
						if (size !== '') {
							console.log(
								JSON.stringify(size[0]),
								parseInt(size[0])
							)
							sizeStr = ` width:calc(${
								size[0] +
								(/^([0-9]+)$/.test(size[0]) ? 'px' : '')
							} - 10px);`
							//height="${size[1]}"`
						}
						if (alt === '0' || alt === '') {
							alt = ''
						} else {
							imgClassStr = ' class="alted"'
							spanStyleStr = ' padding-top: 10px;'
							alt = capitalize(alt.trim())
						}
						result = result.replace(
							'#' + h,
							`<br class="img"><span class="img" style="${sizeStr}${spanStyleStr}">${alt.replace(
								/[ ]*\\n[ ]*/g,
								'<br>'
							)}<img contextmenu="imgContextMenu" alt="${alt}" src="${uri}"${imgClassStr}></span>`
						)
					})
					links.forEach(([h, alt, uri]) => {
						if (alt === '0' || alt === '') {
							alt = uri.trim().replace(/^https?:\/\//, '')
						}

						alt = alt.trim()

						result = result.replace(
							'#' + h,
							`<a href="${uri}">${alt.replace(
								/[ ]*\\n[ ]*/g,
								'<br>'
							)}</a>`
						)
					})

					titles.forEach(
						([h, level, newLine, content]) =>
							(result = result.replace(
								'#' + h,
								`${
									newLine
										? '<p style="height:0px"><br></p>'
										: ''
								}<h${level}${
									newLine ? '' : ' class="inlined"'
								}>${capitalize(content)}</h${level}>`
							))
					)
					maths.forEach(
						([h, r]) =>
							(result = result.replace('#' + h, r))
					)
					if (br.length > 0) {
						result = result.replace('#' + h, `<br>`)
					}

					result = result
						//.replace(/&#x3C;/g, '<')
						.replace(
							/<-{5,}\>/g,
							'<div class="break"></div>'
						)
						.replace(
							newLineRegExp,
							'<br class="returnLine">'
						)
						//.replace(/strong\>/g, '<strong>')
						//.replace(/em\>/g, '<em>')
						//.replace(/\<\/strong/g, '</strong>')
						//.replace(/\<\/em([^>])/g, '</em>$1')
						.replace(/[’]/g, "'")

					//result = `<html><body><style>${style}</style>${result}</body></html>`
					//console.log('resolving')
					const level =
						titles.length > 0 ? titles[0][1] : levelUp
					resolve({ output: result, level })
				})
		})
}

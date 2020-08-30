const path = require('path')
const filename = path.resolve(process.argv[2])

const surcoucheTable = require('surcouche-remark-grid-table')
const clone = require('clone')

// 1. Require the "common" module
const zmarkdown = require('zmarkdown/common')

// Clone our configuration
const yourMdastConfig = clone(
	require('zmarkdown/config/mdast')
)
const yourHtmlConfig = clone(
	require('zmarkdown/config/html')
)

// 2. Disable the default KaTeX renderer
yourHtmlConfig.disableTokenizers = {
	internal: ['katex'],
}

const imagesFolder =
	filename.split('/').slice(0, -1).join('/') + '/'

yourMdastConfig.emoticons.emoticons = Object.entries(
	yourMdastConfig.emoticons.emoticons
).reduce((acc, [key, value]) => {
	acc[key] =
		__dirname.split('/').slice(0, -1).join('/') +
		'/front/images/smileys/svg/' +
		value.split('/').slice(4).join('/')

	return acc
}, [])

console.log(yourMdastConfig.emoticons.emoticons)

// 3. Use your plugin instead
yourMdastConfig.extraPlugins = {}

yourHtmlConfig.extraPlugins = {
	'remark-smiles': require('remark-smiles'),
	'rehype-smiles': require('rehype-smiles'),
	'lo-math': require('rehype-lo-math'),
	'remark-attr': require('remark-attr'),
	'remark-change-image-paths': require('../../remark-change-image-paths')(
		{
			//search: /^(?!smileys\/)/,
			search: /^(?!smileys\/|\/)/,
			//search: /^/,
			replace: imagesFolder,
		}
	),
}

// 4. Create a parser and use it
const parser = zmarkdown(
	'html',
	yourMdastConfig,
	yourHtmlConfig
)

module.exports = (md) => {
	md = md
		.replace(
			/!\[([^\]]*)\]\(([^)]+)\)/gm,
			(match, p1, p2, p3, offset, string) => {
				p2 = p2.split(' =')

				if (p1 === '0') p1 = ''

				//TODO : splitter les lignes alts

				if (p2.length > 1) {
					const width = p2.pop()

					return `![${p1}](${p2}){ width=${width} }`
				} else {
					return `![${p1}](${p2})`
				}
			}
		)
		.replace(/^(#{1,6})  /gm, '<inlined>\n\n$1 ')
		.replace(/<[=-]?>/gm, `↔`)
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

	md = surcoucheTable(md)

	//async
	return parser(md)
}

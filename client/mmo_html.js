const env = require('../server/.env.js')
// const cache = '?v=1'
const log = require('../server/log.js')
const lib = require('../server/lib.js')
const PUBLIC = require('../server/data/PUBLIC.js')
// const PRIVATE = require('../server/data/PRIVATE.js')





const site_meta_desc = 'a game development and discovery catalog'
const site_image = env.PRODUCTION_URL + '/resource/media/mmo.png'
const site_desc = 'Click to browse thousands of games by category or list your own games, with a focus on PC and indie titles'
const site_favicon = '/resource/media/favicon.ico'

const popups = `
<div id='dev'></div>
<div id='alert-contain'>
</div
>`


const global_data = `<div id="global-data">${ JSON.stringify( PUBLIC ) }</div>`


const scripts = {

	index: `<script type='module' defer='defer' src='/js/auth/init_index.js?v=1'></script>`,
	auth: `<script type='module' defer='defer' src='/js/auth/init_auth.js?v=1'></script>`,
	account: `<script type='module' defer='defer' src='/js/auth/init_account.js?v=1'></script>`,
	about: `<script type='module' defer='defer' src='/js/auth/init_about.js?v=1'></script>`,
	await_confirm: `<script type='module' defer='defer' src='/js/auth/init_await-confirm.js?v=1'></script>`,
	send_confirm: `<script type='module' defer='defer' src='/js/auth/init_send-confirm.js?v=1'></script>`,
	redirect: `<script type='module' defer='defer' src='/js/auth/init_redirect.js?v=1'></script>`,
	default: `<script type='module' defer='defer' src='/js/auth/init_default.js?v=1'></script>`,
	user: `<script type='module' defer='defer' src='/js/auth/init_user.js?v=1'></script>`,
	import_three: `
<script type="importmap">
	{
		"imports": {
			"three": "/node_modules/three/build/three.module.js",
			"three/addons/": "./jsm/"
		}
	}
</script>`,
	ansi: `<script src='/node_modules/ansi_up/ansi_up.js'></script>`,
	//howler: `<script src='/resource/inc/howler/howler.min.js'></script>`,
	//howler_spatial: `<script src='/resource/inc/howler/howler.spatial.min.js'></script>`,

}


const styles = {
	index: `<link rel='stylesheet' href='/css/index.css?v=1'>`,
	permanent: `<link rel='stylesheet' href='/css/permanent.css?v=1'>`,
	base: `<link rel='stylesheet' href='/css/base.css?v=1'>`,
	auth: `<link rel='stylesheet' href='/css/auth.css?v=1'>`,
	account: `<link rel='stylesheet' href='/css/account.css?v=1'>`,
	world: `<link rel='stylesheet' href='/css/world.css?v=1'>`,
	admin: `<link rel='stylesheet' href='/css/admin.css?v=1'>`,
	user: `<link rel='stylesheet' href='/css/user.css?v=1'>`,
	modal: `<link rel='stylesheet' href='/css/modal.css?v=1'>`,
}



const standard_links = ( type, request ) => {
	return ''
}

const auth_links = request => {
	return ''
}


const build_header = ( type, request, header ) => {

	const header_logo = `/resource/media/mmo.png`

	return `		
	<div id='site-header' data-auth='${ lib.is_logged( request ) }' data-admin='${ lib.is_admin( request ) }'>

		<a title='${ env.SITE_TITLE }: (${ request.session?.IS_MUD ? 'MUDs' : 'standard'})' href='/' id='logo'>
			<img src='${ header_logo }'>
		</a>

		<h2 class='site-title'>
			<a href='/'>${ env.SITE_TITLE }</a>
		</h2>

		<div id='mobile-toggle'>
			menu
		</div>

		<div id='main-links'>
			${ standard_links( type, request ) }
			${ auth_links( request )}
		</div>
	</div>
	`
}


const gen_title = ( type, data, title ) => {
	if( type === 'game' ){
		return title + ' - ' +  data.game.name
	}else{
		return title + ' - ' + type.replace(/_/g, ' ')
	}
}


const build_meta = ( type, data, title ) => {
	return `
	<title>${ gen_title( type, data, title ) }</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">
	<meta name="Description" content=" ${ site_desc }">
	<meta property="og:url" content="${ env.PRODUCTION_URL }">
	<meta property="og:title" content="${ title }">
	<meta property="og:description" content="${ site_meta_desc }"> 
	<meta property="og:image" content="${ site_image }"/>
	<link rel='icon' href='${ site_favicon }'/>`

}








const render = ( type, request, response, data ) => {

	try{

		let css_includes = styles.base + styles.permanent
		let script_includes = ''

		const TITLE = request.session?.IS_MUD ? 'mmmmmmm' : env.SITE_TITLE

		switch( type ){

		case 'index':

			css_includes += styles.index + styles.modal + styles.world
			script_includes += scripts.index //+ scripts.querystring

			return `
			<html>
				<head>
					${ build_meta( type, false, TITLE ) }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ build_header( type, request, TITLE ) }
					${ popups }
					${ global_data }
				</body>
			</html>
			`

		}

	}catch( err ){

		log('flag', 'err', err )

	}

}


module.exports = render
const env = require('./.env.js')
// const auth = require('./auth.js')
const User = require('./persistent/User.js')

const log = require('./log.js')
const lib = require('./lib.js')

const render = require('../client/mmo_html.js')

const color = require('./color.js')

const routes = {
	GET: {
		user: [
			'play',
		],
		logged: [
			'account', 
			'send_confirm',
			// 'admin',
			// 'admin', // special case
		],
		admin: [
			'admin',
			'watcher',
		]
		//  ( dev ) 'system'
	}, 	
	POST: {
		// user: ['login', 'register'],
		admin: [],
		logged: [
		//
		],
	}
}

const sessions = {}
const limit = {
	requests: 50,
	per: 5000,
}
let id
const clear_frequency = request => {
	id = request.session.id
	if( !sessions[ id ] ){
		sessions[ id ] = {
			count: 0,
			timeout: false,
		}
		return true
	}else{

		sessions[id].count++
		if( sessions[id].count > limit.requests ){
			log('flag', 'rejecting session: ', lib.identify( request.session.USER ) )
			return false
		}

		clearTimeout( sessions[id].timeout )
		sessions[id].timeout = setTimeout(()=>{
			delete sessions[id]
		}, limit.per )

		return true

	}

}

const skiplog_routes = []

let bare_path, ip

module.exports = function(req, res, next) {

	// log('flag', '>>> ', req.connection.remoteAddress , req.headers.origin )

	if( req.path.match(/\/resource/) || req.path.match(/\/client/) || req.path.match(/\/fs/) ){

		next()

	}else{

		// log('flag', 'GATEKEEPIN', req.session.USER )

		if( !clear_frequency( req ) ){
			log('flag', 'frequency block - destroying session - ', req.session.USER?._email )
			req.session.destroy()
			if( req.method === 'GET' ){
				return res.send( render('redirect', req, res, '' ))
			}else{
				return res.send({
					success: false,
					msg: 'too many requests',
				})
			}
		}

		// ------------------------------
		// detect MUD subdomain
		// ------------------------------
		let ismud
		if( env.SPOOF_MUD ){
			req.session.IS_MUD = ismud = true
		}else{
			if( req.headers ){
				const keys = ['host', 'origin'] // 'referer' - referer holds weird state
				for( const key of keys ){
					if( req.headers[ key ]?.match(/mud\.game-scry/) ){
						// log('flag', 'key: ', key, 'string: ', req.headers[ key ])
						req.session.IS_MUD = ismud = true
						break;
					}
				}
			}else{
				// ugh what is this
			}
		}
		if( !ismud ) delete req.session.IS_MUD 
		// ------------------------------
		// end MUD
		// ------------------------------


		// log('flag', 'origin / referer: (' + req.method + ')', req.headers.origin, req.headers.referer )
		// if( !req.headers.origin && !req.headers.referer ){
		// 	log('flag', 'how about: ', req.headers.host )
		// }
		// log('flag', 'session is mud: ', req.session.IS_MUD )

		// get IP for logging
		ip = ( req.headers['x-forwarded-for'] || req.connection.remoteAddress || '' ).split(',')[0].trim()

		if( req.method.match(/get/i) ){

			log('gatekeep', format({
				ip: ip,
				method: req.method,
				path: req.path,
				email: req.session.USER ? req.session.USER._email : '',
			}))

		}else{
			log_refuse( req )
		}

		// path logic
		bare_path = req.path.replace(/\//g, '')

		if( routes[ req.method ] ){

			// logged routes

			if( routes[ req.method ].logged.includes( bare_path ) ){ // required logged in routes 

				if( !lib.is_logged( req ) ){ // not logged

					if( req.method === 'GET' ){
						return res.send( render('redirect', req, res, '' ))
					}else{
						return res.json({
							success: false,
							msg: 'must be logged in',
						})
					}

				}else{ // logged in 

					req.session.USER = new User( req.session.USER )

					if( !req.session.USER._confirmed ){ // && !req.session.USER._oauth_discord
					// 	if( !req.session.USER._reset_time || Date.now() - new Date( req.session.USER._reset_time ).getTime() > 1000 * 60 * 60 * 24 ){
					// 		req.session.USER._confirm_code = lib.random_hex( 6 )
					// 		req.session.USER.save()
					// 		.then( res => {
					// 			auth.send_confirm( req ) // .session.USER._email
					// 			.catch( err => {
					// 				log('flag', 'err sending reset gatekeep ', err )
					// 			})
					// 		})
					// 		.catch( err => log('flag', 'err setting confirm : ', err ))
					// 	}
						return res.send( render('redirect', req, res, 'await_confirm' ) )

					}else{

						if( req.method === 'GET' ){
							req.session.USER.save()
							.catch( err => {
								log('flag', 'err updating user saved', err )
							})							
						}

					}

					next()

				}

			}else if( routes[ req.method ].admin.includes( bare_path ) && !lib.is_admin( req ) ){ // req.path.match(/admin/i)

				log('flag', 'what wrong with req', req.session.USER )

				return res.send( render('redirect', req, res, '' ) )

			}else {

				log('flag', 'making new user on default path ')

				req.session.USER = new User( req.session.USER )

				// page reload block on /play
				if( env.PRODUCTION && req.method == 'GET' ){
					if( bare_path === 'play' ){
						if( !req.session.USER._cleared_launch || Date.now() - req.session.USER._cleared_launch > 2000 ){
							return res.send( render('redirect', req, res, 'error'))
							// return res.send( render('error', req, res, 'must exit and re-enter; no page reloads allowed'))
						}
					}					
				}

				if( lib.is_logged( req ) && req.method === 'GET' ){
					req.session.USER.save()
					.catch( err => {
						log('flag', 'err updating standard user save', err )
					})
				}

				next()

			}

		}else{

			next()

		}

	}

}



// stagger non-GETs so they don't flood logs
let refuse_log = false
let refuse = []
const log_refuse = request => {
	refuse.push( request.path )
	if( refuse_log ) return
	refuse_log = setTimeout(() => {
		if( refuse.length ){

			// ----- skipping POST logging -------
			// log('gatekeep', '(bundled ' + refuse.length + ' non-GET requests in last 10 sec)')

		}
		refuse.length = 0
		clearTimeout( refuse_log )
		refuse_log = false
	}, 10 * 1000	)
}




function format( data ){
	if( data.path && skiplog_routes.includes( data.path ) ) return 'SKIPLOG'
	// return ` ${ color('orange', data.ip ) } ${ color_method( data.method, data.path ) } ${ data.email ? color('magenta', email_alias( data.email ) ) : 'none' }`
	return ` ${ color('orange', data.ip ) } ${ color_method( data.method, data.path ) } ${ color('magenta', data.email ? 'logged' : '-' ) }`

}


function color_method( method, data ){
	return color( ( method === 'POST' ? 'lblue' : 'blue' ), data )
}


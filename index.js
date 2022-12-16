
// NATIVE PACKAGES
const host = require('os').hostname()
const express = require('express')
const http = require('http')
const fs = require('fs')
// const path = require('path')
const os = require('os')

// LOCAL PACKAGES
const log = require('./server/log.js')
const lib = require('./server/lib.js')
const DB = require('./server/persistent/db.js')
const env = require('./server/.env.js')
// const lib = require('./utilities/lib.js')

// NPM 
const bodyParser = require('body-parser')
const session = require('express-session')
const redis = require('redis')
const redisClient = redis.createClient({ legacyMode: true })
const redisStore = require('connect-redis')(session)
const FormData = require('express-form-data')

// const User = require('./persistent/User.js')
// const auth = require('./auth.js')
// const OPS = require('./OPS.js')
// const ADMIN = require('./ADMIN.js')
const WSS = require('./server/WSS.js');
const gatekeep = require('./server/gatekeep.js')
const GAME = require('./server/GAME.js')
// const cors =require('cors');
// const GLOBAL_PUBLIC = require('./GLOBAL_PUBLIC.js');
const render = require('./client/mmo_html.js')





;(async() => {




let rmap
try{
	rmap = JSON.parse( await fs.readFileSync( env.REDIS.MAP_URI ) ) 
}catch( err ){
	log('flag', err )	
	return
}


const exp = new express()

const server = http.createServer( exp )

const res = await redisClient.connect()

await new Promise(( resolve, reject ) => {
	redisClient.select( rmap[ env.REDIS.MAP_NAME ], ( err, res ) => {
		if( err ){
			reject( err )
			return
		}
		resolve()
	})
})


const STORE = new redisStore({ 
	host: env.REDIS.HOST, 
	port: env.REDIS.PORT, //env.PORT, 
	client: redisClient, 
	ttl: env.REDIS.TTL,
})

const redis_session = session({
	secret: env.REDIS.SECRET,
	name: env.REDIS.NAME,
	resave: false,
	saveUninitialized: true,
	cookie: env.REDIS.COOKIE, // Note that the cookie-parser module is no longer needed
	store: STORE
})

exp.use( redis_session )

// const upload = multer({
	// dest: env.UPLOAD_DIR
// })

const FormData_options = {
	uploadDir: env.TMP_DIR, // os.tmpdir(),
	autoClean: true
}
exp.use( FormData.parse( FormData_options ) )
exp.use( FormData.format() )
 


// parse data with connect-multiparty. 
// delete from the request all empty files (size == 0)
// change the file objects to fs.ReadStream 
// exp.use( FormData.stream() )
// union the body and the files
// exp.use( FormData.union() )






// HTTP ROUTER
// exp.set( 'port', env.PORT )

// this is redundant, but demonstrates the options 
// - takes static file requests (that happen to begin with /client), serves them, and *rewrites them back again to '/client'
// .use( [virtual URL], [where to look for static assets] )
// also valid: .use([ where to look ]) - if you want to request static assets blindly, aka, mydomain.com/image.jpg

// hypothesis - this works locally but nginx handles on server

// if( env.LOCAL ){
// 	exp.use('/css', express.static( './client/css' )) // __dirname + 
// 	exp.use('/js', express.static( './client/js' )) // __dirname + 

if( env.LOCAL ){

	// exp.use('/world', express.static( env.APP_ROOT + '/world' )) 
	exp.use('/js', express.static( './client/js' )) 
	exp.use('/inc', express.static( './client/inc' )) 
	exp.use('/css', express.static( './client/css' )) 
	exp.use('/resource', express.static( './resource' ))
	exp.use('/three-patch', express.static( './three-patch' ))
	exp.use('/fs', express.static( './fs' )) // __dirname +	
	exp.use('/node_modules', express.static( './node_modules' )) // __dirname +	

}
 
// handle low-level path-parsing errors that would otherwise expose user-facing errors
// exp.use(( req, res, next ) => {
// 	if( req.path.match('%%')) return res.send( render('error', req, 'invalid path'));
// 	next()
// })

exp.use( bodyParser.json({ 
	type: 'application/json' ,
	 limit: '1mb',
}))

exp.use( bodyParser.urlencoded({
	extended: true,
	limit: '1mb',
}))

// exp.use( lru_session )

exp.use( gatekeep )

// get / page routing
exp.get('/', (request, response) => {
	response.send( render( 'index', request ) )
})

exp.get('/favicon.ico', ( request, response ) => {
	response.sendFile('/resource/media/favicon.ico', { root: env.APP_ROOT })
})

exp.get('/login', (request, response) => {
	response.send( render( 'login', request ) )
})







// --------------------------------------------------------------------------------------------------------------
// INIT
// --------------------------------------------------------------------------------------------------------------


function heartbeat(){
	// DO NOT convert to arrow function or else your sockets will silently disconnect ( no "this" )
	this.isAlive = Date.now()
}



DB.initPool(( err, pool ) => {

	if( err ) return console.error( 'no db: ', err )
	
	server.listen( env.PORT, function() {
		log( 'boot', `\x1b[33m
---------------
---- ${ env.SITE_TITLE }
---------------
:: url: ${ env.APP_ROOT }
:: port: ${ env.PORT }
:: time: ${ new Date().toString().split(' (')[0] }
:: REDIS: ${ env.REDIS.NAME }: ${ rmap[ env.REDIS.MAP_NAME ] }
:: OS: ${ host }
\x1b[0m`)
	})

	server.on('upgrade', ( request, socket, head ) => {
		// log('flag',' --UPGRADE--')
		redis_session( request, {}, () => {
		// 	log('flag',' --SESSION--')
		// log('flag', 'req ha s user?', request.session?.USER )

			WSS.handleUpgrade( request, socket, head, ( ws ) => {
				WSS.emit('connection', ws, request )
			})
		})
	})

	WSS.on('connection', ( socket, req ) => {
		socket.request = req
		socket.isAlive = socket.isAlive || true
		socket.bad_packets = 0
		socket.on('pong', heartbeat )
		if( WSS.clients.size >= env.MAX_CLIENTS ) return log('flag', 'max capacity')

		log('wss', 'socket connection user: ', lib.identify( socket?.request?.session?.USER ) )

		if( GAME.isActive() ){
			GAME.init_user( socket )
			.catch( err => {
				log('flag', ' err init user', err )
			})
		}else{
			GAME.initialize()
			.then( res => {
				GAME.init_user( socket )
				.catch( err => {
					log('flag', 'err user join', err )
				})
			})
		}
	})




}) // init-Pool




})();


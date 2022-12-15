const crypto = require('crypto')

const env = require('./.env.js')
const log = require('./log.js')




 



// Object3D.prototype.lookAwayFrom = function( target ){
// 	const v = new Vector3()
//     v.subVectors( this.position, target.position ).add( this.position )
//     source.lookAt( v )
// }

const static_chars = ['≢', '≒', '≓', '≎', '∿', '⦕', '⦖', '⦚', '⨌']

// const ORIGIN = new Vector3(0, 0, 0)

const get_public = () => {

	const r = {}

	Object.keys( this ).forEach( key => {
		if( !key.match(/^_/) && key != 'get_public' ){
			r[key] = this[key]
		}
	})

	return r

}

// const check_collision = ( vector1, vector2, radius1, radius2, distance ) => {

// 	const dist = vector1.distanceTo( vector2 )
// 	if( dist < radius1 + radius2 + distance ){
// 		return true
// 	}
// 	return false

// }

const iso_to_ms = ( iso ) => {

	let isoTest = new RegExp( /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/ )

    if( isoTest.test( str ) ){
    	return new Date( iso ).getTime()
    }
    return false 

}

const ms_to_iso = ( ms ) => {

	if( typeof( ms ) !=  'number' )  return false

	return new Date( ms ).toISOString()

}

const random_hex = ( len ) => {

	//	let r = '#' + Math.floor( Math.random() * 16777215 ).toString(16)
	// let s = ''
	// for( let i = 0; i < len; i++){
	// 	s += Math.floor( Math.random() * 16 ).toString( 16 )
	// }
	// return s

	if( typeof len !== 'number' ){
		log('flag', 'invalid # provided to random_hex')
		len = 8
	}

	return crypto.randomUUID().replace(/-/g, '').substr(0, len )

}

const random_int = ( start, range ) => {

	return start + Math.floor( Math.random() * range )

}

const random_offset = ( center, range ) => {

	return center + ( Math.floor( Math.random() * range ) - ( range / 2 ) )

}


const is_valid_uuid = ( data ) => {

	if( typeof( data === 'string' ) && data.length > 10 ) return true
	return false

}


const is_valid_id = ( test ) => {
	return ( typeof( test ) === 'number' && test > 0 )
}

const is_valid_email  = ( email ) => {

	return validator.validate( email )

}

const is_valid_password = ( password ) => {

	if( password.match(/^null$/i) ){
		log('flag', 'cant use null as pw')
		return false
	}

	return schema.validate( password + '' )

}









const is_valid_name = ( name ) => {

	let valid = true

	if( !name ) valid = false

	if( typeof( name ) !== 'string' || name.length > DATA_PRIVATE.name_length ) return false // yes skip the log here, could be huge

	if( name.match(/^null$/i) ) valid = false

	if( !name_schema.validate( name + '' ) ) valid = false

	if ( !/^([a-zA-Z]|\'|-)*$/g.test( name ) ) valid = false

	if( !valid ) {
		log('flag', 'name regex failed: ', name )
		return false
	}

	return true

}


function validate_number( ...vals ){

	for( const num of vals ){
		if( typeof num === 'number' || ( num && typeof Number( num ) === 'number' ) ) return Number( num )
	}
	return vals[ vals.length - 1 ]

}



function validate_date( ...vals ){

	let test
	for( const val of vals ){
		test = new Date( val )
		if( !test.toString().match(/invalid/i) ) return new Date( val )
	}
	return vals[ vals.length - 1 ]

}



function validate_string( ...vals ){

	for( const str of vals ){
		if( typeof( str ) === 'string' ) return str
	}
	return vals[ vals.length - 1 ]

}


function merge_results_to_object( existing_obj, incoming_arr, hydrateClass ){
	const valid_keys = []
	let found
	for( const item of incoming_arr ){
		found = false
		for( const key of Object.keys( existing_obj )){
			if( existing_obj[ key ]._id === item.id ){
				found = key
				valid_keys.push( key )
			}
		}
		if( !found ){
			let new_object = new hydrateClass( item )
			existing_obj[ new_object.uuid ] = new_object
			valid_keys.push( new_object.uuid )
		}
	}
	for( const key of Object.keys( existing_obj )){
		if( !valid_keys.includes( key )) delete existing_obj[ key ]
	}
}

const random_entry = source => {

	if( Array.isArray( source )){
		return source[ random_range( 0, source.length - 1, true ) ]
	}else if( source && typeof source === 'object'){
		return source[ random_entry( Object.keys( source ) ) ]
	}
	return ''
}



const random_range = ( low, high, int ) => {

	if( low >= high ) return low

	let value = low + ( Math.random() * ( high - low ) ) 
	if( int ){
		value = Math.floor( value )
	}
	// if( absolute_input ){
	// 	if( Math.random() > .5 ) value *= -1
	// }
	// if( center ){
	// 	value += center
	// }
	return value

}


const bad_packet = socket => {

	socket.bad_packets = socket.bad_packets || 0
	socket.bad_packets++

	if( socket.bad_packets > 100 ) return true

	if( socket.bad_packet_cooling )	clearTimeout( socket.bad_packet_cooling )
	
	socket.bad_packet_cooling = setTimeout(()=>{
		socket.bad_packet_cooling = false
		socket.bad_packets = 0
	}, 1000)
	
	return false
	
}

const identify = entity => {
	if( !entity ) return false
	let response = ''
	if( entity.handle ) response += entity.handle + '_'
	// if( entity.userData? ) response += entity.userData + '_'
	if( entity.getNarrowestType ) response += entity.getNarrowestType() + '_'
	if( entity.type ) response += entity.type + '_'
	if( entity.name ) response += entity.name + '_'
	if( entity.subtype ) response += entity.subtype + '_'
	if( entity.faction ) response += entity.faction + '_'
	if( entity._id ) response += '_' + entity._id

	if( !response && entity.uuid )  response += '_' + entity.uuid.substr(0, 4)

	return response
}

const floor_vector = vec3 => {
	vec3.x = Math.floor( vec3.x )
	vec3.y = Math.floor( vec3.y )
	vec3.z = Math.floor( vec3.z )
	return vec3
}

const return_fail = ( private_err, public_err, preface ) => {
	if( preface ) log('flag', 'what was preface for ... ', preface  )
	// log('flag', preface ? preface : 'return_fail: ', private_err )
	log('flag', 'return_fail: ', private_err, public_err )
	return {
		success: false,
		msg: public_err,
	}
}

const return_fail_socket = ( socket, msg, time ) => {
	socket.send(JSON.stringify({
		type: 'hal',
		msg_type: 'error',
		msg: msg,
		time: time,
	}))
	return false
}

const is_admin = request => {
	const admins = env.ADMINS || []
	const e = request.session.USER?._email
	if( e && admins.includes( e )){
		return true
	}
	return false
}


const is_logged = request => {
	return typeof request?.session?.USER?._id === 'number'
	// && request.session.USER._email
}

const render_link = data => {

	if( typeof data !== 'string' ){
		log('flag', 'strings only for link formatting')
		return data
	}

	const exp = /^(http\:\/\/|https\:\/\/)?([a-z0-9][a-z0-9\-]*\.)+[a-z0-9\-]{2,25}\/?.*/ig;

	const split1 = data.split(' ')

	let value, split2
	for( let x = 0; x < split1.length; x++ ){

		split1[x] = split2 = split1[x].split(/\n/)

		for( let i = 0; i < split2.length; i++ ){

			value = ''
			const match = split2[i].match( exp )
			if( match ){
				if( !split2[i].match(/^https?:\/\//) ) split2[i] = 'http://' + split2[i]
				value = split2[i].replace( exp, '<a href="' + split2[i] + '" target="_blank" rel="nofollow">' + split2[i] + '</a>' )
				// log('flag', 'match: ', split2[i])

			}else{
				// log('flag', 'no match: ', split2[i])
				value = split2[i]
			}

			split2[i] = value

		}

		// let over = split2.length > 1
		// if( over ) log('flag', 'split2 val: ', split2 )
		split1[x] = split2.join(`\n`)
		// if( over ) log('flag', 'split2 val: ', split2 )

	}

	return split1.join(' ')

}

const render_user_data = ( msg, params ) => {

	if( !msg || typeof msg !== 'string' )  return msg

	params = params || {}

	let res = msg

	// order is important
	if( params.line_breaks ) res = res.replace(/\<\/?br\>/g, '\n')
	if( params.strip_html ) res = res.replace(/(<([^>]+)>)/gi, '')
	if( params.apply_links ) res = render_link( res )
	if( params.to_html ) res = res.replace(/\n/g, '<br>') // not mutex with ^^.  1st sanitize, 2nd convert back..

	if( params.encode ) res = encodeURIComponent( res ) // or encodeURI for less strict encoding


	return res.trim()

}

const render_email_text = html => {

	let text = render_user_data( html, { line_breaks: true })
	text = render_user_data( html, { strip_html: true })
	return text

}


const to_alphanum = ( value, loose ) => {
	if( typeof value !== 'string' ) return false
	if( loose ){
		return value.replace(/([^a-zA-Z0-9 _-|.|\n|!])/g, '')
	}else{
		return value.replace(/([^a-zA-Z0-9 _-])/g, '')
	}
}

const sanitize_game_name = name => {
	if( !name || typeof name !== 'string' ) return ''
	const newname = name
	.replace(/[^A-Za-z-_0-9\,\:\!\s\']/g, '')
	.replace(/\s\s+/g, ' ')
	return newname

}

const to_mb = bytes => {
	return Math.floor( ( bytes / 1000000 ) * 100 ) / 100
}

const ms_to_units = ( unit, ms ) => {
	switch ( unit ){
		case 'hours':
			return ms / 1000 / 60 / 60
		default:
			log('flag', 'unhandled convert type: ' + type)
			return ms
	}
}

const capitalize = ( word ) => {

	if( typeof( word ) !== 'string' ) return false

	let v = word.substr( 1 )

	word = word[0].toUpperCase() + v

	return word

}

const sleep = async( n ) => {
	await new Promise( resolve => { 
		setTimeout(() => { 
			resolve() 
		}, n * 1000 )
	})
	return true
}

const gen_profile_slug = user => {

	// log('flag', 'gen profile user', user )

	if( user?.portrait_suffix ){
		return '/fs/profile/' + user.slug.replace('#', '_') + '.' + user.portrait_suffix
	}else{
		return '/resource/media/unknown-avatar.jpg' 
	}

}

const get_edited_date = post => {
	let date = post.edited || post._edited || post.created || post._created
	if( !date ) return '(no date)'
	return new Date( date ).toLocaleString()
}


const make_debounce = ( fn, time, immediate, ...args ) => {
    let buffer
    return () => {
        if( !buffer && immediate ) fn(...args)
        clearTimeout( buffer )
        buffer = setTimeout(() => {
            fn(...args)
            buffer = false
        }, time )
    }
}


function emuEncodeURI(str){  
    return encodeURIComponent(str).replace(/[!'()*]/g, escape); 
}
function emuDecodeURI(str){  
    return decodeURIComponent(str)//.replace(/[!'()*]/g, escape); 
}

const sanitize_packet = packet => {
	if( typeof packet !== 'object' ) return {}
	
	return packet
}

const add_publish = entity => {

	entity.publish = ( ...excepted ) => {
		excepted = excepted || []
		let r = {}
		for( const key of Object.keys( entity )){
			if( ( typeof( key ) === 'string' && key[0] !== '_' ) || excepted.includes( key ) ){
				if( entity[ key ] && typeof entity[ key ].publish === 'function' ){
					// r[ key ] = entity[ key ].publish( ...excepted ) // on 2nd thought... do not pass exceptions beyond 1st scope...
					r[ key ] = entity[ key ].publish()
				}else{
					if( key === '_box'){ // special case.. 
						r._box = { 
							position: entity._box.position,
							scale: entity._box.scale,
							rotation: entity._box.rotation,
							collider: {
								position: entity._box.collider?.position,
								scale: entity._box.collider?.scale,
								rotation: entity._box.collider?.rotation,
							}
						}
					}else{
						r[ key ] = entity[ key ]
					}
				}
			}
		}
		return r
	}

}




module.exports = {
	static_chars,
	// ORIGIN,
	// parse_reputations,
	get_public,
	// check_collision,	
	iso_to_ms,
	ms_to_iso,
	random_hex,
	random_int,
	random_offset,
	random_entry,
	random_range,
	is_valid_uuid,
	is_valid_name,
	is_valid_id,
	is_valid_email,
	is_valid_password,
	// getBaseLog,
	sanitize_game_name,
	sanitize_packet,
	// sanitize_chat,
	// jarble_chat,
	validate_number,
	validate_string,
	validate_date,
	merge_results_to_object,
	bad_packet,
	identify,
	floor_vector,
	return_fail,
	return_fail_socket,
	is_admin,
	is_logged,
	render_user_data,
	to_alphanum,
	to_mb,
	ms_to_units,

	capitalize,
	render_email_text,

	sleep,
	gen_profile_slug,
	get_edited_date,

	make_debounce,
	emuEncodeURI,
	emuDecodeURI,
	
	add_publish,

}
const env = require('../.env.js')
const log = require('../log.js')
const lib = require('../lib.js')
const mysql = require('mysql2')
const assert = require('assert')
const { exec } = require('child_process')

let _pool

// let txacts = 0







function initPool( callback ) {

	if ( _pool ) {
		console.log('trying to init pool redundantly')
		return callback(null, _pool)
	}

	_pool = mysql.createPool({
		connectionLimit: 5,
		host: env.DB.HOST,
		user: env.DB.USER,
		password: env.DB.PW,
		database: env.DB.NAME,
		charset: env.DB.CHARSET,
		timezone: '+00:00', // should be unecessary if all are TIMESTAMP ?
		// multipleStatements: true,
	})

	const queryPromise = ( ...args ) => new Promise( (resolve, reject) => {

		// txacts++
		// if( txacts % 10 == 0 ) log('flag', 'txacts: ', txacts )

		_pool.query( ...args, (error, results, fields) => {
			resolve({ error, results, fields })
		})

	})

	_pool.queryPromise = queryPromise

	const execPromise = ( ...args ) => new Promise(( resolve, reject ) => {

		// txacts++
		// if( txacts % 10 == 0 ) log('flag', 'txacts: ', txacts )

		for( let i = 0; i < args.length; i++ ){
			if( i === 0 ) continue
			if( args[i] === undefined ) args[i] = null
		}

		_pool.execute( ...args, (error, results, fields) => {
			resolve({ error, results, fields })
		})

	})

	_pool.execPromise = execPromise

	if( _pool ) log('db', 'pool init')

	return callback( null, _pool )

}









function getPool() {

	assert.ok( _pool, 'Pool has not been initialized, call init first' )
	return _pool

}













async function update( doc, field_array, value_array ){

	// log('flag', 'UPDATE ... ', doc )

	const pool = getPool()

	if( !field_array || !field_array.length || !value_array || !value_array.length || field_array.length !== value_array.length ){
		log('flag', 'invalid update fields')
		return false
	}

	if( !doc._table ){
		log('flag', 'no table for update', lib.identify( doc ))
		return false
	}

	let full_string = ''
	let field_string = ''
	let value_string = ''
	let first_val = true

	for( let i = 0; i < field_array.length; i++ ){

		let value = null
		let type = typeof( value_array[i] )

		// if( field_array[i] === 'confirm_code' ){
		// 	log('flag', 'handling a falsey value: ', field_array[i], value_array[i] )
		// }

		// log('flag', 'pre', value_array[i] )


		// if( field_array[i] === 'confirm_code' ){
		// 	log('flag', 'handling a falsey value: ', field_array[i], value_array[i] )
		// }

		// log('flag', 'post escape', value_array[i] )

		if( type === 'string' ) {

			// log('flag', type + ': ', value_array[i] )

			if( value_array[i].match(/^NULL$/i) ){ // stringified 'null'

				// hm unresolved
				value = null //value_array[i]
				// value = 'NULL' //value_array[i]

			}else{

				// value = '"' + value_array[i] + '"' // normal string
				value = value_array[i]  // normal string

			}

		}else if( type === 'number' ){ // numbers

			value = value_array[i]

		}else if( type === 'function' ){

			// skip

		}else if( type === 'object' ){

			if( !value_array[i] ){
				value = null
			}else if( value_array[i].toISOString ){
				value = new Date( value_array[i] ).getTime()
				// value = date.to_raw_ISO( value_array[i] )
			}else{
				value = JSON.stringify( value_array[i] ) 
			}

			// log('flag', 'saving user obj: ', field_array[i], value_array[i], value )

		}else if( type === 'boolean' ){

			value = value_array[i]

		}else if( type === 'undefined' ){

			// log('flag', '(warning) unexpected UPDATE val: \n' + field_array[i] + '\n' + value_array[i] )
			// value defaults to 'NULL'

		}

		value = mysql.escape( value )
		field_array[i] = '`' + field_array[i] + '`'
		// log('flag', 'field_array: ', field_array[i] +'\n' + type + '\n' + value_array[i] + '\n' + value )
		// log('flag', 'field: ', field_array[i])

		let concat
		if( first_val ){
			doc._id ? field_string += 'id, ' + field_array[i] : field_string += field_array[i]
			doc._id ? value_string += doc._id + ', ' + value : value_string += value
			concat = field_array[i] + '=' + value
			// log('query', 'adding first value: ', concat )
			full_string += concat // no preceding comma for first
			first_val = false
		}else{
			field_string += ', ' + field_array[i]
			value_string += ', ' + value
			concat = ', ' + field_array[i] + '=' + value
			// log('query', 'adding value: ', concat )
			full_string += concat
		}

	}


	//////// handling ON UPDATE in app logic:

	const datetime = Date.now()

	// field / value string are only used on INSERT / create, so:
	field_string = 'created, edited, ' + field_string
	value_string = '\'' + datetime + '\', \'' + datetime + '\', ' + value_string

	// and full_string is only for UPDATE / edit, so:
	full_string = 'edited=' + '\'' + datetime + '\'' + ', ' + full_string

	//////// sample

	// INSERT INTO table (id, name, age) VALUES(1, "A", 19) ON DUPLICATE KEY UPDATE name="A", age=19

	// log('flag', ':::', '\n' + field_string + '\n' + value_string )

	const update = 'INSERT INTO `' + doc._table + '` (' + field_string + ') VALUES (' + value_string + ') ON DUPLICATE KEY UPDATE ' + full_string

	log('query', 'attempting UPDATE: ', update )

	const { error, results, fields } = await pool.queryPromise( update )
	if( error || !results ){
		if( error ){
			// throw new Error('update err: ' + error.sqlMessage )
			throw new Error('update err: ' + error )
		}else{
			// throw new Error( 'UPDATE error: ', error.sqlMessage, 'attempted: ', '\nATTEMPTED: ', update, doc._table )
			throw new Error( 'no results: ' + update )
		}
	}

	const { changedRows, affectedRows, insertId } = (function(){ return results })()

	log('query', 'results: ', {
		changedRows: changedRows,
		affectedRows: affectedRows,
		insertId: insertId,
	})

	return {
		success: true,
		msg: 'update success',
		id: insertId,
		edited: datetime,
	}

}













const backup = async( request ) => {
	/*
		*** README ***
		use of this function will like require to add this entry to ~/.my.cnf
		- .cnf usually needs touched
		- mysqldump needs installed - apt install [ mysql-client | default-mysql-client ]
		- user is mysql user
		###################
		[mysqldump]
		user=[user]
		password=[password]
		###################
	*/

	if( !lib.is_admin( request )) return lib.return_fail('unauthorized db_backup', 'admin only')
	if( !env.DB.PUBLIC_BACKUP_URL ) return lib.return_fail('no dest for bacups', 'backup destination has not been set yet')

	const stamp = Date.now()

	let backup_link = `${ env.DB.PUBLIC_BACKUP_URL }`

	try{

		await new Promise(( resolve, reject ) => {
			exec(`mysqldump -u ${ env.DB.USER } -h ${ env.DB.HOST } ${ env.DB.NAME } > ${ backup_link + '/' + stamp }.sql`, ( error, stdout, stderr ) => {
				if( error ){
					reject( error )
				}else{
					resolve()
				}
			})
		})

		// mysqldump({ // - ran into problems using this module
		// 	connection: {
		// 		host: env.DB.HOST,
		// 		user: env.DB.USER,
		// 		password: env.DB.PW,
		// 		database: env.DB.NAME,
		// 	},
		// 	dumpToFile: './_storage/mysqldumps/COIL_backup-' + stamp + '.sql',
		// 	compressFile: false,
		// })

	}catch( e ){
		return lib.return_fail( e, 'backup failed')
	}

	return {
		success: true,
		msg: `backup complete - <a href="../${ backup_link + '/' + stamp }.sql">click here to download</a><br>Backup made to:<br><pre>${ backup_link }</pre>`
	}


}


const transact = async( queries ) => {

	const pool = getPool()

	try{

		await pool.queryPromise('BEGIN')
		// .then( res => {
		// 	log('flag', 'begun transaction')
		// })
		// .catch( err => {
		// 	log('flag', 'begin transact err', err )
		// })

		const promises = []
		for( const query of queries ){
			promises.push( new Promise((resolve, reject) => {
				pool.queryPromise( query.sql, query.args )
				.then( res => {
					if( res?.error ){
						log('flag', 'transact err', res.error )
						reject( res.error )
					}else{
						log('oauth', 'query success: ', query.sql )
						resolve()
					}
				})
				.catch( err => {
					log('flag', 'transact err', err )
					reject( err )
				})
			})
			)
		}

		await Promise.all( promises )

		await pool.queryPromise(`COMMIT`)
		// .then( res => {
		// 	log('flag', 'committed transaction')
		// })
		// .catch( err => {
		// 	log('flag', 'commit err', err )
		// })

	}catch( err ){

		log('flag', 'transact err', err )
		await pool.queryPromise('ROLLBACK')
		return false

	}

	return true

}



module.exports = {
	getPool,
	initPool,
	update,
	backup,
	transact,
}

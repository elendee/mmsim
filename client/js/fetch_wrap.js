import ui from './ui.js?v=1'

export default ( url, method, body, no_spinner, wrapper ) => {

	return new Promise( ( resolve, reject ) => {

		if( !no_spinner ) ui.loader.show( wrapper )

		if( method.match(/post/i) ){

			fetch( url, {
				method: 'post',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( body )
			})
			.then( res => {
				res.json()
				.then( r => {
					if( !no_spinner )  ui.loader.hide()
					resolve( r )
				}).catch( err => {
					if( !no_spinner )  ui.loader.hide()
					reject( err )
				})
			}).catch( err => {
				if( !no_spinner )  ui.loader.hide()
				reject( err )
			})
			.catch( err => {
				if( !no_spinner )  ui.loader.hide()
				reject( err )
			})

		}else if( method.match(/get/i) ){

			fetch( url )
			.then( res => {
				res.json()
				.then( r => {
					if( !no_spinner )  ui.loader.hide()
					resolve( r )
				}).catch( err => {
					if( !no_spinner )  ui.loader.hide()
					reject( err )
				})
			}).catch( err => {
				if( !no_spinner )  ui.loader.hide()
				reject( err )
			})
			.catch( err => {
				if( !no_spinner )  ui.loader.hide()
				reject( err )
			})

		}else{

			if( !no_spinner )  ui.loader.hide()
			reject('invalid fetch ' + url )
			
		}

	})


}


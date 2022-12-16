import hal from './inc/ui/hal.js?v=1'
import BROKER from './EventBroker.js?v=1'






const colors = {
	cred: 'rgb(255, 210, 100)',
}




function ensureHex(recvd_color){

	if(recvd_color == undefined || recvd_color == null || recvd_color == '' || recvd_color=='white'){ 
		return '#ffffff' 
	}
	if(recvd_color.match(/#/)){
		return recvd_color
	}
	if(recvd_color.length == 6 || recvd_color.length == 8){
		return '#' + recvd_color
	}
	if(recvd_color.match(/rgb/)){ // should always be hex
		var the_numbers = recvd_color.split('(')[1].split(')')[0]
		the_numbers = the_numbers.split(',')
		var b = the_numbers.map(function(x){						 
			x = parseInt(x).toString(16)	
			return (x.length==1) ? '0'+x : x 
		})
		b = b.join('')
		return b
	}else{
		return '#ffffff'
	}
	
}


function capitalize( word ){

	if( typeof( word ) !== 'string' ) return false

	let v = word.substr( 1 )

	word = word[0].toUpperCase() + v

	return word

}



function random_hex( len ){

	//	let r = '#' + Math.floor( Math.random() * 16777215 ).toString(16)
	let s = ''
	
	for( let i = 0; i < len; i++){
		s += Math.floor( Math.random() * 16 ).toString( 16 )
	}
	
	return s

}

function iso_to_ms( iso ){

	let isoTest = new RegExp( /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/ )

    if( isoTest.test( str ) ){
    	return new Date( iso ).getTime()
    }
    return false 

}

function ms_to_iso( ms ){

	if( typeof( ms ) !=  'number' )  return false

	return new Date( ms ).toISOString()

}


function is_valid_uuid( data ){

	if( typeof( data === 'string' ) && data.length > 10 ) return true
	return false

}


function getBaseLog(x, y) {

	return Math.log(y) / Math.log(x)

}

function scry( x, old_min, old_max, new_min, new_max ){

	const first_ratio = ( x - old_min ) / ( old_max - old_min )
	const result = ( first_ratio * ( new_max - new_min ) ) + new_min
	return result
}










// selection.add( this.mesh )





function validate_number( ...vals ){

	for( const num of vals ){
		if( typeof num === 'number' || ( num && typeof Number( num ) === 'number' ) ) return Number( num )
	}
	return vals[ vals.length - 1 ]

}



const random_range = ( low, high, int ) => {

	if( low >= high ) return low

	const init = low + ( Math.random() * ( high - low ) )
	if( int ){
		return Math.round( init )
	}else{
		return init
	}

}

const random_entry = source => {

	if( Array.isArray( source )){
		const index = random_range( 0, source.length - 1, true )
		return source[ index ] || source[ index - 1 ] // because it can round up
	}else if( source && typeof source === 'object'){
		return source[ random_entry( Object.keys( source ) ) ]
	}
	return ''
}




const button = ( message, callback ) => {
	const ele = document.createElement('div')
	ele.innerHTML = message
	ele.classList.add('button')
	if( callback ) ele.addEventListener('click', () => {
		callback()
	})
	return ele
}






const return_fail = ( console_msg, hal_msg, hal_type ) => {
	console.log( console_msg )
	if( hal_msg ) hal( hal_type || 'error', hal_msg, 4000 )
	return false
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
	.replace(/[^A-Za-z-_0-9\,\:\!\s]/g, '')
	.replace(/\s\s+/g, ' ')
	return newname
}

const to_mb = bytes => {
	return Math.floor( ( bytes / 1000000 ) * 100 ) / 100
}


// const lightbox = src => {

// 	return new Promise((resolve, reject)=>{
// 		const bg = document.createElement('div')
// 		bg.classList.add('lightbox')
// 		const frame = document.createElement('div')
// 		frame.classList.add('lightbox-content')
// 		frame.classList.add('flex-wrapper')
// 		const img = document.createElement('img')
// 		img.src = src
// 		frame.appendChild( img )
// 		bg.appendChild( frame )
// 		const close = document.createElement('div')
// 		close.classList.add('modal-close', 'flex-wrapper')
// 		close.innerHTML = '&times;'
// 		close.addEventListener('click', () => {
// 			bg.remove()
// 		})
// 		frame.appendChild( close )
// 		img.onload = e => {
// 			resolve( bg )
// 		}
// 		img.onerror = e => {
// 			reject( e )
// 		}
// 	})

// }

const sleep = n => {
	return new Promise( ( resolve, reject ) => {
		setTimeout(()=>{
			resolve()
		}, n * 1000 )
	})
}



const gen_input = ( type, args ) => { // placeholder, required

	let wrapper
	if( type === 'option' ){
		wrapper = args.select
	}else{
		wrapper = document.createElement('div')
		wrapper.classList.add('input-wrapper')
	}

	let input
	if( type === 'textarea'){
		input = document.createElement('textarea')
	}else if( type === 'select' ){
		input  = document.createElement('select')
	}else if( type === 'option' ){
		input  = document.createElement('option')
	}else{
		input = document.createElement('input')
		input.type = type
	}

	if( args?.name ) input.name = args.name

	if( type === 'text' || type === 'textarea' || type === 'select' || type === 'number' || type === 'checkbox' ){

		if( args.value || args.checked ){
			setTimeout(() => { // options are not appended to selects until another ms or two
				if( type === 'checkbox'){
					input.checked = args.checked
				}else{
					input.value = args.value
				}
			}, 500)
		}

		if( type !== 'number' && type !== 'checkbox' ){
			input.placeholder = args.placeholder
			if( args.max ) input.placeholder += ' (' + args.max + ' words)'
			input.classList.add('input')
		}
	}

	if( type === 'number'){
		input.min = args.min
		input.max = args.max
	}

	if( type === 'option' ){
		input.value = args.value
		input.innerHTML = args.content
		input.classList.add('input') // maybe ?
	}

	if( args && ( args.label_content || args.placeholder ) ){
		const label = document.createElement('label')
		label.innerHTML = args.label_content || args.placeholder
		if( args.required ){
			label.innerHTML += '<span class="required">*</span>'
		}
		wrapper.appendChild( label )
	}

	wrapper.appendChild( input )
	return wrapper

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
			}else{
				value = split2[i]
			}
			split2[i] = value
		}
		split1[x] = split2.join(`\n`)
	}
	return split1.join(' ')
}



const render_user_data = ( msg, params ) => {

	if( !msg || typeof msg !== 'string' )  return msg

	params = params || {}

	let res = msg

	if( params.line_breaks ) res = res.replace(/\<\/?br\>/g, '\n')
	if( params.strip_html ) res = res.replace(/(<([^>]+)>)/gi, '')
	if( params.apply_links ) res = render_link( res )
	if( params.to_html ) res = res.replace(/\n/g, '<br>') // not mutex with ^^.  1st sanitize, 2nd convert back..

	if( params.encode ) res = encodeURIComponent( res ) // or encodeURI for less strict encoding

		// nothign yet:
	if( params.markdown ) res = render_markdown( res )

	return res.trim()

}



const render_markdown = value => {
	if( typeof value !== 'string' ) return value

	const matches = value.match(/\`\`\`/g)
	// console.log('flag', 'matches markdown: ', matches )

	return value
}


const get_query_values = () => {
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());
	return params
}





// const initred = 80
const button_colors = {
	selected_color: 'rgb( 255, 165, 0)',
	// initial_red: initred,
	button_default: 'rgba(50, 50, 60, .7)',
}



const derive_color = ( base, ratios, opacity ) => {
	const add = 255 - base
	const r = base + ( add * ratios[0] )
	const g = base + ( add * ratios[1] )
	const b = base + ( add * ratios[2] )
	return `rgba(${r},${g},${b},${opacity})`
}





// https://stackoverflow.com/questions/20811131/javascript-remove-outlier-from-an-array/20811670#20811670
function filterOutliers( someArray, quantiles ) {  

    // Copy the values, rather than operating on references to existing values
    var values = someArray.concat();

    // Then sort
    values.sort( function(a, b) {
        return a - b;
     });

    /* Then find a generous IQR. This is generous because if (values.length / 4) 
     * is not an int, then really you should average the two elements on either 
     * side to find q1.
     */     
    var qStart = values[ Math.floor( values.length / quantiles ) ];
    // Likewise for q3. 
    var qEnd = values[ Math.ceil( values.length * ( (quantiles-1) / quantiles ) ) ];
    var iqr = qEnd - qStart;

    // Then find min and max values
    var maxValue = qEnd + iqr * 1.5;
    var minValue = qStart - iqr * 1.5;

    // Then filter anything beyond or beneath these values.
    var filteredValues = values.filter( x => {
        return (x <= maxValue) && (x >= minValue);
    });

    // console.log( '>>', qStart, qEnd )

    // Then return
    return filteredValues;
}



const gen_profile_slug = user => {

	if( user?.portrait_suffix ){
		return '/fs/profile/' + user.slug.replace('#', '_') + '.' + user.portrait_suffix
	}else{
		return '/resource/media/unknown-avatar.jpg' 
	}

}


const scrollTo = ( ele, behavior ) => {
	
	let b = ele.getBoundingClientRect()
	let s = document.documentElement.scrollTop || document.body.scrollTop
	let r = b.top + s

	document.body.scroll({
	    top: r,
	    behavior: behavior,
	})
}

function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
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

const cat_color = ( type, categories ) => {
	for( const set in categories ){
		if( categories[ set ].types.includes( type ) ){
			const color_set = categories[ set ].color
			// ( deliberately shifted past 255 to compensate for < 1 values )
			const r = 150 + Math.floor( color_set[0] * 135 )
			const g = 150 + Math.floor( color_set[1] * 135 )
			const b = 150 + Math.floor( color_set[2] * 135 )

			return `rgba(${r}, ${g}, ${b}, .8)`
		}
	}
	return ''
}


function emuEncodeURI(str){  
    return encodeURIComponent(str).replace(/[!'()*]/g, escape); 
}
function emuDecodeURI(str){  
    return decodeURIComponent(str)//.replace(/[!'()*]/g, escape); 
}



const order_images_by_index = ( urls ) => {
	let container
	for( let i = urls.length -1; i >= 0; i-- ){
		const url = urls[i]
		const bump = document.querySelector('.gallery-thumb .bump[data-filename="' + url + '"]')
		if( !bump ){
			console.log('couldnt reorder', url )
			continue
		}
		container = bump.parentElement.parentElement // media area / gallery / etc
		container.prepend( bump.parentElement )
		// console.log( container )
	}
}


const b = ( type, id, ...classes ) => {
	const ele = document.createElement( type )
	if( id ) ele.id = id
	for( const c of classes ){
		ele.classList.add( c )
	}
	return ele
}


const image_fallback = ( img, src1, src2 ) => {
	let c= 0
	img.onerror = e => {
		if( c ) return
		img.src = src2
		c++
	}
	img.src = src1
}


const build_portfolio_item = ( item, can_edit ) => {
	// console.log( item )
	const slug = item.filename.replace(/\..*/, '')
	const wrapper = b('div')
	wrapper.classList.add('portfolio-item')
	wrapper.setAttribute('data-id', item.id )
	const img = b('img')
	img.src = '/fs/portfolio_thumb/' + slug + '.jpg' 
	wrapper.append( img )
	wrapper.addEventListener('click', e => {
		if( e.target.classList.contains('remove-img')) return
		BROKER.publish('MODAL', {
			type: 'lightbox',
			data: {
				src: '/fs/portfolio/' + item.filename,
				title: item.title,
				description: item.description,
			}			
		})
	})
	if( can_edit ){
		const remove = b('div')
		remove.classList.add('remove-img', 'flex-wrapper')
		remove.innerHTML = '&times;'
		remove.addEventListener('click', e => {
			if( !confirm('remove item?') ) return;
			e.preventDefault();
			e.stopPropagation();
			BROKER.publish('REMOVE_MEDIA', {
				// user will be inferred
				id: item.id,
				type: 'portfolio',
			})
		})
		wrapper.append( remove )
	}
	return wrapper 
}


const identify = entity => {
	if( !entity ) return 'unknown'
	return entity.name || 
		entity.type ||
		entity.uuid.substr( 0, 6 ) ||
		entity.id ||
		'unidentified'
}










const exclude_area = ( exclude_max_x, exclude_max_z, max, int, abs_input, center ) => {
	let x = Math.random() * max
	let z = Math.random() * max
	let c = 0
	if( int ) x = Math.floor( x )
	while( ( x < exclude_max_x && z < exclude_max_z ) && c < 100 ){
		x = Math.random() * max
		z = Math.random() * max
		c++
	}
	if( abs_input ){
		if( Math.random() > .5 ) x *= -1
		if( Math.random() > .5 ) z *= -1
	}
	if( center ){
		if( typeof center.x !== 'number' ) console.error( 'center must be given coordinate inputs')
		x += center.x
		y += center.y
	}
	return {
		x: x,
		z: z,
	}
}



const is_logged = document.querySelector('#site-header').getAttribute('data-auth') === 'true'
const is_admin = document.querySelector('#site-header').getAttribute('data-admin') === 'true'




export {

	ensureHex,
	capitalize,
	random_hex,
	iso_to_ms,
	ms_to_iso,
	getBaseLog,
	scry,
	is_valid_uuid,
	
	validate_number,

	button,

	return_fail,

	to_alphanum,
	colors,

	sanitize_game_name,
	to_mb,

	// lightbox,
	gen_input,
	sleep,
	render_user_data,
	get_query_values,

	button_colors,
	derive_color,

	filterOutliers,
	// setMUD,
	gen_profile_slug,
	scrollTo,
	array_move,

	make_debounce,
	cat_color,

	emuEncodeURI,
	emuDecodeURI,

	order_images_by_index,

	b,
	image_fallback,
	build_portfolio_item,
	identify,

	random_range,
	random_entry,
	exclude_area,

	is_logged,
	is_admin,
}


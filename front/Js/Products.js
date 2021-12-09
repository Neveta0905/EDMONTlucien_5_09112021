// General
// Pull datas from API
async function get_data(api_name){
	return new Promise((next) => {
		fetch(api_name)
			.then(async (result) => {
				next(result.json())
			})

			.then(async(data)=>{
				return await data
			})

			.catch((err) => next(err))
	})
}

// ----- Index -----
// Create Item from Kanap API
function create_item_index(id,imgurl,altTxt,prod_name,prod_descript){
	var new_item = document.createElement('a');
	new_item.setAttribute('href', './product.html?id='+id)

	new_item.appendChild(document.createElement('article'))
	
	var image = document.createElement('img')
	image.setAttribute('src', imgurl)
	image.setAttribute('alt', altTxt)

	var h3 = document.createElement('h3')
	h3.classList.add('productName')
	h3.innerHTML = prod_name

	var para = document.createElement('p')
	para.classList.add('productDescription')
	para.innerHTML= prod_descript


	new_item.children[0].appendChild(image)
	new_item.children[0].appendChild(h3)
	new_item.children[0].appendChild(para)

	var elem_in = document.getElementById('items');
	var elem_after = elem_in.lastChild;

	elem_in.insertBefore(new_item, elem_after);
}

// Use api (Pull datas and create Item)
async function asynccall_Create_item(api_name){
	let donnees = await get_data(api_name) // donnees est le retour de promesse

	for(elem of donnees){
		create_item_index(elem._id,elem.imageUrl,elem.altTxt,elem.name,elem.description)
	}
}

//asynccall_Create_item('http://localhost:3000/api/products')



// ----- Product -----
function get_param(param){ //Find URL Parameter
	var kanap_string = window.location.href
	var kanap = new URL(kanap_string)
	var parameter = kanap.searchParams.get(param)
	
	return parameter
}
//get_param('id')

function Create_item_product(item){ // Fill specific div
	var res = []
	for(i in item){
		//console.log(i + " " + item[i])
		res.push([i,item[i]])
	}

	// Image
		let div_img = document.getElementsByClassName('item__img')[0]
		let new_img = document.createElement('img')
		let link_img = res[4][1]

		new_img.setAttribute('src',link_img)
		new_img.setAttribute('alt','Photographie d\'un canapé')
		div_img.appendChild(new_img)

	// Name
		let item_name = res[2][1]
		let title_div = document.getElementById('title')
		title_div.innerHTML = item_name

	// Price
		let item_price = res[3][1]
		let price_div = document.getElementById('price')
		price_div.innerHTML = item_price

	// Description
		let item_description = res[5][1]
		let description_div = document.getElementById('description')
		description_div.innerHTML = item_description

	// Colors
		let item_colors = res[0][1]
		let colors_div = document.getElementById('colors')

	for(color of item_colors){
		let new_color = document.createElement('option')
		new_color.setAttribute('value',color)
		new_color.innerHTML = color

		colors_div.appendChild(new_color)
	}
}

async function asynccall_Create_product(api_name){ // Call : Fetch + fillDiv for product
	let datas = await get_data(api_name + "/" + get_param('id'))
	Create_item_product(datas);
}

//asynccall_Create_product('http://localhost:3000/api/products');

function add_to_cart(){
	let asked_color = document.getElementById('colors').value
	let product_id = get_param('id')

	let color_name_key = product_id + ' ' + asked_color
	let qty = document.getElementById('quantity').value
	let qty_int = parseInt(qty)
	let already_asked_qty = parseInt(sessionStorage.getItem(color_name_key))

	check_product_added(asked_color)
	if(qty > 0 && asked_color != ''){
		sessionStorage.getItem(color_name_key) == null ?
		sessionStorage.setItem(color_name_key,qty) :
		sessionStorage.setItem(color_name_key,already_asked_qty + qty_int)
		//console.log('produit ajouté')
	}
	//console.log('après,'+ color_name_key + ' :' + sessionStorage.getItem(color_name_key)) 
}

function check_product_added(color){
	let prod_name = document.getElementById('title').innerHTML
	let redirect
	color != '' ? redirect = window.confirm('Votre produit ' + prod_name + ' de couleur ' + color.toLowerCase() + ' est ajouté à votre panier. Souhaitez vous retourner à la page d\'accueil ?'):
	alert('N\'oubliez pas de choisir une couleur')
	
	redirect == true ? window.location.href= 'index.html': console.log('ok'); //Renvoie à l'accueil
}

// ----- Cart ----
function get_cart(){ // return array[ [id,color,qty], [id2,color2,qty2] ]
	var cart = window.sessionStorage;
	var cart_ordered = []

	for([key,value] of Object.entries(cart)){
		let article = key + " " + value
		let splited = article.split(' ')
		cart_ordered.push(splited)
	}
	return cart_ordered
}

async function show_cart(next){
	var cart_ordered = get_cart()

	for (elem of cart_ordered){
		
		//Elem infos
			let elem_id = elem[0]
			let elem_color = elem[1]
			let elem_qty = elem[2]
			let article_datas = await get_data('http://localhost:3000/api/products/' + elem_id)
			let article_data_name = article_datas.name
			let article_data_price = article_datas.price
			let article_data_img = article_datas.imageUrl

		//Article
			var article = document.createElement('article')
			article.classList.add('cart__item')
			article.setAttribute('data-id', elem_id)

			//img
			var div_img = document.createElement('div')
			div_img.classList.add('cart__item__img')
			var article_img = document.createElement('img')
			article_img.setAttribute('src',article_data_img)
			article_img.setAttribute('alt','Photographie d\'un canapé')
			div_img.appendChild(article_img)
			article.appendChild(div_img)

			//--Content--
			var div_content = document.createElement('div')
			div_content.classList.add('cart__item__content')
		
		//description
			var div_content_description = document.createElement('div')
			div_content_description.classList.add('cart__item__content__description')

			div_content.appendChild(div_content_description)

			var h2_desc = document.createElement('h2')
			h2_desc.innerHTML = article_data_name
			var p1_desc = document.createElement('p')
			p1_desc.innerHTML = elem_color
			var p2_desc = document.createElement('p')
			p2_desc.innerHTML = article_data_price + ',00 €'

			div_content_description.appendChild(h2_desc)
			div_content_description.appendChild(p1_desc)
			div_content_description.appendChild(p2_desc)


		//settings
			var div_content_setting = document.createElement('div')
			div_content_setting.classList.add('cart__item__content__settings')

				//Qty
					var div_content_setting__quantity = document.createElement('div')
					div_content_setting__quantity.classList.add('cart__item__content__settings__quantity')
					
					var p1_desc_qty = document.createElement('p')
					p1_desc_qty.innerHTML = 'Qté :'
					div_content_setting__quantity.appendChild(p1_desc_qty)

					var input_desc_qty = document.createElement('input')
					input_desc_qty.classList.add('itemQuantity')
					input_desc_qty.setAttribute('type','number')
					input_desc_qty.setAttribute('name','itemQuantity')
					input_desc_qty.setAttribute('min','1')
					input_desc_qty.setAttribute('max','100')
					input_desc_qty.setAttribute('value',elem_qty)
					div_content_setting__quantity.appendChild(input_desc_qty)

					div_content_setting.appendChild(div_content_setting__quantity)
				
				//Del
					var div_content_settings_del = document.createElement('div')
					div_content_settings_del.classList.add('cart__item__content__settings__delete')
					var p_content_del = document.createElement('p')
					p_content_del.classList.add('deleteItem')
					p_content_del.innerHTML = 'Supprimer'
					p_content_del.addEventListener("click",(id,color)=>{
						id = elem_id
						color = elem_color
						let clef = id + ' ' + color
						sessionStorage.removeItem(clef)
						window.location.href = ''


					})

					div_content_settings_del.appendChild(p_content_del)
					div_content_setting.appendChild(div_content_settings_del)

			div_content.appendChild(div_content_setting)

		//Body
			article.appendChild(div_content)
			var div_cart =document.getElementById('cart__items')
			div_cart.appendChild(article)

	}

	show_total_price(show_prices(next))
}

function show_prices(){
	let zones_price = document.getElementsByClassName('cart__item__content')
	var prices = []
	var quantities = []

	let i = 0
	for(elem in zones_price){
		if(zones_price[i] != undefined){
			let item = zones_price[i]
			let item_price = item.getElementsByClassName('cart__item__content__description')[0].children[2].innerHTML;
			item_price = item_price.replace('€', '')
			item_price = item_price.replace(',', '.')
			
			let item_qty = item.getElementsByClassName('itemQuantity')[0].value;
			quantities.push(parseInt(item_qty))

			let item_total_price = item_qty * item_price
			prices.push(item_total_price)

			item_total_price = addCommas(item_total_price.toFixed(2))
			let price_layer = document.createElement('p')
			price_layer.innerHTML = 'Total for this product = ' + item_total_price + ' €'
			item.appendChild( price_layer)


			console.log(prices)
		} else{
			//console.log('ciao')
			break;
		}
		i++;
	}

	return [prices,quantities]
}

function show_total_price(prices_array){
	var total_price = 0
	var total_qty = 0

	for(elem of prices_array[0]){
		total_price+=elem
		console.log(total_price)
	}

	for(elem of prices_array[1]){
		total_qty+=elem
		console.log(total_qty)
	}

	let total_layer = document.getElementsByClassName('cart__price')[0].children[0]
	total_layer.innerHTML = 'Total (' + total_qty +' articles) : ' + addCommas(total_price.toFixed(2) + ' €')

}


function addCommas(nStr){
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
// General
// ----- Index -----
// Create Item in index page
function create_item_index(id,imgurl,altTxt,prod_name,prod_descript){
	let new_item = Create_HTML_elem('a',{'href':'./product.html?id='+id})
	new_item.appendChild(document.createElement('article'))
	
	let image = Create_HTML_elem('img',{'src':imgurl,'alt':altTxt})
	let h3 = Create_HTML_elem('h3',{'class':'productName'},prod_name)
	let para = Create_HTML_elem('p',{'class':'productDescription'},prod_descript)


	new_item.children[0].appendChild(image)
	new_item.children[0].appendChild(h3)
	new_item.children[0].appendChild(para)

	var elem_in = document.getElementById('items');
	var elem_after = elem_in.lastChild;

	elem_in.insertBefore(new_item, elem_after);
}



// ----- Individual Product menu -----
class Item{
	constructor(colors,id,name,price,imageURL,description,altTxt){
		this.colors = colors
		this.id = id
		this.name = name
		this.price = price
		this.imageURL = imageURL
		this.description = description
		this.altTxt = altTxt
		this.api = 'http://localhost:3000/api/products/'
	}

	Create_item_menu(){ // Indivual menu after index
		// Image
			let div_img = document.getElementsByClassName('item__img')[0]
			let new_img = Create_HTML_elem('img',{'src':this.imageURL,'alt':'Photographie d\'un canapé'})
			div_img.appendChild(new_img)

		// Name
			let title_div = document.getElementById('title')
			title_div.innerHTML = this.name

		// Price
			let price_div = document.getElementById('price')
			price_div.innerHTML = this.price

		// Description
			let description_div = document.getElementById('description')
			description_div.innerHTML = this.description

		// Colors
			let colors_div = document.getElementById('colors')

		// Qty
			let qty_input = document.getElementById('quantity')
			qty_input.setAttribute('value',1)

		if(this.colors){
			for(let color of this.colors){
				let new_color = document.createElement('option')
				new_color.setAttribute('value',color)
				new_color.innerHTML = color

				colors_div.appendChild(new_color)
			}
		}
	}

	getById(id){ // API use
		return new Promise((next)=>{
			fetch(this.api + id)
				.then((response) => response.json())
					.then(data => {
						for(let[key,value] of Object.entries(data)){
							switch (true) {
								case key.includes('id'):
									this.id = value;
									break;

								case key.includes('colors'):
									this.colors = value;
									break;

								case key.includes('name'):
									this.name = value;
									break;

								case key.includes('price'):
									this.price = value;
									break;

								case key.includes('image'):
									this.imageURL = value;
									break;

								case key.includes('description'):
									this.description = value;
									break;

								case key.includes('altTxt'):
									this.altTxt = value;
									break;
							}
						}
						next()
					})
				.catch( error => console.log(error.message))
		})
	}

	static getAll(){ // API use
		return new Promise((next)=>{
			fetch('http://localhost:3000/api/products/')
				.then((response) => response.json())
					.then((data) => {
						next(data)
					})
				.catch(error => console.log(error.message))
		})
	}

	Create_cart_article(id,color,qty){
		//Article
			let article = Create_HTML_elem('article',{'class':'cart__item','data-id':id})

			//img
			let div_img = Create_HTML_elem('div',{'class':'cart__item__img'})
			let article_img = Create_HTML_elem('img',{'src':this.imageURL,'alt':'Photographie d\'un canapé'})
			
			div_img.appendChild(article_img)
			article.appendChild(div_img)

			//--Content--
			let div_content = Create_HTML_elem('div',{'class':'cart__item__content'})
		
		//description
			let div_content_description = Create_HTML_elem('div',{'class':'cart__item__content__description'})
			div_content.appendChild(div_content_description)

			let h2_desc = Create_HTML_elem('h2','',this.name)
			let p1_desc = Create_HTML_elem('p','',color)
			let p2_desc = Create_HTML_elem('p','',this.price + ',00 €')

			div_content_description.appendChild(h2_desc)
			div_content_description.appendChild(p1_desc)
			div_content_description.appendChild(p2_desc)


		//settings
			let div_content_setting = Create_HTML_elem('div',{'class':'cart__item__content__settings'})

				//Qty
					let div_content_setting__quantity = Create_HTML_elem('div',{'class':'cart__item__content__settings__quantity'})
					let p1_desc_qty = Create_HTML_elem('p','','Qté')
					div_content_setting__quantity.appendChild(p1_desc_qty)

					let input_desc_qty = Create_HTML_elem('input',{
						'class':'itemQuantity',
						'type' : 'number',
						'name' : 'itemQuantity',
						'min' : 1,
						'max' : 100,
						'value' : qty,
					},'',div_content_setting__quantity)

					div_content_setting.appendChild(div_content_setting__quantity)
				
				//Del
					let div_content_settings_del = Create_HTML_elem('div',{'class':'cart__item__content__settings__delete'})
					let p_content_del = Create_HTML_elem('p',{'class':'deleteItem'},'Supprimer')
					p_content_del.addEventListener("click",()=>{Cart.remove_product(id,color)})

					div_content_settings_del.appendChild(p_content_del)
					div_content_setting.appendChild(div_content_settings_del)

					div_content.appendChild(div_content_setting)

		//Body
			article.appendChild(div_content)
			var div_cart =document.getElementById('cart__items')
			div_cart.appendChild(article)
	}
}

// Create all items in index
async function Create_items(api_name){
	let donnees = await Item.getAll() // donnees est le retour de promesse
	for(elem of donnees){
		create_item_index(elem._id,elem.imageUrl,elem.altTxt,elem.name,elem.description)
	}
}

// ----- Cart ----
class Cart{
	static get_cart(){ // return array[ [id,color,qty], [id2,color2,qty2] ]
		let cart_ordered = []

		for(let[key,value] of Object.entries(window.sessionStorage)){
			let article = key + " " + value
			let splited = article.split(' ')
			cart_ordered.push(splited)
		}
		return cart_ordered
	}

	static add_product(){
		let asked_color = document.getElementById('colors').value
		let product_id = get_param('id')

		let color_name_key = product_id + ' ' + asked_color
		let qty = document.getElementById('quantity').value
		let qty_int = parseInt(qty)
		let already_asked_qty = parseInt(sessionStorage.getItem(color_name_key))

		Cart.check_product_added(asked_color)
		if(qty > 0 && asked_color != ''){
			sessionStorage.getItem(color_name_key) == null ?
			sessionStorage.setItem(color_name_key,qty) :
			sessionStorage.setItem(color_name_key,already_asked_qty + qty_int)
		}
	}

	static remove_product(id,color){
		let clef = id + ' ' + color
		sessionStorage.removeItem(clef)
		window.location.href = ''
	}

	static check_product_added(color){
		let prod_name = document.getElementById('title').innerHTML
		let redirect
		color != '' ? redirect = window.confirm('Votre produit ' + prod_name + ' de couleur ' + color.toLowerCase() + ' est ajouté à votre panier. Souhaitez vous retourner à la page d\'accueil ?'):
		alert('N\'oubliez pas de choisir une couleur')
		
		if(redirect) 
			window.location.href= 'index.html' //Renvoie à l'accueil
	}

	static getPrices(get_cart){
		let prices_arr = []
		for (elem of get_cart){
			let product_id = elem[0]

			let product = new Item
			product.getById(product_id).then(() =>{
				prices_arr.push(product.price)
			})
		}
		return prices_arr;
	}

	static show(cart){
		for (let elem of cart){
		//Elem infos
			let elem_id = elem[0]
			let elem_color = elem[1]
			let elem_qty = elem[2]

			let article_to_lay = new Item
			article_to_lay.getById(elem_id).then(()=>{
				article_to_lay.Create_cart_article(elem_id,elem_color,elem_qty)				
			}).then(()=>{show_article_price()})
		}
	}
}

function show_article_price(){
	let zones_price = document.getElementsByClassName('cart__item__content')
	let prices = []
	let quantities = []
	let total_prices = []

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
			total_prices.push(item_total_price)

			item_total_price = addCommas(item_total_price.toFixed(2))
			console.log(zones_price[i].getElementsByClassName('article_total_price'))
			if(zones_price[i].getElementsByClassName('article_total_price') != undefined){
				let price_layer = Create_HTML_elem('p',{'class':'article_total_price','style':'color:black;'},'Total price for these products : ' + item_total_price + " €")
				item.appendChild(price_layer)
			}
		} else{
			break;
		}
		i++;
	}
}

function show_total_price(prices_array){
	var total_price = 0
	var total_qty = 0

	for(elem of prices_array[0]){
		total_price+=elem
	}

	for(elem of prices_array[1]){
		total_qty+=elem
	}

	let total_layer = document.getElementsByClassName('cart__price')[0].children[0]
	total_layer.innerHTML = 'Total (' + total_qty +' articles) : ' + addCommas(total_price.toFixed(2) + ' €')
}

// Init
(function link_init(){
	switch(true){
		case location.href.includes('cart.html'):
			Cart.show(Cart.get_cart())
			break

		case location.href.includes('index.html'):
			Create_items()
			break

		case location.href.includes('product.html'):
			let button = document.getElementById('addToCart')
			button.addEventListener('click',()=>{Cart.add_product()})
			Create_product();
			break
	}
})()

// Launching functions
function Create_product(){ // Create individual Item menu
	let article_to_lay = new Item()
	article_to_lay.getById(get_param('id')).then(()=>{ // Fetch + lay
		article_to_lay.Create_item_menu()
	})
}

// Utils
const Create_HTML_elem = (Type,Attributes,InnerHTML,Parent) => {
	let elem = document.createElement(Type)

	//Attributes must be {'attrib':'val'}
	for([key,val] of Object.entries(Attributes)){
		elem.setAttribute(key,val)
	}
	if(InnerHTML!=undefined)
		elem.innerHTML = InnerHTML

	if (Parent)
		Parent.appendChild(elem)
	else
		return elem
}

function get_param(param){ //Find URL Parameter
	var kanap_string = window.location.href
	var kanap = new URL(kanap_string)
	var parameter = kanap.searchParams.get(param)
	
	return parameter
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

// --------------------ICIiii-----
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
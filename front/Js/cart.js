// Page Cart and confirmation
// Classes 
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

		// Créer une clef couleur-id du produit
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

	static get_cart_ids(get_cart){
		let prod_ids = []
		for(let elem of get_cart){
			prod_ids.push(elem[0])
		}
		return prod_ids
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

	static getQties(get_cart){
		let qty_arr = []

		for(let elem of get_cart){
			qty_arr.push(elem[2])
		}
		return qty_arr
	}

	static Modify_qty(id,color,new_nbre){
		let clef = id + ' ' + color
		sessionStorage.setItem(clef,new_nbre)
		
		let cart_article = document.getElementsByClassName('cart__item__content')

		for(let i=0;i<cart_article.length;i++){
			let price = cart_article[i].getElementsByClassName('cart__item__content__description')[0].children[2].innerHTML
			price = price.replace('€','')
			price = price.replace(',','.')

			let qty = cart_article[i].getElementsByClassName('itemQuantity')[0].value
			

			let price_layer = cart_article[i].getElementsByClassName('article_total_price')[0]
			price_layer.innerHTML = 'Prix des produits : ' + addCommas(price * qty) + ' €';
		}
	}

	static Totalqties(arr_qties){
		let price =0
		for(let elem of arr_qties){
			price += parseInt(elem,10)
		}
		return price
	}

	static getPrices(get_cart){
		return new Promise((next)=>{
			let prices = []

			for(let elem of get_cart){
				let my_furniture = new Item
				my_furniture.getPrice(elem[0],(price)=>{
					prices.push(price)

					if(get_cart.length === prices.length){
						next(prices)
					}
				})
			}
		})
	}

	static show(cart){
		for (let elem of cart){
		//Elem infos
			let elem_id = elem[0]
			let elem_color = elem[1]
			let elem_qty = elem[2]

			let article = new Item;

			(async function call_id(){
				let article_to_lay = await article.getById(elem_id)
				article_to_lay.Create_cart_article(elem_id,elem_color,elem_qty)
			})()
		}
	}

	static CalculateTotalPrice(qty_arr,prices_arr){
		let total_price=0
		for(let i = 0;i<qty_arr.length;i++){
			let total_prod_amount = parseInt(qty_arr[i], 10) * prices_arr[i]
			total_price += total_prod_amount
		}
		return (total_price)
	}

	static lay_totals(total_price,total_qties){
		let price_zone = document.getElementById('totalPrice')
		let qty_zone = document.getElementById('totalQuantity')

		price_zone.innerHTML = addCommas(total_price)
		qty_zone.innerHTML = total_qties
	}
}

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
			price_div.innerHTML = addCommas(this.price)

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
						next(this)
						}
					})
				.catch( error => console.log(error.message))
		})
	}

	getPrice(id,next){
		// obj.getPrice(id,(prix)=>{traitement prix})
		this.getById(id).then((res)=>{next(res.price)})
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
					input_desc_qty.addEventListener("change", 
						() =>{
							Cart.Modify_qty(id,color,input_desc_qty.value)
							cart_price_caller()
						})

					div_content_setting.appendChild(div_content_setting__quantity)
				
				//Del
					let div_content_settings_del = Create_HTML_elem('div',{'class':'cart__item__content__settings__delete'})
					let p_content_del = Create_HTML_elem('p',{'class':'deleteItem'},'Supprimer')
					p_content_del.addEventListener("click",()=>{Cart.remove_product(id,color)})

					div_content_settings_del.appendChild(p_content_del)
					div_content_setting.appendChild(div_content_settings_del)

					div_content.appendChild(div_content_setting)

		// Total price
			let price_layer = Create_HTML_elem('p',{'class':'article_total_price'},'Prix des produits : ' + addCommas(this.price * qty) + " €"
				,div_content)

		//Body
			article.appendChild(div_content)
			var div_cart =document.getElementById('cart__items')
			div_cart.appendChild(article)
	}
}

class Contact{
	constructor(firstName,lastName,address,city,email){
		this.firstName = firstName
		this.lastName = lastName
		this.address = address
		this.city = city
		this.email = email
		this.string_rules = new Regexs
	}

	async checkRules(){
		let pr =  this.string_rules.firstName.test(this.firstName)
		let nm = this.string_rules.lastName.test(this.lastName)
		let ad = this.string_rules.address.test(this.address)
		let vi = this.string_rules.city.test(this.city)
		let em = this.string_rules.email.test(this.email)
		let error_mess= ''
		
		if(!pr)
			error_mess = error_mess + 'Prénom non conforme \n'
		if(!nm)
			error_mess = error_mess + 'Nom non conforme \n'
		if(!ad)
			error_mess = error_mess + 'Adresse non conforme \n'
		if(!vi)
			error_mess = error_mess + 'Ville non conforme \n'
		if(!em)
			error_mess = error_mess + 'Mail non conforme \n'

		if(pr === false || nm === false ||ad === false || vi === false || em === false){
			alert(error_mess)
			error_mess=''
			this.selfdestroy()
		} else {
			let command_id = await send_command(this,Cart.get_cart_ids(Cart.get_cart()))
			change_page(command_id.orderId)			
		}
	}

	selfdestroy(){
		for(let[key,value] of Object.entries(this)){
			delete this[key]
		}
	}

}

class Regexs{
	constructor(firstName,lastName,address,city,email){
		this.firstName = new RegExp("^[a-zA-Z._-]{2,50}$")
		this.lastName = new RegExp("^[a-zA-Z._-]{2,50}$")
		this.address = new RegExp("^[0-9 ]+[a-zA-Z ]+$")
		this.city = new RegExp("^[a-zA-Z]{2,50}$")
		this.email = new RegExp("[a-z0-9\-_]+[a-z0-9\.\-_]*@[a-z0-9\-_]{2,}\.[a-z\.\-_]+[a-z\-_]+")
	}
}

// Cart actions
const cart_price_caller = async (next) =>{
	let total_prices = await Cart.getPrices(Cart.get_cart())
	let quantities = Cart.getQties(Cart.get_cart())
	let total_price = Cart.CalculateTotalPrice(quantities,total_prices)
	let total_quantities = Cart.Totalqties(Cart.getQties(Cart.get_cart()))
	
	Cart.lay_totals(total_price,total_quantities)
}

// Take values make new instance of contact
// It checks regex and calls api post
const take_values = (formulaire) => {
	let obj = {}
	for(let input of formulaire){
		if(input.name != '' || input.name != undefined){
			obj[input.name] = input.value
		}
	}
	
	let new_contact = new Contact()
	for(let [key,value] of Object.entries(obj)){
		switch(key){
			case 'firstName' :
				new_contact.firstName = value
				break;
			case 'lastName' :
				new_contact.lastName = value
				break;
			case 'address' :
				new_contact.address = value
				break;
			case 'city' :
				new_contact.city = value
				break;
			case 'email' :
				new_contact.email = value
				break;
			default :
				break
		}
	}
	new_contact.checkRules()
}

// Form Actions
const submitEvent = () => {
	let button = document.getElementById('order')
	button.addEventListener("click",SubmitContactEvent)
}

const SubmitContactEvent = (event) => {
 	event.preventDefault()
 	const form = event.currentTarget.parentElement.parentElement
 	take_values(form)
 }


// Sent when Rules are checked
const send_command= async (contact,products) => {
	return new Promise((next)=>{
		fetch('http://localhost:3000/api/products/order',{
		  	method:"post",
		  	headers: {
		     	"Content-Type":"application/json" 
		    },
		  	body:JSON.stringify({
	        	'contact':contact,
	        	'products':products
		    })
		}).then((response)=>{next(response.json())})
	})
}

// Init
(function link_init(){
	switch(true){
		case location.href.includes('cart.html'):
			Cart.show(Cart.get_cart())
			cart_price_caller()
			submitEvent()
			break

		case location.href.includes('confirmation.html'):
			lay_command(get_param('order'))
			break
	}
})()

// Utils
const Create_HTML_elem = (Type,Attributes,InnerHTML,Parent) => {
	let elem = document.createElement(Type)

	//Attributes must be {'attrib':'val'}
	for([key,val] of Object.entries(Attributes)){
		elem.setAttribute(key,val)
	}
	if(InnerHTML!=undefined)
		elem.innerHTML = InnerHTML

	if (Parent){
		Parent.appendChild(elem)
		return elem
	}
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
        x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}



// Confirmation
function lay_command(num_com){
	let layer = document.getElementById('orderId')
	layer.innerHTML=num_com
}

function change_page(num_order){
	location.href= 'confirmation.html?order=' + num_order 
}
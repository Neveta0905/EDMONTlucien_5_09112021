class Cart{ // Manage cart
	static prices = []

	static get_cart(){ // return array[ [id,color,qty], [id2,color2,qty2] ]
		let cart_ordered = []

		for(let[key,value] of Object.entries(window.sessionStorage)){
			let article = key + " " + value
			let splited = article.split(' ')
			cart_ordered.push(splited)
		}
		return cart_ordered
	}

	static get_cart_ids(){ // return array with id in cart
		let cart = Cart.get_cart()
		let prod_ids = []
		for(let i = 0;i<cart.length;i++){
			prod_ids.push(cart[i][0])
		}
		return prod_ids
	}

	static remove_product(key){ // Remoove id with index
		sessionStorage.removeItem(sessionStorage.key(key))
		window.location.href = ''
	}

	static getPrices(){
		return this.prices;
	}

	static total_qty(){ // Quantity amount of product in cart
		let total = 0
		let arr = Cart.get_cart()
		for(let i = 0;i<arr.length;i++){
			total += parseInt(arr[i][2])
		}
		return total
	}

	static total_price(){ // Total price of products in cart
		let total_price = 0,qties = Cart.get_cart()
		for(let i = 0;i<Cart.prices.length;i++){
			total_price += Cart.prices[i]*qties[i][2]
		}
		return total_price
	}

	static change_qty(coord,new_qty){ // Change quantity with index and a new quentity
		sessionStorage.setItem(sessionStorage.key(coord),new_qty)
	}
}

class Contact{ // Manage contact form
	constructor(firstName,lastName,address,city,email){
		this.firstName = firstName
		this.lastName = lastName
		this.address = address
		this.city = city
		this.email = email
		this.string_rules = new Regexs
	}

	async checkRules(){ // Launch regex checking and if success send command
		let pr =  this.string_rules.firstName.test(this.firstName)
		let nm = this.string_rules.lastName.test(this.lastName)
		let ad = this.string_rules.address.test(this.address)
		let vi = this.string_rules.city.test(this.city)
		let em = this.string_rules.email.test(this.email)
		let error_mess= ''
		
		if(!pr)
			alert_error('firstName','Prénom')
		else
			remove_error('firstName')
		if(!nm)
			alert_error('lastName','Nom')
		else
			remove_error('lastName')
		if(!ad)
			alert_error('address','Adresse')
		else
			remove_error('address')
		if(!vi)
			alert_error('city','Ville')
		else
			remove_error('city')
		if(!em)
			alert_error('email','Mail')
		else
			remove_error('email')

		if(pr === false || nm === false ||ad === false || vi === false || em === false){
			this.selfdestroy()
		} else {
			let commmand_id = await send_command(this,Cart.get_cart_ids())
			set_param("OrderId",commmand_id.orderId)
		}
	}

	selfdestroy(){ // If Regex miss delete this Contact instance
		for(let[key,value] of Object.entries(this)){
			delete this[key]
		}
	}
}

class Regexs{ // Obj containing Expressions rules
	constructor(firstName,lastName,address,city,email){
		this.firstName = new RegExp("^[a-zA-Z._-]{2,50}$")
		this.lastName = new RegExp("^[a-zA-Z._-]{2,50}$")
		this.address = new RegExp("^[0-9 ]+[a-zA-Z ]+$")
		this.city = new RegExp("^[a-zA-Z]{2,50}$")
		this.email = new RegExp("[a-z0-9\-_]+[a-z0-9\.\-_]*@[a-z0-9\-_]{2,}\.[a-z\.\-_]+[a-z\-_]+")
	}
}

// Init
(async function init(){ // Launch functions with url contains
	switch(true){
		case location.href.includes('cart.html'):
			await show_cart()
			handle_delete()
			Cart.total_price()
			lay_totals()
			handle_changeQty()
			submitEvent()
			break
		case location.href.includes('confirmation.html'):
			lay_command()
	}
})()
// ----------------------

// Products
async function show_cart(){ // Lay products of cart
	let cart = Cart.get_cart()
	let cartItems = document.getElementById('cart__items')
	let coord = 0,price=0

	for (let elem of cart){
		let elem_id = elem[0]; elem_color = elem[1]; elem_qty = elem[2]
		let product_info = await Product_info(elem_id)
		cartItems.innerHTML += Create_article(product_info,elem_qty,elem_color)
		Cart.prices.push(product_info.price)
	}
}

function Product_info(id){ // Consume API
  return fetch('http://localhost:3000/api/products/' + id)
    .then((response)=>{return response.json()})
      .then((datas)=>{return datas})
  .catch(e=>console.error('API error'))
}

function Create_article(product,qty,color){ // Create HTMl
	const article = `<article class="cart__item">
		<div class="cart__item__img">
		  <img src="${product.imageUrl}" alt="${product.altTxt}">
		</div>
		<div class="cart__item__content">
		  <div class="cart__item__content__titlePrice">
		    <h2>${product.name}</h2>
		    <p class='product_total_price'>${addCommas(product.price*qty) + ',00 €'}</p>
		  </div>
		  <p>${color}</p>
		  <p>${addCommas(product.price) + ',00 €'}</p>
		  <div class="cart__item__content__settings">
		    <div class="cart__item__content__settings__quantity">
		      <p>Qté : </p>
		      <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value=${qty}>
		    </div>
		    <div class="cart__item__content__settings__delete">
		      <p class="deleteItem" id="${product._id} ${color}">Supprimer</p>
		    </div>
		  </div>
		</div>
	</article>`

	return article
}

// Products Events
function handle_delete(){ // Delete button of product in cart
	let deleters = document.getElementsByClassName('deleteItem');
	if(deleters.length>0)
		for(let i=0;i<deleters.length;i++){
			deleters[i].addEventListener('click',()=>{Cart.remove_product(i)})	
		}
}

function handle_changeQty(coord){ // Manage quantity buttons in cart
	let target = document.getElementsByClassName('itemQuantity')
	let price_layer = document.getElementsByClassName('product_total_price')
	let prices = Cart.getPrices()

	for(let i = 0;i<target.length;i++){
		target[i].addEventListener('change',(event)=>{
			new_qty = event.target.value
			Cart.change_qty(i,new_qty);
			price_layer[i].innerHTML = addCommas(parseInt(prices[i])*parseInt(new_qty)) + ',00 €'
			lay_totals()
		})
	}
}

function lay_total_price(){ // Lay total price of cart
	let layer = document.getElementById('totalPrice')
	layer.innerHTML = addCommas(parseInt(Cart.total_price()))
}

function lay_total_qty(){ // Lay quantity of products in cart
	let layer = document.getElementById('totalQuantity')
	layer.innerHTML = Cart.total_qty()
}

function lay_totals(){ // Calls totals layer
	lay_total_price()
	lay_total_qty()
}
//------------------------


// Contact
const submitEvent = () => { // add Event on submit form
	let button = document.getElementById('order')
	button.addEventListener("click",SubmitContactEvent)
}

const SubmitContactEvent = (event) => { // Declare event of form
 	event.preventDefault()
 	const form = event.currentTarget.parentElement.parentElement
 	take_values(form)
}

const take_values = (formulaire) => { // Instance a new Contact with form values
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
// --------------------

// Command
const send_command= async (contact,products) => { // Consume post API
	return fetch('http://localhost:3000/api/products/order',{
		  	method:"post",
		  	headers: {
		     	"Content-Type":"application/json" 
		    },
		  	body:JSON.stringify({
	        	'contact':contact,
	        	'products':products
		    })
		})
		.then((response)=>{return response.json()})
		.catch(e=>console.error('API error'))
}

function lay_command(){ // Lay command in confirmation.html
	let layer = document.getElementById('orderId')
	let order_id = get_param('OrderId')
	layer.innerHTML = order_id
}

function alert_error(id,property){ // Lay error if not already layed 
	if(!document.getElementById('error_'+ id)){
		let layer = document.getElementById(id).parentElement
		layer.innerHTML += '<p style=\'color:orange\' id=\'error_'+id +'\'>' + property + ' invalide</p>'
	}
}

function remove_error(id){
	let elem = document.getElementById('error_' + id)
	if(elem){
		elem.remove()
	}
}

// -------------------------------------

// Util
function addCommas(nStr){ // Transform a number with dots separators
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

function get_param(param){ //Find URL Parameter
	var kanap_string = window.location.href
	var kanap = new URL(kanap_string)
	var parameter = kanap.searchParams.get(param)
	
	return parameter
}

const set_param = (param,value) => { // Set Url parameter
	window.location.href = "confirmation.html?"+ param +"=" + value
}
// -------------------

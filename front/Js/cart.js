class Cart{
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

	static get_cart_ids(){
		let cart = Cart.get_cart()
		let prod_ids = []
		for(let i = 0;i<cart.length;i++){
			prod_ids.push(cart[i][0])
		}
		return prod_ids
	}

	static remove_product(key){
		sessionStorage.removeItem(sessionStorage.key(key))
		window.location.href = ''
	}

	static getPrices(){
		return this.prices;
	}

	static total_qty(){
		let total = 0
		let arr = Cart.get_cart()
		for(let i = 0;i<arr.length;i++){
			total += parseInt(arr[i][2])
		}
		return total
	}

	static total_price(){
		let total_price = 0,qties = Cart.get_cart()
		for(let i = 0;i<Cart.prices.length;i++){
			total_price += Cart.prices[i]*qties[i][2]
		}
		return total_price
	}

	static change_qty(coord,new_qty){
		sessionStorage.setItem(sessionStorage.key(coord),new_qty)
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
			let commmand_id = await send_command(this,Cart.get_cart_ids())
			console.log(commmand_id)
			set_param("OrderId",commmand_id.orderId)
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

// Init
(async function init(){
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
async function show_cart(){
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

function Product_info(id){
  return fetch('http://localhost:3000/api/products/' + id)
    .then((response)=>{return response.json()})
      .then((datas)=>{return datas})
  .catch(e=>console.log('API error'))
}

function Create_article(product,qty,color){
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
function handle_delete(){
	let deleters = document.getElementsByClassName('deleteItem');
	if(deleters.length>0)
		for(let i=0;i<deleters.length;i++){
			deleters[i].addEventListener('click',()=>{Cart.remove_product(i)})	
		}
}

function handle_changeQty(coord){
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

function lay_total_price(){
	let layer = document.getElementById('totalPrice')
	layer.innerHTML = addCommas(parseInt(Cart.total_price()))
}

function lay_total_qty(){
	let layer = document.getElementById('totalQuantity')
	layer.innerHTML = Cart.total_qty()
}

function lay_totals(){
	lay_total_price()
	lay_total_qty()
}
//------------------------


// Contact
const submitEvent = () => {
	let button = document.getElementById('order')
	button.addEventListener("click",SubmitContactEvent)
}

const SubmitContactEvent = (event) => {
 	event.preventDefault()
 	const form = event.currentTarget.parentElement.parentElement
 	take_values(form)
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
// --------------------

// Command
const send_command= async (contact,products) => {
	return fetch('http://localhost:3000/api/products/order',{
		  	method:"post",
		  	headers: {
		     	"Content-Type":"application/json" 
		    },
		  	body:JSON.stringify({
	        	'contact':contact,
	        	'products':products
		    })
		}).then((response)=>{return response.json()})
}

function lay_command(){
	let layer = document.getElementById('orderId')
	let order_id = get_param('OrderId')
	layer.innerHTML = order_id
}

// -------------------------------------

// Util
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

function get_param(param){ //Find URL Parameter
	var kanap_string = window.location.href
	var kanap = new URL(kanap_string)
	var parameter = kanap.searchParams.get(param)
	
	return parameter
}

const set_param = (param,value) => {
	window.location.href = "confirmation.html?"+ param +"=" + value
}
// -------------------

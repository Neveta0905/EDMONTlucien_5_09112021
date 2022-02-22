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

// Init
(async function init(){
	switch(true){
		case location.href.includes('cart.html'):
			await show_cart()
			handle_delete()
			Cart.total_price()
			lay_totals()
			handle_changeQty()
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
// -------------------

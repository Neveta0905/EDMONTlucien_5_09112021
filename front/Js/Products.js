// General
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
	constructor(prénom,nom,adresse,ville,email){
		this.prénom = prénom
		this.nom = nom
		this.adresse = adresse
		this.ville = ville
		this.email = email
		this.string_rules = new Regexs
		this.checkRules()
		this.selfdestroy()
	}

	checkRules(){
		let pr =  this.string_rules.prénom.test(this.prénom)
		let nm = this.string_rules.nom.test(this.nom)
		let ad = this.string_rules.adresse.test(this.adresse)
		let vi = this.string_rules.ville.test(this.ville)
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
			this.selfdestroy()
			//window.location.replace(window.location.href)
			alert(error_mess)
			error_mess=''
		}
	}

	selfdestroy(){
		for(let[key,value] of Object.entries(this)){
			delete this[key]
		}
	}
}

class Regexs{
	constructor(prénom,nom,adresse,ville,email){
		this.prénom = new RegExp("^[a-zA-Z._-]{3,50}")
		this.nom = new RegExp("^[0-9a-zA-Z._-]{3,50}")
		this.adresse = new RegExp("[0-9]*[a-zA-Z]*")
		this.ville = new RegExp("[a-zA-Z]")
		this.email = new RegExp("[a-z0-9\-_]+[a-z0-9\.\-_]*@[a-z0-9\-_]{2,}\.[a-z\.\-_]+[a-z\-_]+")
	}
}


let conta = new Contact('1lulu','edm','8 P Gd','Cassel','luluedfree.fr')
console.log(conta)

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

// Create all items in index
async function Create_items(api_name){
	let donnees = await Item.getAll() // donnees est le retour de promesse
	for(elem of donnees){
		create_item_index(elem._id,elem.imageUrl,elem.altTxt,elem.name,elem.description)
	}
}


const cart_price_caller = async (next) =>{
	let total_prices = await Cart.getPrices(Cart.get_cart())
	let quantities = Cart.getQties(Cart.get_cart())
	let total_price = Cart.CalculateTotalPrice(quantities,total_prices)
	let total_quantities = Cart.Totalqties(Cart.getQties(Cart.get_cart()))
	
	Cart.lay_totals(total_price,total_quantities)
}

// Init
(function link_init(){
	switch(true){
		case location.href.includes('cart.html'):
			Cart.show(Cart.get_cart())
			cart_price_caller()
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

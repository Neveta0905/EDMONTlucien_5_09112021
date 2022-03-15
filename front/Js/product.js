// Page Layer
layProduct()


async function layProduct(){ // Call function to get info and lay it
  const product = await getProductById()
  fill_Html(product)
}

function getProductById(){ // Fetch thanks to url parameter
  let id = get_param('id')

  return fetch('http://localhost:3000/api/products/'+id)
    .then((result) => {return result.json()})
      .then((data) => {return data})
    .catch(e => console.log('Error on API call'))
}

function get_param(param){ //Find URL Parameter
  var kanap_string = window.location.href
  var kanap = new URL(kanap_string)
  var parameter = kanap.searchParams.get(param)
  return parameter
}


function get_Html(){ // Give an object with all HTML object to modify
  let Html_oject = {}
  let HTML_modify = {
    classes:{image:'item__img',},
    ids:{name:'title',price:'price',description:'description',colors:'colors'}
  }

  for(let[key,value] of Object.entries(HTML_modify)){
    if(key=='classes') {
      for(let[key1,value1] of Object.entries(value)){
        Html_oject[key1]=document.getElementsByClassName(value1)[0]
      } 
    }
    else if(key=='ids'){
      for(let[key2,value2] of Object.entries(value)){
         Html_oject[key2]=document.getElementById(value2)
      }
    }
  }
  return Html_oject
}

function fill_Html(product){ // use HTML object to change inner HTML of all elements
  let zones = get_Html()
  zones.image.innerHTML=`<img src="${product.imageUrl}" alt="${product.altTxt}">`;
  zones.name.innerHTML=`${product.name}`;
  zones.price.innerHTML=`${addCommas(product.price)} `;
  zones.description.innerHTML=`${product.description}`;
  for(color of product.colors){
    zones.colors.innerHTML+=`<option value="${color}">${color}</option>`;
  }
}
// -------------------

// Util
function addCommas(nStr){ // Add separator dots to price
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

// Events
(function handle_qtyCange(){ // Assure that quantity isn't wrong
  let qty_changer = document.getElementById('quantity')
  qty_changer.value=1
  qty_changer.addEventListener('change',()=>{
    if(qty_changer.value<0)
      qty_changer.value=1
    else if(qty_changer.value>100)
      qty_changer.value=100
  })
})();

(function handle_add(){ // Add event to submit button
  let add_button = document.getElementById('addToCart')
  add_button.addEventListener('click',()=>{Cart.addProduct(get_param('id'))})
})();
// -------------------

class Cart{
  static addProduct(id){ // Add product in cart
    let asked_color = document.getElementById('colors').value

    // Créer une clef couleur-id du produit
    let color_name_key = id + ' ' + asked_color
    let qty = parseInt(document.getElementById('quantity').value)
    let already_asked_qty = parseInt(localStorage.getItem(color_name_key))

    Cart.check_product_added(asked_color)
    if(qty > 0 && asked_color != ''){
      localStorage.getItem(color_name_key) == null ?
      localStorage.setItem(color_name_key,qty) :
      localStorage.setItem(color_name_key,already_asked_qty + qty)
    }
  }

  static check_product_added(color){ // Alert user that product will be in the cart
    let prod_name = document.getElementById('title').innerHTML
    let redirect
    color != '' ? redirect = window.confirm('Votre produit ' + prod_name + ' de couleur ' + color.toLowerCase() + ' est ajouté à votre panier. Souhaitez vous retourner à la page d\'accueil ?'):
    alert('N\'oubliez pas de choisir une couleur')
    
    if(redirect) 
      window.location.href= 'index.html' //Renvoie à l'accueil
  }
}

// -------------------
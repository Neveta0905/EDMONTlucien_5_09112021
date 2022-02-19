layProduct()

async function layProduct(){
  const product = await getProductById()
  fill_Html(product)
}

function getProductById(){
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


function get_Html(){
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

function fill_Html(product){
  let zones = get_Html()
  zones.image.innerHTML=`<img src="${product.imageUrl}" alt="${product.altTxt}">`;
  zones.name.innerHTML=`${product.name}`;
  zones.price.innerHTML=`${addCommas(product.price)} `;
  zones.description.innerHTML=`${product.description}`;
  for(color of product.colors){
    zones.colors.innerHTML+=`<option value="${color}">${color}</option>`;
  }
  console.log(zones.colors)
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

(function handle_qtyCange(){
  let qty_changer = document.getElementById('quantity')
  qty_changer.addEventListener('change',()=>{
    if(qty_changer.value<0)
      qty_changer.value=1
    else if(qty_changer.value>100)
      qty_changer.value=100
  })
})()

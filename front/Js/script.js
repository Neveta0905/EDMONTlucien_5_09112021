layprods()

function get_products(){
  return fetch('http://localhost:3000/api/products')
    .then((response)=>{return response.json()})
      .then((datas)=>{return datas})
  .catch(e=>console.log('API error'))
}

function Create_article(product){
  let article = `<a href="./product.html?id=${product._id}">`+'<article>'+`<img src="${product.imageUrl}" alt=${product.altTxt}>`+`<h3>${product.name}</h3>`
  +`<p>${product.description}</p>`+'</article>'
  return article
}

async function layprods(){
  const products = await get_products()
  let items = document.getElementById('items')

  for(product of products){
    items.innerHTML += Create_article(product)
  }
}
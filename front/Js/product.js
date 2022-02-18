/*<article class="cart__item">
<div class="cart__item__img">
  <img src="../images/product01.jpg" alt="Photographie d'un canapé">
</div>
<div class="cart__item__content">
  <div class="cart__item__content__titlePrice">
    <h2>Nom du produit</h2>
    <p>42,00 €</p>
  </div>
  <div class="cart__item__content__settings">
    <div class="cart__item__content__settings__quantity">
      <p>Qté : </p>
      <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="42">
    </div>
    <div class="cart__item__content__settings__delete">
      <p class="deleteItem" id="[item_Id]">Supprimer</p>
    </div>
  </div>
</div>
</article>
*/

const get_products = () => {
  fetch('http://localhost:3000/api/products/')
  .then((response)=>{response.json()})
    .then(datas=>{return datas})
  .catch(e=>console.log('API error'))
}

get_products()

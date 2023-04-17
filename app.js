const productsDOM = document.querySelector(".productsPart");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".listPart");

let cart = [];

//btns
let buttonDOM = [];

class Products{
    async getProducts(){
        try{
            let result = await fetch('products.json');
            let data = await result.json();

            let products = data.items;
            products = products.map(item =>{
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products
        }catch(error){
            console.log(error);
        }
    }
}

class UI{
    displayProducts(products){
        let result = '';
        products.forEach(products => {
            result +=`
        <div id="newCart">
            <div class="newTable">
                <img src=${products.image}>
                <li class="li1">${products.title}</li>
                <li class="li2">1&#160;&#160;=&#160;&#160;RM ${products.price}</li>
            </div>
            <p><button class="bag-btn" data-id=${products.id}>
            ADD
            </button></p>
        </div>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagBtns(){
        const btns = [...document.querySelectorAll(".bag-btn")];
        buttonDOM = btns;

        btns.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                btn.innerText = "In Cart";
                btn.disabled = true;
            }
            
            btn.addEventListener('click',(event)=>{
                event.target.innerText = "In Cart";
                event.target.style.backgroundColor = "black";
                event.target.disabled = true;
                // get product from products
                let cartItem = {...storage.getProduct(id), amount:1};
                
                // add product to the cart
                cart = [...cart,cartItem];
                
                // save cart in local storage
                storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show the cart
            });
        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = "RM "+parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        console.log(cartItems,cartTotal);
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <div class="part">
        <img src=${item.image} alt="product">
        <div class="top1">
            <h4>${item.title}</h4>
            <h5>RM ${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div class="bottom1">
            <i data-id=${item.id} class="fa-sharp fa-solid fa-chevron-up"></i>
            <p class="item-amount">${item.amount}</p>
            <i data-id=${item.id} class="fa-sharp fa-solid fa-chevron-down"></i>
        </div>
        </div>
        `;
        cartContent.appendChild(div);
        console.log(cartContent);
    }

    cartLogic(){
        cartContent.addEventListener('click', event=>{
            if(event.target.classList.contains("remove-item")){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement.parentElement);
                this.removeItem(id);
            }else if(event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }else if(event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;

                if(tempItem.amount > 0){
                    storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        storage.saveCart(cart);
        let btn = this.getSingleButton(id);
        btn.disabled = false;
        btn.innerHTML = `ADD`;
        btn.style.backgroundColor = "purple";
    }

    getSingleButton(id){
        return buttonDOM.find(btn => btn.dataset.id === id);
    }
}

class storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}
document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();

    //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        storage.saveProducts(products);
    }).then(()=>{
        ui.getBagBtns();
        ui.cartLogic();
    });
})
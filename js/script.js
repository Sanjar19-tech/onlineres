document.addEventListener('DOMContentLoaded', () => {
    // Barcha karusel konteynerlarini topamiz
    const carousels = document.querySelectorAll('.carousel-container');

    carousels.forEach(container => {
        const track = container.querySelector('.carousel-track');
        const items = track.querySelectorAll('.menu-item');
        const prevButton = container.querySelector('.prev-button');
        const nextButton = container.querySelector('.next-button');

        // Har bir karusel uchun indeksni saqlaymiz
        let currentIndex = 0;

        // ITEM_WIDTH ni aniq hisoblash (CSS dagi min-width + gap)
        const ITEM_WIDTH = 280; // style.css dan olingan min-width
        const GAP = 20;         // style.css dan olingan gap
        const SLIDE_AMOUNT = ITEM_WIDTH + GAP;

        // Ko'rinadigan elementlar sonini topish
        function getItemsPerView() {
            // Kontainerning toza ichki kengligi
            const containerWidth = container.querySelector('.carousel-window').clientWidth;
            // Nechta element sig'ishini hisoblash
            return Math.floor(containerWidth / SLIDE_AMOUNT);
        }

        // Karusel holatini yangilash funksiyasi
        function updateCarousel() {
            const itemsPerView = getItemsPerView();
            const totalItems = items.length;
            const maxIndex = totalItems - itemsPerView;

            // Chegara nazorati (Looping)
            if (currentIndex > maxIndex) {
                // Oldinga siljish chegarasi: boshiga qaytish
                currentIndex = 0;
            } else if (currentIndex < 0) {
                // Orqaga siljish chegarasi: oxiriga o'tish
                currentIndex = maxIndex > 0 ? maxIndex : 0;
            }

            // Siljitish miqdori: Hozirgi index * SLIDE_AMOUNT (pikselda)
            let translateXValue = SLIDE_AMOUNT * currentIndex;

            // Agar ko'rsatish kerak bo'lgan elementlar yo'q bo'lsa (ya'ni maxIndex < 0), siljitmaymiz
            if (maxIndex < 0) {
                translateXValue = 0;
            }

            // Karuselni siljitish uchun CSS transformdan foydalanish
            track.style.transform = `translateX(-${translateXValue}px)`;
        }

        // Tugmalar bosilganda indexni o'zgartirish
        nextButton.addEventListener('click', () => {
            currentIndex++;
            updateCarousel();
        });

        prevButton.addEventListener('click', () => {
            currentIndex--;
            updateCarousel();
        });

        // Ekran o'lchami o'zgarganda to'g'ri hisoblash va boshiga qaytarish
        window.addEventListener('resize', () => {
            currentIndex = 0;
            // Transformni o'chirib, to'g'ri holatni qayta hisoblash
            track.style.transform = 'translateX(0px)';
            updateCarousel();
        });

        // Boshlang'ich holatni o'rnatish
        updateCarousel();
    });
});

// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Taom savati uchun global o'zgaruvchilar ---
    // Savatni localStorage da saqlash tavsiya etiladi, lekin bu yerda oddiy obyekt ishlatiladi.
    let cartItems = {}; 
    const cartCountElement = document.getElementById('cart-count');

    // Savatdagi elementlar sonini yangilash
    function updateCartCount() {
        let totalCount = 0;
        for (const key in cartItems) {
            totalCount += cartItems[key].quantity;
        }
        cartCountElement.textContent = totalCount;
    }

    // --- Karusel (Carousel) Logikasi ---
    const menuContainer = document.getElementById('menu-container');

    // Karusel navigatsiyasini sozlash
    menuContainer.querySelectorAll('.carousel-container').forEach(container => {
        const track = container.querySelector('.carousel-track');
        const prevButton = container.querySelector('.prev-button');
        const nextButton = container.querySelector('.next-button');
        const itemWidth = track.querySelector('.menu-item').offsetWidth + 20; // Taom kengligi + margin

        let position = 0;

        // Karuselning oldingi/keyingi tugmalarini tinglash
        prevButton.addEventListener('click', () => {
            position += itemWidth * 2; 
            position = Math.min(position, 0); 
            track.style.transform = `translateX(${position}px)`;
        });

        nextButton.addEventListener('click', () => {
            // Minimal pozitsiyani hisoblash (oxirgi element ko'rinishi uchun)
            const trackWidth = track.scrollWidth;
            const containerWidth = container.querySelector('.carousel-window').offsetWidth;
            const minPosition = containerWidth - trackWidth;

            position -= itemWidth * 2; 
            position = Math.max(position, minPosition); 
            track.style.transform = `translateX(${position}px)`;
        });
    });

    // --- Miqdorni Boshqarish (Quantity Control) Logikasi ---
    menuContainer.querySelectorAll('.quantity-control.small').forEach(control => {
        const minusBtn = control.querySelector('[data-action="minus"]');
        const plusBtn = control.querySelector('[data-action="plus"]');
        const quantityInput = control.querySelector('.item-quantity-input');
        
        minusBtn.addEventListener('click', () => {
            let quantity = parseInt(quantityInput.value);
            if (quantity > 1) {
                quantityInput.value = quantity - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let quantity = parseInt(quantityInput.value);
            // Maksimal miqdorni 99 bilan cheklash (ixtiyoriy)
            quantityInput.value = Math.min(99, quantity + 1); 
        });
    });


    // --- Savatga Qo'shish (Add to Cart) Logikasi ---
    menuContainer.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Eng yaqin bo'lgan menu-item ota elementini topish
            const menuItem = e.target.closest('.menu-item');
            
            if (menuItem) {
                const itemKey = menuItem.getAttribute('data-item-key');
                const itemName = menuItem.querySelector('.item-name').textContent;
                const itemPriceText = menuItem.querySelector('.item-price').textContent;
                const quantityInput = menuItem.querySelector('.item-quantity-input');
                const quantity = parseInt(quantityInput.value);
                const priceValue = parseInt(menuItem.getAttribute('data-price'));
                
                // Savatga qo'shish
                if (cartItems[itemKey]) {
                    cartItems[itemKey].quantity += quantity;
                } else {
                    cartItems[itemKey] = {
                        name: itemName,
                        price: priceValue,
                        quantity: quantity
                    };
                }

                updateCartCount();
                
                // Xabar chiqarish va miqdorni 1 ga tiklash
                alert(`✅ ${itemName} dan ${quantity} dona savatga qo'shildi!\nSavatda jami taom soni: ${cartCountElement.textContent}`);
                quantityInput.value = 1; 
            }
        });
    });

    // Boshlang'ich yuklashda savat holatini tiklash (ixtiyoriy)
    updateCartCount(); 
});

// 

/**
 * Guldu Bloom Restorani uchun xaridlar savati logikasi
 */

// Global o'zgaruvchilar
const cart = JSON.parse(localStorage.getItem('restaurantCart')) || [];
const DELIVERY_FEE = 15000; // Yetkazib berish narxi 15,000 so'm (o'zgaruvchan)
const currencyFormatter = new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0
});

// DOM elementlari
const cartCountElement = document.getElementById('cart-count');
const menuContainer = document.getElementById('menu-container');
// Yangi: Submit tugmasini aniqlash (checkout.html sahifasida bo'lishi kerak)
const checkoutForm = document.getElementById('checkout-form'); 

// ----------------------------------------------------------------------
// 1. Yordamchi Funksiyalar (O'zgarishsiz)
// ----------------------------------------------------------------------

function saveCart() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

function formatPrice(price) {
    return currencyFormatter.format(price);
}

// ----------------------------------------------------------------------
// 2. Xaridlar Savati Asosiy Logikasi (O'zgarishsiz)
// ----------------------------------------------------------------------

function addItemToCart(key, name, price, quantity = 1) {
    const existingItem = cart.find(item => item.key === key);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ key, name, price, quantity });
    }

    saveCart();
    updateCartCount();
    if (document.getElementById('cart-list')) {
        renderCartItems();
    }
    console.log(`Mahsulot savatga qo'shildi: ${name}, Miqdor: ${quantity}`);
}

function changeItemQuantity(key, newQuantity) {
    const itemIndex = cart.findIndex(item => item.key === key);
    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        saveCart();
        updateCartCount();
        if (document.getElementById('cart-list')) {
            renderCartItems();
        }
    }
}


// ----------------------------------------------------------------------
// 3. Hodisalarni Boshqarish (Menu Sahifasi - O'zgarishsiz)
// ----------------------------------------------------------------------

if (menuContainer) {
    menuContainer.addEventListener('click', (event) => {
        const target = event.target;
        const addToCartBtn = target.closest('.add-to-cart-btn');
        const minusBtn = target.closest('.minus-btn-small');
        const plusBtn = target.closest('.plus-btn-small');

        // --- Mahsulot qo'shish (Qo'shish tugmasi) ---
        if (addToCartBtn) {
            const menuItem = addToCartBtn.closest('.menu-item');
            if (menuItem) {
                const key = menuItem.dataset.itemKey;
                const price = parseInt(menuItem.dataset.price);
                const name = menuItem.querySelector('.item-name').textContent;
                const quantityInput = menuItem.querySelector('.item-quantity-input');
                const quantity = parseInt(quantityInput.value);

                addItemToCart(key, name, price, quantity);
                quantityInput.value = 1;
            }
        }
        
        // --- Miqdorni kamaytirish (-) ---
        if (minusBtn) {
            const quantityInput = minusBtn.closest('.quantity-control').querySelector('.item-quantity-input');
            let currentQuantity = parseInt(quantityInput.value);
            if (currentQuantity > 1) {
                quantityInput.value = currentQuantity - 1;
            }
        }
        
        // --- Miqdorni oshirish (+) ---
        if (plusBtn) {
            const quantityInput = plusBtn.closest('.quantity-control').querySelector('.item-quantity-input');
            let currentQuantity = parseInt(quantityInput.value);
            quantityInput.value = currentQuantity + 1;
        }
    });
}


// ----------------------------------------------------------------------
// 4. To'lov Sahifasi Logikasi (checkout.html)
// ----------------------------------------------------------------------

function renderCartItems() {
    const cartList = document.getElementById('cart-list');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalPriceElement = document.getElementById('total-price'); 
    
    if (!cartList || !subtotalPriceElement) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const hasItems = cart.length > 0;
    const currentDeliveryFee = hasItems ? DELIVERY_FEE : 0;
    const totalPrice = subtotal + currentDeliveryFee;


    cartList.innerHTML = '';
    if (cart.length === 0) {
        cartList.innerHTML = '<li class="empty-cart-message">Savatda hozircha mahsulot yoʻq.</li>';
    } else {
        cart.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'cart-item';
            listItem.dataset.itemKey = item.key;
            
            listItem.innerHTML = `
                <span class="item-name-cart">${item.name}</span>
                <div class="cart-item-controls">
                    <div class="quantity-control cart-quantity-control">
                        <button type="button" class="quantity-btn cart-minus-btn" data-action="minus">-</button>
                        <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1" readonly>
                        <button type="button" class="quantity-btn cart-plus-btn" data-action="plus">+</button>
                    </div>
                    <span class="item-price-cart">${formatPrice(item.price * item.quantity)}</span>
                    <button class="remove-item-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartList.appendChild(listItem);
        });
    }

    subtotalPriceElement.textContent = formatPrice(subtotal);
    
    if (deliveryFeeElement) {
        deliveryFeeElement.textContent = formatPrice(currentDeliveryFee);
        if (totalPriceElement) {
             totalPriceElement.textContent = formatPrice(totalPrice);
        }
    }
}

document.addEventListener('click', (event) => {
    const target = event.target;
    const cartItem = target.closest('.cart-item');
    
    if (!cartItem) return;

    const key = cartItem.dataset.itemKey;
    const quantityInput = cartItem.querySelector('.cart-quantity-input');
    let currentQuantity = parseInt(quantityInput.value);

    // Savatdan o'chirish
    if (target.closest('.remove-item-btn')) {
        changeItemQuantity(key, 0); 
    }
    
    //   (-)
    if (target.closest('.cart-minus-btn')) {
        const newQuantity = currentQuantity - 1;
        changeItemQuantity(key, newQuantity);
    }
    
    //  (+)
    if (target.closest('.cart-plus-btn')) {
        const newQuantity = currentQuantity + 1;
        changeItemQuantity(key, newQuantity);
    }
});


// ----------------------------------------------------------------------
// 6. Submit 
// ----------------------------------------------------------------------

if (checkoutForm) {
    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault(); 
        
        cart.length = 0; // Massivni tezda bo'shatish
        saveCart(); // localStorage'ni yangilash
        updateCartCount(); // Sanog'ichlarni yangilash

        renderCartItems(); 

        alert("Buyurtmangiz muvaffaqiyatli rasmiylashtirildi! Savat tozalandi.");
        
    });
}



document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('cart-list')) {
        renderCartItems();
    }
});


// ----------------------------------------------------------------------
// 6. Buyurtmani Tasdiqlash 
// ----------------------------------------------------------------------

const checkoutButton = document.getElementById('checkout-button');

if (checkoutButton) {
    checkoutButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        cart.length = 0; // Global 'cart' massivini bo'shatish
        saveCart(); // LocalStorage'ni yangilash (bo'sh saqlash)

        updateCartCount(); 
        
        if (document.getElementById('cart-list')) {
            renderCartItems(); 
        }

        alert("Buyurtmangiz muvaffaqiyatli qabul qilindi! Savat tozalandi.");
        
    });
}
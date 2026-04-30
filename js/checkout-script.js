// checkout-script.js

document.addEventListener('DOMContentLoaded', () => {

    const cartList = document.getElementById('cart-list');
    const subtotalPriceDisplay = document.getElementById('subtotal-price');
    const deliveryFeeDisplay = document.getElementById('delivery-fee-display');
    const finalTotalPriceDisplay = document.getElementById('final-total-price');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    // Yetkazish usuli elementlari
    const deliveryMethodSelect = document.getElementById('delivery-method');
    const deliveryDetails = document.getElementById('delivery-details');
    
    // Yetkazish narxini sozlash (so'mda)
    const DELIVERY_FEE = 15000; 
    document.getElementById('delivery-price-info').textContent = formatPrice(DELIVERY_FEE);

    let currentCart = {};
    let currentOrderType = 'dine-in'; // Boshlang'ich qiymat

    // Narxni formatlash funksiyasi (120000 -> 120 000 so'm)
    function formatPrice(price) {
        return price.toLocaleString('uz-UZ') + " so'm";
    }

    // --- Savatni yuklash va dinamik ro'yxatni yaratish (Avvalgidek) ---
    function loadCartAndRender() {
        const cartData = localStorage.getItem('GulduBloomCart');
        currentCart = cartData ? JSON.parse(cartData) : {};
        
        cartList.innerHTML = '';
        let subtotal = 0;
        let isCartEmpty = true;

        for (const key in currentCart) {
            const item = currentCart[key];
            if (item.quantity > 0) {
                isCartEmpty = false;
                const totalItemPrice = item.price * item.quantity;
                subtotal += totalItemPrice;
                
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.setAttribute('data-item-key', key);
                
                itemElement.innerHTML = `
                    <img src="${item.image || './image/default.jfif'}" alt="${item.name}" class="cart-item-image">
                    <div class="item-details-cart">
                        <div class="name">${item.name}</div>
                        <div class="price-qty">
                            ${formatPrice(item.price)} x ${item.quantity} = <strong>${formatPrice(totalItemPrice)}</strong>
                        </div>
                    </div>
                    <button type="button" class="remove-item-btn" data-key="${key}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                cartList.appendChild(itemElement);
            }
        }
        
        if (isCartEmpty) {
             emptyCartMessage.style.display = 'block';
        } else {
             emptyCartMessage.style.display = 'none';
        }

        updateSummary(subtotal);
        addRemoveListeners();
    }

    // --- Savatni localStorage ga saqlash ---
    function saveCart() {
        localStorage.setItem('GulduBloomCart', JSON.stringify(currentCart));
    }
    
    // --- O'chirish event listenerlari (Avvalgidek) ---
    function addRemoveListeners() {
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const key = e.target.closest('button').getAttribute('data-key');
                if (currentCart[key]) {
                    delete currentCart[key];
                    saveCart();
                    loadCartAndRender();
                }
            });
        });
    }

    // --- Narxlar yig'indisini yangilash ---
    function updateSummary(subtotal) {
        let finalTotal = subtotal;
        let deliveryFee = 0;

        // Faqat Olib ketish/Yetkazish tanlanganda va Yetkazib berish usuli tanlanganda narxni qo'shish
        if (currentOrderType === 'takeout' && deliveryMethodSelect.value === 'delivery') {
            deliveryFee = DELIVERY_FEE;
            finalTotal += deliveryFee;
        }

        subtotalPriceDisplay.textContent = formatPrice(subtotal);
        deliveryFeeDisplay.textContent = formatPrice(deliveryFee);
        finalTotalPriceDisplay.textContent = formatPrice(finalTotal);

        // Savat bo'sh bo'lsa, tugmani o'chirish (Avvalgidek)
        const checkoutButton = document.getElementById('checkout-button');
        const totalItems = Object.values(currentCart).reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems === 0) {
            checkoutButton.disabled = true;
            checkoutButton.textContent = "🛒 Savat bo'sh";
            checkoutButton.style.backgroundColor = '#95a5a6';
        } else {
             checkoutButton.disabled = false;
             checkoutButton.textContent = "Buyurtmani Tasdiqlash";
             checkoutButton.style.backgroundColor = '#2ecc71';
        }
    }
    
    // --- Majburiy maydonlarni va Yetkazish ma'lumotlarini boshqarish ---
    function updateRequiredFields() {
        // Barcha maydonlarni majburiy emas qilish (Avvalgidek)
        document.querySelectorAll('.order-form input[required], .order-form select[required]').forEach(input => input.removeAttribute('required'));

        // Faqat hozirgi aktiv bo'limga tegishli maydonlarni majburiy qilish
        if (currentOrderType === 'dine-in') {
            document.getElementById('dine-in-table').setAttribute('required', '');
            document.getElementById('dine-in-name').setAttribute('required', '');
        } else if (currentOrderType === 'takeout') {
            document.getElementById('takeout-name').setAttribute('required', '');
            document.getElementById('takeout-phone').setAttribute('required', '');
            
            // Faqat "Uyga yetkazib berish" tanlansa, manzilni majburiy qilish
            if (deliveryMethodSelect.value === 'delivery') {
                document.getElementById('delivery-district').setAttribute('required', '');
                document.getElementById('takeout-address').setAttribute('required', '');
            }
        }
    }
    
    // --- Yetkazish ma'lumotlari bo'limini boshqaruvchi yangi funksiya ---
    function updateDeliveryDetails() {
        const isDelivery = deliveryMethodSelect.value === 'delivery';
        
        // Agar "Yetkazib berish" tanlansa, manzil maydonlarini ko'rsatish
        if (isDelivery) {
            deliveryDetails.style.display = 'block';
        } else {
            // Agar "Olib ketish" tanlansa, manzil maydonlarini yashirish
            deliveryDetails.style.display = 'none';
        }
        
        // Narx va majburiy maydonlarni yangilash
        let subtotal = Object.values(currentCart).reduce((sum, item) => sum + item.price * item.quantity, 0);
        updateSummary(subtotal);
        updateRequiredFields();
    }


    // --- Buyurtma turi (Tablar) logikasi (O'zgartirilgan) ---
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            document.querySelectorAll('.order-section').forEach(section => section.classList.remove('active'));
            const type = e.target.getAttribute('data-type');
            document.getElementById(`${type}-section`).classList.add('active');
            
            currentOrderType = type;
            
            // Tab o'zgarganda yetkazish bo'limini ham yangilash
            updateDeliveryDetails(); 
        });
    });

    // --- Yetkazish usuli o'zgarishi logikasi (Endi alohida funksiyani chaqiradi) ---
    deliveryMethodSelect.addEventListener('change', updateDeliveryDetails);

    // --- Buyurtmani tasdiqlash (Form Submission) logikasi (Avvalgidek) ---
    document.getElementById('main-checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (Object.keys(currentCart).length === 0) {
            alert("⚠️ Savat bo'sh. Buyurtma bera olmaysiz.");
            return;
        }

        // Barcha maydonlar to'ldirilganligini tekshirish (brauzerning o'ziga xos required tekshiruvi ham ishlaydi)
        if (!e.target.checkValidity()) {
            // Bu alert faqat eski brauzerlar uchun kerak, yangilari o'zi xabar beradi
             alert("Iltimos, barcha majburiy (*) maydonlarni to'ldiring.");
             return;
        }


        const orderDetails = {
            type: currentOrderType,
            items: currentCart,
            subtotal: parseFloat(subtotalPriceDisplay.textContent.replace(/\sso'm/g, '').replace(/,/g, '')),
            total: parseFloat(finalTotalPriceDisplay.textContent.replace(/\sso'm/g, '').replace(/,/g, '')),
            clientInfo: {}
        };
        
        // Ma'lumotlarni yig'ish (Avvalgidek)
        // ... (Bu qismi o'zgarmadi)
        if (currentOrderType === 'dine-in') {
            orderDetails.clientInfo.table = document.getElementById('dine-in-table').value;
            orderDetails.clientInfo.name = document.getElementById('dine-in-name').value;
        } else {
             orderDetails.clientInfo.name = document.getElementById('takeout-name').value;
             orderDetails.clientInfo.phone = document.getElementById('takeout-phone').value;
             orderDetails.clientInfo.method = deliveryMethodSelect.value;
             
             if (deliveryMethodSelect.value === 'delivery') {
                orderDetails.clientInfo.district = document.getElementById('delivery-district').value;
                orderDetails.clientInfo.address = document.getElementById('takeout-address').value;
             }
        }
        orderDetails.notes = document.getElementById('order-notes').value;
        
        console.log("Jo'natilayotgan buyurtma:", orderDetails);
        
        alert(`🎉 Buyurtmangiz qabul qilindi! Buyurtma turi: ${currentOrderType === 'dine-in' ? 'Stolda ovqatlanish' : orderDetails.clientInfo.method === 'delivery' ? 'Yetkazib berish' : 'Olib ketish'}\nUmumiy summa: ${finalTotalPriceDisplay.textContent}`);
        
        localStorage.removeItem('GulduBloomCart');
        loadCartAndRender();
    });


    // Boshlang'ich yuklash
    loadCartAndRender();
    // Boshlang'ich tabni faollashtirish
    document.querySelector(`.tab-button[data-type="${currentOrderType}"]`).click(); 
    
    // Sahifa yuklanganda birinchi marta tekshiruv o'tkazish
    updateDeliveryDetails();
});
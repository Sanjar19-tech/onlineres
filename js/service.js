document.addEventListener('DOMContentLoaded', () => {
    // --- Elementlar ---
    const receiptOverlay = document.getElementById('receipt-overlay');
    const receiptContent = document.getElementById('receipt-content');
    const receiptCloseBtn = document.getElementById('receipt-close-btn');
    const receiptItemsList = document.getElementById('receipt-items-list');
    const receiptTotalDisplay = document.getElementById('receipt-total-price');
    const receiptOrderIdDisplay = document.getElementById('receipt-order-id');

    // Narxni formatlash funksiyasi
    function formatPrice(price) {
        return price.toLocaleString('uz-UZ').replace(/\s/g, ',') + " so'm";
    }

    // --- Chekni yaratish va ko'rsatish funksiyasi ---
    function generateAndShowReceipt(orderContainer) {
        // 1. Ma'lumotlarni yig'ish
        const menuItems = orderContainer.querySelectorAll('.menu-item');
        const orderId = orderContainer.getAttribute('data-order-id') || 'N/A';
        let totalSum = 0;
        let itemsHtml = '';
        
        menuItems.forEach(item => {
            const name = item.querySelector('.item-name').textContent.trim();
            const unitPrice = parseInt(item.getAttribute('data-price'));
            const quantity = parseInt(item.getAttribute('data-qty'));
            
            // Xatolikka yo'l qo'ymaslik uchun tekshirish
            if (isNaN(unitPrice) || isNaN(quantity)) return; 
            
            const totalPriceItem = unitPrice * quantity;
            totalSum += totalPriceItem;
    
            itemsHtml += `
                <div class="receipt-item">
                    <span>${quantity} x ${name}</span>
                    <span>${formatPrice(totalPriceItem).replace(/\sso'm/g, '')}</span> 
                </div>
            `;
        });
    
        // Jami summaga 5000 so'm qo'shish
        totalSum += 5000;
    
        // 2. HTML Chekni to'ldirish
        receiptOrderIdDisplay.textContent = orderId;
        receiptItemsList.innerHTML = itemsHtml;
        receiptTotalDisplay.textContent = formatPrice(totalSum);
    
        // 3. Chekni ko'rsatish
        receiptOverlay.style.display = 'flex';
        
        // 4. 3 soniyadan keyin PDF yuklab olishni boshlash
        setTimeout(() => {
            downloadReceiptAsPdf(receiptContent, orderId);
        }, 3000); 
        
        // 5. 5 soniyadan keyin Chekni yashirish
        setTimeout(() => {
            receiptOverlay.style.display = 'none';
        }, 5000);
    }
    
    // --- PDF Yuklab olish funksiyasi (jsPDF va html2canvas yordamida) ---
    function downloadReceiptAsPdf(element, orderId) {
        const closeBtn = element.querySelector('.receipt-close-btn');
        closeBtn.style.display = 'none'; // Tugmani vaqtinchalik yashirish
        
        html2canvas(element, { scale: 3 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            
            // Chek formati uchun kichik o'lcham
            const imgWidth = 58; 
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [imgWidth + 10, imgHeight + 20] 
            });

            pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight); 
            pdf.save(`Chek_Buyurtma_${orderId}.pdf`);
            
            closeBtn.style.display = 'block'; // Tugmani qaytarish
        });
    }

    // --- Event Listenerlar ---
    
    // 1. Chekni olish tugmalariga tinglovchilarni qo'shish
    document.querySelectorAll('.get-receipt-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const orderContainer = e.target.closest('.chef-dashboard-container');
            if (orderContainer) {
                generateAndShowReceipt(orderContainer);
            }
        });
    });

    // 2. Chekni yopish tugmasi
    receiptCloseBtn.addEventListener('click', () => {
        receiptOverlay.style.display = 'none';
    });
    
    // 3. Yetkazib berish tugmasi (Buyurtmani o'chirish)
    document.querySelectorAll('.deliver-order-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const table = e.target.getAttribute('data-table');
            const orderContainer = e.target.closest('.chef-dashboard-container');
            
            if (confirm(`#${table} stolidagi buyurtmani yakunlaysizmi?`)) {
                 // Foydalanuvchi tasdiqladi
                alert(`✅ Buyurtma Stol #${table} ga yetkazildi va yopildi.`);
                orderContainer.remove(); // Buyurtmani ekrandan o'chirish
            }
        });
    });
});
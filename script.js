// CONFIGURATION - Edit this variable to set your WhatsApp number
// Format: country code + number without '+' or spaces (e.g., 212612345678 for Morocco)
const WHATSAPP_NUMBER = '212612345678';

// State Management
let products = [];
let cart = JSON.parse(localStorage.getItem('alhikma_cart')) || [];
let currentFilter = 'all';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartContent = document.getElementById('cartContent');
const cartBadge = document.getElementById('cartBadge');
const mobileCartBadge = document.getElementById('mobileCartBadge');
const cartOverlay = document.getElementById('cartOverlay');
const loadingOverlay = document.getElementById('loadingOverlay');
const whatsappModal = document.getElementById('whatsappModal');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    try {
        // Load products
        await loadProducts();
        
        // Setup event listeners
        setupEventListeners();
        
        // Render initial cart state
        updateCartUI();
        
        // Hide loading screen
        setTimeout(() => {
            loadingOverlay.classList.add('opacity-0');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, 1000);
        
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorState();
    }
}

// Data Loading
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to load products');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i data-lucide="alert-circle" class="w-16 h-16 text-terracotta mx-auto mb-4"></i>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h3>
                <p class="text-gray-600">Impossible de charger les produits. Veuillez réessayer.</p>
                <button onclick="location.reload()" class="mt-4 bg-terracotta text-white px-6 py-2 rounded-lg">
                    Recharger la page
                </button>
            </div>
        `;
        lucide.createIcons();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Cart toggles
    document.getElementById('desktopCartBtn')?.addEventListener('click', openCart);
    document.getElementById('mobileCartBtn')?.addEventListener('click', openCart);
    document.getElementById('closeCart')?.addEventListener('click', closeCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
    
    // Checkout flow
    document.getElementById('checkoutBtn')?.addEventListener('click', openWhatsAppModal);
    document.getElementById('cancelOrder')?.addEventListener('click', closeWhatsAppModal);
    document.getElementById('whatsappModal')?.addEventListener('click', (e) => {
        if (e.target === whatsappModal) closeWhatsAppModal();
    });
    
    // Order form submission
    document.getElementById('orderForm')?.addEventListener('submit', handleOrderSubmit);
    
    // International shipping checkbox
    document.getElementById('internationalShipping')?.addEventListener('change', () => {
        updateCartUI();
    });
    
    // Download catalogue
    document.getElementById('downloadCatalogueBtn')?.addEventListener('click', generatePDF);
    
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-terracotta', 'text-white', 'border-terracotta');
                b.classList.add('border-gray-300', 'text-gray-600');
            });
            e.target.classList.remove('border-gray-300', 'text-gray-600');
            e.target.classList.add('active', 'bg-terracotta', 'text-white', 'border-terracotta');
            
            // Filter products - use exact category name from JSON
            currentFilter = e.target.dataset.category;
            renderProducts();
        });
    });
    
    // Mobile nav active state
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active', 'text-terracotta'));
            this.classList.add('active', 'text-terracotta');
        });
    });
}

// Error State
function showErrorState() {
    loadingOverlay.innerHTML = `
        <div class="text-center text-white p-8">
            <i data-lucide="alert-triangle" class="w-16 h-16 mx-auto mb-4"></i>
            <h2 class="text-2xl font-bold mb-2">Oups ! Un problème est survenu</h2>
            <p class="mb-4">L'application n'a pas pu démarrer correctement.</p>
            <button onclick="location.reload()" class="bg-white text-terracotta px-6 py-2 rounded-lg font-bold">
                Réessayer
            </button>
        </div>
    `;
    lucide.createIcons();
}

// Helper function to clean image URLs
function cleanImageUrl(url) {
    if (!url) return '';
    // Remove trailing "  webp" or similar artifacts
    return url.replace(/\s+webp$/i, '').trim();
}

// Rendering
function renderProducts() {
    const filtered = currentFilter === 'all' 
        ? products 
        : products.filter(p => p.category === currentFilter);
    
    if (filtered.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-20 text-gray-400">
                <i data-lucide="package-x" class="w-16 h-16 mx-auto mb-4"></i>
                <p>Aucun produit dans cette catégorie</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    productsGrid.innerHTML = filtered.map(product => {
        const imageUrl = cleanImageUrl(product.image);
        const originText = product.origin ? `<i data-lucide="map-pin" class="w-3 h-3"></i> ${product.origin}<span class="mx-2">•</span>` : '';
        
        return `
        <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full" data-category="${product.category}">
            <div class="relative h-64 overflow-hidden bg-gray-100">
                <img src="${imageUrl}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy" onerror="this.src='https://static.photos/food/640x360/1'">
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-deep-green shadow">
                    ${product.price} DHS
                </div>
                <div class="absolute top-4 left-4 bg-terracotta text-white px-3 py-1 rounded-full text-xs font-medium shadow">
                    ${product.category}
                </div>
            </div>
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-serif text-xl font-bold text-deep-green leading-tight">${product.name}</h3>
                </div>
                <p class="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    ${originText}
                    <i data-lucide="scale" class="w-3 h-3"></i> ${product.weight || 'N/A'}
                </p>
                <p class="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">${product.description_fr || product.description || ''}</p>
                <button onclick="addToCart(${product.id})" class="w-full bg-terracotta hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group">
                    <i data-lucide="shopping-cart" class="w-5 h-5 group-hover:animate-bounce"></i>
                    Ajouter au panier
                </button>
            </div>
        </div>
    `}).join('');
    
    lucide.createIcons();
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: cleanImageUrl(product.image),
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showAddedFeedback(product.name);
    
    // Open cart on mobile when adding first item
    if (window.innerWidth < 768 && cart.length === 1 && existingItem === undefined) {
        openCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('alhikma_cart', JSON.stringify(cart));
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isInternational = document.getElementById('internationalShipping')?.checked || false;
    
    let shipping = 0;
    if (isInternational) {
        shipping = 250;
    } else if (subtotal <= 499 && subtotal > 0) {
        shipping = 25;
    }
    
    return { subtotal, shipping, total: subtotal + shipping };
}

function updateCartUI() {
    const { subtotal, shipping, total } = calculateTotals();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update badges
    cartBadge.textContent = itemCount;
    mobileCartBadge.textContent = itemCount;
    cartBadge.style.opacity = itemCount > 0 ? '1' : '0';
    mobileCartBadge.style.opacity = itemCount > 0 ? '1' : '0';
    
    // Update cart content
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i data-lucide="shopping-bag" class="w-12 h-12 text-gray-300"></i>
                </div>
                <p class="text-lg font-medium mb-2">Votre panier est vide</p>
                <p class="text-sm text-center mb-6">Découvrez nos produits du terroir marocain</p>
                <a href="#produits" onclick="closeCart()" class="text-terracotta font-medium hover:underline">
                    Continuer les achats →
                </a>
            </div>
        `;
    } else {
        cartContent.innerHTML = cart.map(item => `
            <div class="cart-item flex gap-4 mb-6 pb-6 border-b border-gray-100">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">
                <div class="flex-1">
                    <h4 class="font-bold text-deep-green text-sm mb-1">${item.name}</h4>
                    <p class="text-terracotta font-bold text-sm mb-2">${item.price} DHS</p>
                    <div class="flex items-center gap-3">
                        <button onclick="updateQuantity(${item.id}, -1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <i data-lucide="minus" class="w-4 h-4"></i>
                        </button>
                        <span class="font-medium w-8 text-center">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                        </button>
                        <button onclick="removeFromCart(${item.id})" class="ml-auto text-red-500 hover:text-red-700 p-1">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Update totals
    document.getElementById('cartSubtotal').textContent = `${subtotal} DHS`;
    const shippingEl = document.getElementById('cartShipping');
    if (cart.length === 0) {
        shippingEl.textContent = '-';
    } else if (shipping === 0) {
        shippingEl.textContent = 'Gratuite';
        shippingEl.className = 'font-semibold text-green-600';
    } else {
        shippingEl.textContent = `${shipping} DHS`;
        shippingEl.className = 'font-semibold text-gray-700';
    }
    document.getElementById('cartTotal').textContent = `${total} DHS`;
    
    // Update modal totals if open
    const modalSubtotal = document.getElementById('modalSubtotal');
    const modalTotal = document.getElementById('modalTotal');
    const modalShipping = document.getElementById('modalShipping');
    
    if (modalSubtotal) modalSubtotal.textContent = `${subtotal} DHS`;
    if (modalTotal) modalTotal.textContent = `${total} DHS`;
    if (modalShipping) {
        if (shipping === 0) {
            modalShipping.textContent = 'Gratuite';
            modalShipping.className = 'text-green-600 font-medium';
        } else {
            modalShipping.textContent = `${shipping} DHS`;
            modalShipping.className = 'text-gray-700 font-medium';
        }
    }
    
    // Enable/disable checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
        if (cart.length === 0) {
            checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
    
    lucide.createIcons();
}

// UI Interactions
function openCart() {
    cartSidebar.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden');
    setTimeout(() => cartOverlay.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.add('translate-x-full');
    cartOverlay.classList.add('opacity-0');
    setTimeout(() => cartOverlay.classList.add('hidden'), 300);
    document.body.style.overflow = '';
}

function showAddedFeedback(productName) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-deep-green text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3 transform translate-x-full transition-transform duration-300';
    toast.innerHTML = `
        <i data-lucide="check-circle" class="w-5 h-5 text-saffron"></i>
        <div>
            <p class="font-bold text-sm">Ajouté au panier !</p>
            <p class="text-xs text-white/80">${productName}</p>
        </div>
    `;
    document.body.appendChild(toast);
    lucide.createIcons();
    
    // Animate in
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// WhatsApp Integration
function openWhatsAppModal() {
    if (cart.length === 0) return;
    whatsappModal.classList.remove('hidden');
    whatsappModal.classList.add('flex');
    updateCartUI(); // Refresh totals
}

function closeWhatsAppModal() {
    whatsappModal.classList.add('hidden');
    whatsappModal.classList.remove('flex');
}

function handleOrderSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('customerName').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    
    if (!name || !address) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Clear cart after order
    cart = [];
    saveCart();
    updateCartUI();
    closeWhatsAppModal();
    closeCart();
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
}

function generateWhatsAppMessage() {
    const name = document.getElementById('customerName').value;
    const address = document.getElementById('customerAddress').value;
    const phone = document.getElementById('customerPhone').value;
    const isInternational = document.getElementById('internationalShipping').checked;
    
    const { subtotal, shipping, total } = calculateTotals();
    
    let message = `*Nouvelle Commande - Coopérative Al Hikma*\n\n`;
    message += `*Client:* ${name}\n`;
    message += `*Téléphone:* ${phone || 'Non fourni'}\n`;
    message += `*Adresse:* ${address}\n`;
    message += `*Type:* ${isInternational ? 'International (+250 DHS)' : 'National'}\n\n`;
    message += `*Produits commandés:*\n`;
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} = ${item.price * item.quantity} DHS\n`;
    });
    
    message += `\n*Sous-total:* ${subtotal} DHS\n`;
    message += `*Livraison:* ${shipping === 0 ? 'Gratuite' : shipping + ' DHS'}\n`;
    message += `*TOTAL:* ${total} DHS\n\n`;
    message += `Merci de confirmer ma commande.`;
    
    return message;
}

function openWhatsAppDirect() {
    const message = encodeURIComponent('Bonjour, je souhaite avoir des informations sur vos produits du terroir marocain.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}

// PDF Catalogue Generation (version corrigée et robuste)
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Couleurs
    const terracotta = [211, 84, 0];
    const deepGreen = [27, 67, 50];
    const saffron = [243, 156, 18];
    const lightGray = [245, 245, 245];
    
    // Dimensions et marges
    const pageWidth = 210;
    const marginX = 15;
    const marginY = 20;
    const columnGap = 10;
    const cellWidth = (pageWidth - 2 * marginX - columnGap) / 2;
    const imgWidth = cellWidth - 10; // marge interne
    const imgHeight = 60;            // hauteur fixe pour l'image
    const rowHeight = imgHeight + 40; // espace pour le texte sous l'image
    
    let currentPage = 1;
    let yPos = marginY;
    
    // En-tête
    function addHeader() {
        doc.setFillColor(...terracotta);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Coopérative Al Hikma', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Produits du Terroir Marocain', pageWidth / 2, 30, { align: 'center' });
        doc.setDrawColor(...saffron);
        doc.setLineWidth(1);
        doc.line(marginX, 45, pageWidth - marginX, 45);
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text(`Catalogue généré le ${new Date().toLocaleDateString('fr-FR')}`, marginX, 53);
        yPos = 65;
    }
    
    // Pied de page
    function addFooter() {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFillColor(lightGray);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        doc.setTextColor(...deepGreen);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Coopérative Al Hikma - Taliouine, Maroc', pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text(`WhatsApp: +${WHATSAPP_NUMBER} | contact@cooperative-alhikma.ma`, pageWidth / 2, pageHeight - 4, { align: 'center' });
        doc.text(`Page ${currentPage}`, pageWidth - marginX, pageHeight - 4, { align: 'right' });
    }
    
    // Charger une image en base64 avec fallback
    async function loadImageAsDataURL(url) {
        if (!url) return null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn(`Impossible de charger l'image : ${url}`, error);
            return null;
        }
    }
    
    // Créer un placeholder (image grise)
    function createPlaceholder() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666666';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Image', 70, 100);
        return canvas.toDataURL();
    }
    
    // Charger toutes les images (en parallèle, avec fallback)
    const imagePromises = products.map(product => loadImageAsDataURL(cleanImageUrl(product.image)));
    const results = await Promise.allSettled(imagePromises);
    const productImages = results.map((result, idx) => {
        if (result.status === 'fulfilled' && result.value) {
            return result.value;
        } else {
            console.warn(`Image manquante pour ${products[idx].name}, utilisation d'un placeholder.`);
            return createPlaceholder();
        }
    });
    
    // Démarrer le PDF
    addHeader();
    
    // Parcourir les produits
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const imgData = productImages[i];
        
        const column = i % 2;                // 0 = gauche, 1 = droite
        const row = Math.floor(i / 2) % 5;    // 0 à 4 (5 lignes max)
        
        // Nouvelle page nécessaire ?
        if (row === 0 && i !== 0) {
            addFooter();
            doc.addPage();
            currentPage++;
            addHeader();
        }
        
        const x = marginX + column * (cellWidth + columnGap);
        const y = yPos + row * rowHeight;
        
        // Vérifier si on dépasse la page (sécurité)
        if (y + rowHeight > doc.internal.pageSize.height - 25) {
            addFooter();
            doc.addPage();
            currentPage++;
            addHeader();
            // Recommencer avec la même ligne et colonne sur la nouvelle page
            const newY = yPos;
            const newX = marginX + column * (cellWidth + columnGap);
            placeItem(doc, product, imgData, newX, newY, imgWidth, imgHeight);
        } else {
            placeItem(doc, product, imgData, x, y, imgWidth, imgHeight);
        }
    }
    
    // Dernier pied de page
    addFooter();
    
    // Sauvegarde
    doc.save('catalogue-cooperative-alhikma.pdf');
}

// Fonction utilitaire pour placer un produit dans le PDF
function placeItem(doc, product, imgData, x, y, imgWidth, imgHeight) {
    // Ajouter l'image (avec fallback si format inconnu)
    try {
        doc.addImage(imgData, 'JPEG', x + 5, y, imgWidth, imgHeight, undefined, 'FAST');
    } catch (e) {
        try {
            doc.addImage(imgData, 'PNG', x + 5, y, imgWidth, imgHeight);
        } catch (err) {
            console.warn('Erreur lors de l\'ajout de l\'image pour', product.name);
        }
    }
    
    // Nom du produit
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(211, 84, 0);
    const nameY = y + imgHeight + 8;
    doc.text(product.name, x + 5, nameY, { maxWidth: imgWidth });
    
    // Prix et poids
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(27, 67, 50);
    const priceWeightY = nameY + 5;
    doc.text(`${product.price} DHS • ${product.weight || 'N/A'}`, x + 5, priceWeightY);
}
    
    // Fonction pour ajouter le pied de page
    function addFooter() {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFillColor(lightGray);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        doc.setTextColor(...deepGreen);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Coopérative Al Hikma - Taliouine, Maroc', pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text(`WhatsApp: +${WHATSAPP_NUMBER} | contact@cooperative-alhikma.ma`, pageWidth / 2, pageHeight - 4, { align: 'center' });
        doc.text(`Page ${currentPage}`, pageWidth - marginX, pageHeight - 4, { align: 'right' });
    }
    
    // Charger toutes les images en base64 (asynchrone)
    const productImages = await Promise.all(products.map(async (product) => {
        const imageUrl = cleanImageUrl(product.image);
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Image non trouvée');
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn(`Impossible de charger l'image pour ${product.name}`, error);
            // Retourner une image de remplacement (carré gris)
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666666';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('Image', 70, 100);
            return canvas.toDataURL();
        }
    }));
    
    // Ajouter la première page avec en-tête
    addHeader();
    
    // Parcourir les produits avec leur image chargée
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const imgData = productImages[i];
        
        // Déterminer la colonne (0 = gauche, 1 = droite)
        const column = i % 2;
        // Ligne = 0-indexée (5 lignes max par page)
        const row = Math.floor(i / 2) % 5;
        
        // Si on commence une nouvelle page (row === 0 et i !== 0)
        if (row === 0 && i !== 0) {
            // Pied de page de la page actuelle
            addFooter();
            // Nouvelle page
            doc.addPage();
            currentPage++;
            addHeader();
        }
        
        // Calcul de la position X en fonction de la colonne
        const x = marginX + column * (cellWidth + columnGap);
        const y = yPos + row * (imgHeight + 40); // 40 = marge pour le texte
        
        // Vérifier si le contenu dépasse la page
        if (y + imgHeight + 35 > doc.internal.pageSize.height - 25) {
            // Pied de page et nouvelle page
            addFooter();
            doc.addPage();
            currentPage++;
            addHeader();
            // Recalculer y (retour à la première ligne)
            const newY = yPos;
            const newX = marginX + column * (cellWidth + columnGap);
            // Placer l'élément en haut de la nouvelle page
            placeItem(doc, product, imgData, newX, newY, imgWidth, imgHeight);
        } else {
            placeItem(doc, product, imgData, x, y, imgWidth, imgHeight);
        }
    }
    
    // Pied de page de la dernière page
    addFooter();
    
    // Sauvegarder le PDF
    doc.save('catalogue-cooperative-alhikma.pdf');
}

// Fonction utilitaire pour placer un produit dans le PDF
function placeItem(doc, product, imgData, x, y, imgWidth, imgHeight) {
    // Image
    try {
        doc.addImage(imgData, 'JPEG', x + 5, y, imgWidth, imgHeight, undefined, 'FAST');
    } catch (e) {
        // Fallback si le format n'est pas JPEG
        doc.addImage(imgData, 'PNG', x + 5, y, imgWidth, imgHeight);
    }
    
    // Nom du produit
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(211, 84, 0); // terracotta
    const nameY = y + imgHeight + 8;
    doc.text(product.name, x + 5, nameY, { maxWidth: imgWidth });
    
    // Prix et poids
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(27, 67, 50); // deep-green
    const priceWeightY = nameY + 5;
    doc.text(`${product.price} DHS • ${product.weight || 'N/A'}`, x + 5, priceWeightY);
}

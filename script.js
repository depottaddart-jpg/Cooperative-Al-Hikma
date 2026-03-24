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

// PDF Catalogue Generation (Mise à jour avec Images et Grille 2 colonnes)
async function generatePDF() {
    // UI Feedback : Indiquer le chargement sur le bouton
    const btn = document.getElementById('downloadCatalogueBtn');
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Création du PDF...';
        btn.disabled = true;
        lucide.createIcons();
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Colors
        const terracotta = [211, 84, 0];
        const deepGreen = [27, 67, 50];
        const saffron = [243, 156, 18];
        
        // Fonction pour dessiner l'en-tête
        const drawHeader = () => {
            doc.setFillColor(...terracotta);
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Coopérative Al Hikma', 105, 20, { align: 'center' });
            doc.setFontSize(12);
            doc.text('Produits du Terroir Marocain', 105, 30, { align: 'center' });
            
            doc.setDrawColor(...saffron);
            doc.setLineWidth(2);
            doc.line(20, 45, 190, 45);
            
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Catalogue généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 52);
        };

        // Fonction pour dessiner le pied de page
        const drawFooter = () => {
            doc.setFillColor(245, 247, 240);
            doc.rect(0, 270, 210, 27, 'F');
            
            doc.setTextColor(...deepGreen);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Coopérative Al Hikma - Taliouine, Maroc', 105, 280, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`WhatsApp: +${WHATSAPP_NUMBER} | Email: contact@cooperative-alhikma.ma`, 105, 288, { align: 'center' });
        };

        // Fonction pour charger une image en Base64 (nécessaire pour jsPDF)
        const loadImageBase64 = (url) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    try {
                        resolve(canvas.toDataURL('image/jpeg', 0.8));
                    } catch (e) {
                        resolve(null); // Fallback en cas d'erreur de sécurité CORS
                    }
                };
                img.onerror = () => resolve(null);
                img.src = url;
            });
        };

        drawHeader();
        
        // Configuration de la grille
        const startY = 65;
        const startX = 20;
        const rowHeight = 40;
        const colWidth = 82; // Largeur d'une colonne
        const gutterX = 6;   // Espace entre les colonnes
        const itemsPerPage = 10;
        
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            
            // Nouvelle page tous les 10 produits
            if (i > 0 && i % itemsPerPage === 0) {
                drawFooter();
                doc.addPage();
                drawHeader();
            }
            
            // Calcul de la position X et Y
            const colIndex = i % 2; // 0 (gauche) ou 1 (droite)
            const rowIndex = Math.floor((i % itemsPerPage) / 2); // 0 à 4
            
            const currentX = startX + colIndex * (colWidth + gutterX);
            const currentY = startY + rowIndex * rowHeight;
            
            // Dessiner l'image
            const imgData = await loadImageBase64(cleanImageUrl(product.image));
            const imgSize = 30; // 30x30 mm
            
            if (imgData) {
                doc.addImage(imgData, 'JPEG', currentX, currentY, imgSize, imgSize);
            } else {
                // Zone de remplacement si l'image ne charge pas
                doc.setFillColor(235, 235, 235);
                doc.rect(currentX, currentY, imgSize, imgSize, 'F');
                doc.setTextColor(150, 150, 150);
                doc.setFontSize(8);
                doc.text('Image', currentX + 15, currentY + 15, { align: 'center' });
            }
            
            // Textes à côté de l'image
            const textX = currentX + imgSize + 4;
            let textY = currentY + 6;
            
            // Nom du produit
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...terracotta);
            const nameLines = doc.splitTextToSize(product.name, colWidth - imgSize - 4);
            doc.text(nameLines, textX, textY);
            textY += (nameLines.length * 5);
            
            // Poids
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`Poids: ${product.weight || 'N/A'}`, textX, textY);
            textY += 6;
            
            // Prix
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...deepGreen);
            doc.text(`${product.price} DHS`, textX, textY);
        }
        
        // Ajouter le pied de page sur la toute dernière page
        drawFooter();
        
        // Sauvegarder le fichier
        doc.save('catalogue-cooperative-alhikma.pdf');
        
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        alert("Une erreur s'est produite lors de la création du catalogue.");
    } finally {
        // Restaurer le bouton à son état initial
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            lucide.createIcons();
        }
    }
}

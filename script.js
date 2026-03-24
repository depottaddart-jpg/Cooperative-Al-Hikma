// CONFIGURATION
const WHATSAPP_NUMBER = '212612345678';

// État de l'application
let products = [];
let cart = JSON.parse(localStorage.getItem('alhikma_cart')) || [];
let currentFilter = 'all';

// Éléments DOM
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartContent = document.getElementById('cartContent');
const cartBadge = document.getElementById('cartBadge');
const mobileCartBadge = document.getElementById('mobileCartBadge');
const cartOverlay = document.getElementById('cartOverlay');
const loadingOverlay = document.getElementById('loadingOverlay');
const whatsappModal = document.getElementById('whatsappModal');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadProducts();
        setupEventListeners();
        updateCartUI();
        // Masquer le chargement
        setTimeout(() => {
            if(loadingOverlay) {
                loadingOverlay.classList.add('opacity-0');
                setTimeout(() => { loadingOverlay.style.display = 'none'; }, 500);
            }
        }, 1000);
    } catch (error) {
        console.error('Erreur initialisation:', error);
    }
}

// Chargement des données
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Erreur produits:', error);
    }
}

// Événements
function setupEventListeners() {
    document.getElementById('desktopCartBtn')?.addEventListener('click', openCart);
    document.getElementById('mobileCartBtn')?.addEventListener('click', openCart);
    document.getElementById('closeCart')?.addEventListener('click', closeCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
    document.getElementById('checkoutBtn')?.addEventListener('click', openWhatsAppModal);
    document.getElementById('cancelOrder')?.addEventListener('click', closeWhatsAppModal);
    document.getElementById('orderForm')?.addEventListener('submit', handleOrderSubmit);
    document.getElementById('downloadCatalogueBtn')?.addEventListener('click', generatePDF);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'bg-terracotta', 'text-white'));
            e.target.classList.add('active', 'bg-terracotta', 'text-white');
            currentFilter = e.target.dataset.category;
            renderProducts();
        });
    });
}

// Affichage des produits
function renderProducts() {
    const filtered = currentFilter === 'all' ? products : products.filter(p => p.category === currentFilter);
    if (!productsGrid) return;
    
    productsGrid.innerHTML = filtered.map(product => `
        <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
            <div class="relative h-64 overflow-hidden bg-gray-100">
                <img src="${product.image}" class="w-full h-full object-cover" alt="${product.name}">
                <div class="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-deep-green">${product.price} DHS</div>
            </div>
            <div class="p-6 flex-1 flex flex-col">
                <h3 class="font-serif text-xl font-bold text-deep-green mb-2">${product.name}</h3>
                <p class="text-xs text-gray-500 mb-4">${product.weight || ''}</p>
                <button onclick="addToCart(${product.id})" class="w-full bg-terracotta text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-all">
                    Ajouter au panier
                </button>
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

// Logique du Panier
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    if (existing) { existing.quantity++; } else { cart.push({...product, quantity: 1}); }
    saveCart(); 
    updateCartUI();
    openCart();
}

function saveCart() { 
    localStorage.setItem('alhikma_cart', JSON.stringify(cart)); 
}

function updateCartUI() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if(cartBadge) cartBadge.textContent = cart.length;
    if(mobileCartBadge) mobileCartBadge.textContent = cart.length;
    
    if(cartContent) {
        cartContent.innerHTML = cart.map(item => `
            <div class="flex gap-4 mb-4 pb-4 border-b">
                <div class="flex-1">
                    <h4 class="font-bold text-sm">${item.name}</h4>
                    <p class="text-terracotta text-sm">${item.price} DHS x ${item.quantity}</p>
                </div>
            </div>
        `).join('');
    }
    const totalEl = document.getElementById('cartTotal');
    if(totalEl) totalEl.textContent = `${subtotal} DHS`;
}

function openCart() { cartSidebar?.classList.remove('translate-x-full'); cartOverlay?.classList.remove('hidden'); }
function closeCart() { cartSidebar?.classList.add('translate-x-full'); cartOverlay?.classList.add('hidden'); }
function openWhatsAppModal() { whatsappModal?.classList.remove('hidden'); whatsappModal?.classList.add('flex'); }
function closeWhatsAppModal() { whatsappModal?.classList.add('hidden'); }

function handleOrderSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('customerName').value;
    let msg = `*Nouvelle Commande*\n*Client:* ${name}\n\n`;
    cart.forEach(item => { msg += `- ${item.name} (x${item.quantity}) : ${item.price * item.quantity} DHS\n`; });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

// --- FONCTION GÉNÉRATION PDF (CORRIGÉE ET COMPLÈTE) ---
async function generatePDF() {
    const btn = document.getElementById('downloadCatalogueBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "Génération du catalogue...";

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Convertisseur d'image WebP -> JPEG avec Proxy pour éviter les erreurs CORS
        const getImageData = (url) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = "#FFFFFF"; // Fond blanc
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.onerror = () => resolve(null);
                // Utilisation de weserv.nl pour convertir et contourner les restrictions Blogger
                img.src = 'https://images.weserv.nl/?url=' + encodeURIComponent(url) + '&output=jpg';
            });
        };

        const drawHeader = (pageNumber) => {
            doc.setFillColor(211, 84, 0); // Terracotta
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("COOPÉRATIVE AL HIKMA", 105, 20, { align: "center" });
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Catalogue des Produits du Terroir Marocain", 105, 30, { align: "center" });
            doc.text(`Page ${pageNumber}`, 190, 35);
        };

        let itemsPerPage = 10;
        let yStart = 50;
        let rowHeight = 45;

        for (let i = 0; i < products.length; i++) {
            // Nouvelle page
            if (i % itemsPerPage === 0) {
                if (i > 0) doc.addPage();
                drawHeader(Math.floor(i / itemsPerPage) + 1);
            }

            const p = products[i];
            const itemIndex = i % itemsPerPage;
            const col = i % 2; // 0 ou 1
            const row = Math.floor(itemIndex / 2); // 0 à 4
            
            const x = col === 0 ? 15 : 110;
            const y = yStart + (row * rowHeight);

            // 1. Image
            const imgData = await getImageData(p.image);
            if (imgData) {
                doc.addImage(imgData, 'JPEG', x, y, 35, 35);
            } else {
                doc.setDrawColor(200);
                doc.rect(x, y, 35, 35);
            }

            // 2. Infos Produit (à côté de l'image)
            const textX = x + 38;
            doc.setTextColor(27, 67, 50); // Deep Green
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            const wrappedName = doc.splitTextToSize(p.name, 45);
            doc.text(wrappedName, textX, y + 8);

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            doc.text(`Poids: ${p.weight || 'N/A'}`, textX, y + 20);

            doc.setFontSize(11);
            doc.setTextColor(211, 84, 0); // Terracotta
            doc.text(`${p.price} DHS`, textX, y + 30);
        }

        doc.save("Catalogue_Al_Hikma.pdf");

    } catch (err) {
        console.error(err);
        alert("Une erreur est survenue lors de la création du PDF.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // ===== 1. CONFIGURATION =====
    
    // !!! IMPORTANT: REPLACE WITH YOUR STRIPE KEY
    const STRIPE_PUBLISHABLE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY'; 
    const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

    // !!! IMPORTANT: REPLACE WITH YOUR PRODUCT DATA
    // This is your "database".
    // 'id' is a unique identifier.
    // 'priceId' is the Price ID from your Stripe Dashboard.
    // 'videoUrl' is the YouTube/Vimeo *embed* link.
    const allProducts = [
        {
            id: 1,
            name: 'Minimalist Vlog Bundle',
            description: 'Clean, aesthetic templates for lifestyle vloggers and creators.',
            price: 29.99,
            priceId: 'price_1PXXXXXXXXXXXXXX', // <-- REPLACE
            category: 'Lifestyle',
            thumbnail: 'https://via.placeholder.com/400x300.png?text=Minimalist+Vlog',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // <-- REPLACE
        },
        {
            id: 2,
            name: 'Fitness & Gym Bundle',
            description: 'Dynamic, high-energy templates for fitness influencers.',
            price: 34.99,
            priceId: 'price_1PXXXXXXXXXXXXXX', // <-- REPLACE
            category: 'Fitness',
            thumbnail: 'https://via.placeholder.com/400x300.png?text=Fitness+Gym',
            videoUrl: 'https://www.youtube.com/embed/videoId2' // <-- REPLACE
        },
        {
            id: 3,
            name: 'Foodie Recipe Bundle',
            description: 'Deliciously designed templates for food bloggers and restaurants.',
            price: 24.99,
            priceId: 'price_1PXXXXXXXXXXXXXX', // <-- REPLACE
            category: 'Food',
            thumbnail: 'https://via.placeholder.com/400x300.png?text=Foodie+Recipe',
            videoUrl: 'https://www.youtube.com/embed/videoId3' // <-- REPLACE
        },
        {
            id: 4,
            name: 'Luxury Real Estate',
            description: 'Elegant and professional templates for high-end property listings.',
            price: 49.99,
            priceId: 'price_1PXXXXXXXXXXXXXX', // <-- REPLACE
            category: 'Business',
            thumbnail: 'https://via.placeholder.com/400x300.png?text=Real+Estate',
            videoUrl: 'https://www.youtube.com/embed/videoId4' // <-- REPLACE
        },
        // ... Add all your other bundles here
    ];

    // !!! IMPORTANT: REPLACE WITH YOUR FAQ CONTENT
    const faqs = [
        {
            question: 'What license do I get?',
            answer: 'You receive a non-exclusive, worldwide, perpetual license to use the reels in your personal and commercial projects. You cannot resell or redistribute the original files.'
        },
        {
            question: 'How do I receive my files?',
            answer: 'After a successful purchase, you will be redirected to a thank-you page, and you will also receive an email with your unique download links.'
        },
        {
            question: 'What software do I need?',
            answer: 'Our reels are provided in standard .mp4 format, compatible with all major video editing software (like CapCut, Adobe Premiere, Final Cut, DaVinci Resolve) and can be posted directly to social media.'
        },
        {
            question: 'Is my payment secure?',
            answer: 'Yes! All payments are processed securely by Stripe. We never see or store your credit card information.'
        }
    ];

    // ===== 2. ELEMENT SELECTORS =====
    const productGrid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results');
    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('filter-category');
    const priceFilter = document.getElementById('filter-price');
    const faqContainer = document.getElementById('faq-container');
    const cartButton = document.getElementById('cart-button');
    const cartClose = document.getElementById('cart-close');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartEmptyMsg = document.getElementById('cart-empty-msg');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const checkoutButton = document.getElementById('checkout-button');
    const previewModal = document.getElementById('preview-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalVideo = document.getElementById('modal-video');
    const modalPurchase = document.getElementById('modal-purchase');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    // ===== 3. STATE INITIALIZATION =====
    let cart = JSON.parse(localStorage.getItem('reelBazaarCart')) || [];

    // ===== 4. CORE FUNCTIONS =====

    /**
     * Renders a list of products to the grid.
     * @param {Array} products - The array of product objects to render.
     */
    function renderProducts(products) {
        productGrid.innerHTML = ''; // Clear existing grid
        
        if (products.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }
        noResults.classList.add('hidden');

        products.forEach(product => {
            const card = document.createElement('div');
            // Added transition-colors for a smoother dark mode experience
            card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] transition-colors';
            card.innerHTML = `
                <img src="${product.thumbnail}" alt="${product.name}" class="w-full h-48 object-cover" loading="lazy">
                <div class="p-6">
                    <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">${product.description}</p>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">$${product.price.toFixed(2)}</span>
                        <span class="text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">${product.category}</span>
                    </div>
                    <div class="flex gap-4">
                        <button class="preview-btn w-1/2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                data-video-url="${product.videoUrl}" 
                                data-title="${product.name}"
                                data-product-id="${product.id}">
                            <i class="fa-solid fa-play mr-2"></i>Preview
                        </button>
                        <button class="add-to-cart-btn w-1/2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                                data-product-id="${product.id}">
                            <i class="fa-solid fa-cart-plus mr-2"></i>Add to Cart
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    /**
     * Populates the category filter dropdown from the product data.
     */
    function populateCategories() {
        const categories = [...new Set(allProducts.map(p => p.category))];
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    /**
     * Filters and sorts products based on UI controls.
     */
    function applyFilters() {
        const searchTerm = searchBar.value.toLowerCase();
        const category = categoryFilter.value;
        const priceSort = priceFilter.value;

        let filtered = allProducts.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const categoryMatch = product.category.toLowerCase().includes(searchTerm);
            const categoryFilterMatch = (category === 'all') || (product.category === category);
            
            return (nameMatch || categoryMatch) && categoryFilterMatch;
        });

        if (priceSort === 'low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (priceSort === 'high') {
            filtered.sort((a, b) => b.price - a.price);
        }

        renderProducts(filtered);
    }

    /**
     * Populates the FAQ section.
     */
    function renderFAQs() {
        faqContainer.innerHTML = '';
        faqs.forEach((faq, index) => {
            const faqItem = document.createElement('div');
            faqItem.className = 'border border-gray-200 dark:border-gray-700 rounded-lg';
            faqItem.innerHTML = `
                <h2>
                    <button type="button" class="faq-toggle flex items-center justify-between w-full p-6 text-left" aria-expanded="${index === 0 ? 'true' : 'false'}">
                        <span class="font-semibold">${faq.question}</span>
                        <i class="fa-solid fa-chevron-down transition-transform"></i>
                    </button>
                </h2>
                <div class="faq-answer p-6 pt-0 ${index === 0 ? '' : 'hidden'}">
                    <p class="text-gray-600 dark:text-gray-400">${faq.answer}</p>
                </div>
            `;
            faqContainer.appendChild(faqItem);
        });

        // Add event listeners for accordion
        faqContainer.querySelectorAll('.faq-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const answer = button.parentElement.nextElementSibling;
                const icon = button.querySelector('i');
                const isExpanded = button.getAttribute('aria-expanded') === 'true';

                answer.classList.toggle('hidden');
                button.setAttribute('aria-expanded', !isExpanded);
                icon.classList.toggle('rotate-180');
            });
        });
    }

    /**
     * Opens the video preview modal.
     * @param {string} videoUrl - The YouTube/Vimeo embed URL.
     * @param {string} title - The product title.
     * @param {string} productId - The product ID for the "Buy Now" button.
     */
    function openPreviewModal(videoUrl, title, productId) {
        modalTitle.textContent = title;
        modalVideo.src = videoUrl;
        modalPurchase.dataset.productId = productId; // Set ID for modal's purchase button
        previewModal.classList.remove('hidden');
    }

    /**
     * Closes the video preview modal.
     */
    function closePreviewModal() {
        previewModal.classList.add('hidden');
        modalVideo.src = ''; // Stop video from playing
    }
    
    /**
     * Toggles the cart sidebar visibility.
     * @param {boolean} [forceOpen] - Optional. True to force open, false to force close.
     */
    function toggleCart(forceOpen = null) {
        const isOpen = !cartSidebar.classList.contains('translate-x-full');
        if (forceOpen === true || (forceOpen === null && !isOpen)) {
            cartSidebar.classList.remove('translate-x-full');
            cartOverlay.classList.remove('hidden');
        } else {
            cartSidebar.classList.add('translate-x-full');
            cartOverlay.classList.add('hidden');
        }
    }

    /**
     * Adds a product to the cart.
     * @param {string} productId - The ID of the product to add.
     */
    function addToCart(productId) {
        const product = allProducts.find(p => p.id.toString() === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        updateCartUI();
        toggleCart(true); // Open cart to show item was added
    }
    
    /**
     * Replaces the cart content with a single product and immediately initiates checkout.
     * @param {string} productId - The ID of the product to buy immediately.
     */
    async function buyNow(productId) {
        const product = allProducts.find(p => p.id.toString() === productId);
        if (!product) return;

        // 1. Clear cart and add only this item
        cart = [{ ...product, quantity: 1 }];
        saveCart();
        updateCartUI();
        toggleCart(false); // Close cart sidebar

        // 2. Proceed to checkout with the single item
        await handleCheckout();
    }


    /**
     * Removes an item from the cart.
     * @param {string} productId - The ID of the product to remove.
     */
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id.toString() !== productId);
        saveCart();
        updateCartUI();
    }

    /**
     * Saves the cart to localStorage.
     */
    function saveCart() {
        localStorage.setItem('reelBazaarCart', JSON.stringify(cart));
    }

    /**
     * Updates all UI elements related to the cart.
     */
    function updateCartUI() {
        // Update cart icon count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items list
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            cartEmptyMsg.classList.remove('hidden');
            checkoutButton.disabled = true;
        } else {
            cartEmptyMsg.classList.add('hidden');
            checkoutButton.disabled = false;
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="flex items-center justify-between gap-4 py-4 border-b dark:border-gray-700">
                    <img src="${item.thumbnail}" alt="${item.name}" class="w-16 h-16 rounded object-cover">
                    <div class="flex-grow">
                        <p class="font-semibold">${item.name}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Qty: ${item.quantity}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</p>
                        <button class="remove-from-cart-btn text-sm text-red-500 hover:text-red-700 active:scale-95 transition-transform" data-product-id="${item.id}">Remove</button>
                    </div>
                </div>
            `).join('');
        }

        // Update cart total
        const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${totalCost.toFixed(2)}`;
    }

    /**
     * Handles the Stripe Checkout process.
     */
    async function handleCheckout() {
        if (cart.length === 0) return;

        // Format cart items for Stripe Checkout
        const lineItems = cart.map(item => {
            return {
                price: item.priceId, // The Price ID from Stripe
                quantity: item.quantity,
            };
        });

        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Redirecting...';

        try {
            const { error } = await stripe.redirectToCheckout({
                lineItems: lineItems,
                mode: 'payment',
                successUrl: `${window.location.origin}${window.location.pathname.replace('index.html', '')}thank-you.html`,
                cancelUrl: window.location.href,
                // We recommend collecting email in Stripe Checkout
                // to ensure you can send the email receipt with download links.
                customerEmail: '', // Or pre-fill if you have it
            });

            if (error) {
                console.error('Stripe Checkout error:', error);
                checkoutButton.disabled = false;
                checkoutButton.textContent = 'Proceed to Checkout';
                // Display error to user (e.g., in a modal or alert)
                alert(error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Proceed to Checkout';
        }
    }

    /**
     * Handles the Formspree contact form submission.
     */
    async function handleContactForm(event) {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        
        formStatus.textContent = 'Sending...';
        
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.textContent = "Thanks! Your message has been sent.";
                formStatus.className = "text-center text-green-500";
                form.reset();
            } else {
                const responseData = await response.json();
                if (Object.hasOwnProperty.call(responseData, 'errors')) {
                    formStatus.textContent = responseData.errors.map(error => error.message).join(", ");
                } else {
                    formStatus.textContent = "Oops! There was a problem submitting your form.";
                }
                formStatus.className = "text-center text-red-500";
            }
        } catch (error) {
            formStatus.textContent = "Oops! There was a problem submitting your form.";
            formStatus.className = "text-center text-red-500";
        }
    }


    // ===== 5. EVENT LISTENERS =====

    // Filter/Search listeners
    searchBar.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);

    // Product Grid listeners (using event delegation)
    productGrid.addEventListener('click', (e) => {
        const previewBtn = e.target.closest('.preview-btn');
        const cartBtn = e.target.closest('.add-to-cart-btn');

        if (previewBtn) {
            openPreviewModal(
                previewBtn.dataset.videoUrl,
                previewBtn.dataset.title,
                previewBtn.dataset.productId
            );
        }

        if (cartBtn) {
            addToCart(cartBtn.dataset.productId);
        }
    });

    // Modal listeners
    modalClose.addEventListener('click', closePreviewModal);
    
    // UPDATED: Modal purchase now uses the direct buyNow function
    modalPurchase.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        closePreviewModal();
        buyNow(productId); // Immediate checkout after closing modal
    });

    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) { // Click on overlay
            closePreviewModal();
        }
    });

    // Cart listeners
    cartButton.addEventListener('click', () => toggleCart(true));
    cartClose.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));
    checkoutButton.addEventListener('click', handleCheckout);

    // Cart items listeners (using event delegation)
    cartItemsContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-from-cart-btn');
        if (removeBtn) {
            removeFromCart(removeBtn.dataset.productId);
        }
    });

    // Contact Form listener
    contactForm.addEventListener('submit', handleContactForm);
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Set copyright year
    document.getElementById('copyright-year').textContent = new Date().getFullYear();


    // ===== 6. INITIALIZATION CALLS =====
    renderProducts(allProducts);
    populateCategories();
    renderFAQs();
    updateCartUI();

});

import { Product } from '../types';

export const initialProducts: Product[] = [
  // =================== MEN'S CLOTHING ===================
  {
    id: 'prod-m-01',
    titleEn: 'Royal Embroidered Jacquard Panjabi - Maroon',
    titleBn: 'রয়েল এমব্রয়ডারি জ্যাকার্ড পাঞ্জাবি - মেরুন',
    category: 'men',
    subCategory: 'panjabi',
    price: 2450,
    originalPrice: 3200,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Exclusively tailored for festive celebrations and Eid occasions. Crafted from premium combed jacquard cotton with metallic button details and intricate collar embroidery.',
    descriptionBn: 'ঈদ ও উৎসবের জন্য এক্সক্লুসিভ ডিজাইনের জ্যাকার্ড পাঞ্জাবি। প্রিমিয়াম কোম্বড কটন ও রাজকীয় মেটালিক বোতাম সহ কলার ও বুকে নিখুঁত সুতার কাজ।',
    sizes: ['38', '40', '42', '44', '46'],
    colors: [
      { nameEn: 'Royal Maroon', nameBn: 'মেরুন', hex: '#6b1d2f' },
      { nameEn: 'Emerald Green', nameBn: 'পান্না সবুজ', hex: '#114b3e' },
      { nameEn: 'Midnight Navy', nameBn: 'নেভি ব্লু', hex: '#1c2841' }
    ],
    stock: 24,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 38,
    fabric: '100% Combed Jacquard Cotton',
    sku: 'MFH-M-PJ-001',
    tags: ['panjabi', 'men', 'eid', 'festive', 'cotton', 'punjabi']
  },
  {
    id: 'prod-m-02',
    titleEn: 'Executive Platinum Fit Formal Shirt - Classic White',
    titleBn: 'এক্সিকিউটিভ প্ল্যাটিনাম ফিট ফরমাল শার্ট - ক্লাসিক হোয়াইট',
    category: 'men',
    subCategory: 'shirt',
    price: 1850,
    originalPrice: 2200,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Wrinkle-resistant luxury Giza cotton shirt designed for professional corporate wear. Breathable weave for all-day comfort in tropical climates.',
    descriptionBn: 'রিঙ্কেল ফ্রি প্রিমিয়াম গিজা কটন অফিসিয়াল ফরমাল শার্ট। মার্জিত ফিনিশিং ও দীর্ঘক্ষণ পরিধানে চমৎকার আরামদায়ক।',
    sizes: ['15 (M)', '15.5 (L)', '16 (XL)', '16.5 (XXL)'],
    colors: [
      { nameEn: 'Crisp White', nameBn: 'সাদা', hex: '#ffffff' },
      { nameEn: 'Sky Blue', nameBn: 'আকাশি নীল', hex: '#87ceeb' },
      { nameEn: 'Soft Pink', nameBn: 'হালকা গোলাপি', hex: '#f4c2c2' }
    ],
    stock: 18,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 22,
    fabric: '100% Giza Egyptian Cotton',
    sku: 'MFH-M-SH-002',
    tags: ['shirt', 'men', 'formal', 'office', 'cotton']
  },
  {
    id: 'prod-m-03',
    titleEn: 'Traditional Premium Cotton Kabli Set with Pajama',
    titleBn: 'ঐতিহ্যবাহী প্রিমিয়াম কটন কাবলি সেট (পায়জামা সহ)',
    category: 'men',
    subCategory: 'panjabi',
    price: 3200,
    originalPrice: 3800,
    images: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Authentic 2-piece Kabli suit including knee-length tunic and tailored matching pajama trouser. Modern side-slit cut with engraved horn buttons.',
    descriptionBn: 'আভিজাত্যের প্রতীক ঐতিহ্যবাহী ২-পিস কাবলি সেট। সাথে রয়েছে ম্যাচিং পায়জামা। উন্নত বোতাম ও নিখুঁত সেলাই।',
    sizes: ['38', '40', '42', '44'],
    colors: [
      { nameEn: 'Jet Black', nameBn: 'জেট ব্ল্যাক', hex: '#111111' },
      { nameEn: 'Olive Green', nameBn: 'জলপাই সবুজ', hex: '#556b2f' },
      { nameEn: 'Pure Cream', nameBn: 'ক্রিম সাদা', hex: '#fffdd0' }
    ],
    stock: 15,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 45,
    fabric: 'Slub Linen Cotton',
    sku: 'MFH-M-KB-003',
    tags: ['kabli', 'men', 'eid', 'traditional', 'panjabi']
  },
  {
    id: 'prod-m-04',
    titleEn: 'High-Density Pique Cotton Polo Shirt',
    titleBn: 'হাই-ডেনসিটি পাইক কটন পোলো টি-শার্ট',
    category: 'men',
    subCategory: 'polo',
    price: 990,
    originalPrice: 1350,
    images: [
      'https://images.unsplash.com/photo-1625910513413-72235940d9b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Classic solid polo knit from 240 GSM combed cotton with tipped ribbed collar and breathable honeycomb texture.',
    descriptionBn: 'উচ্চমানের ২৪০ জিএসএম কটন পাইক কাপড়ের পোলো টি-শার্ট। নিখুঁত কলার ফিটিং ও আরামদায়ক ক্যাজুয়াল লুক।',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { nameEn: 'Burgundy Red', nameBn: 'বার্গান্ডি লাল', hex: '#800020' },
      { nameEn: 'Forest Green', nameBn: 'গাঢ় সবুজ', hex: '#228b22' },
      { nameEn: 'Charcoal Grey', nameBn: 'চারকোল গ্রে', hex: '#36454f' }
    ],
    stock: 35,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.7,
    reviewCount: 19,
    fabric: '240 GSM Pique Cotton',
    sku: 'MFH-M-PL-004',
    tags: ['polo', 'tshirt', 'men', 'casual', 'cotton']
  },

  // =================== WOMEN'S CLOTHING ===================
  {
    id: 'prod-w-01',
    titleEn: 'Handloom Dhakai Jamdani Saree - Crimson Red & Gold',
    titleBn: 'হাতে বোনা ঢাকাই জামদানি শাড়ি - রক্তলাল ও সোনালি জরি',
    category: 'women',
    subCategory: 'saree',
    price: 5800,
    originalPrice: 7200,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Traditional master-weaver Dhakai Jamdani featuring all-over floral jaal work with radiant gold zari threads. Includes matching unstitched blouse piece.',
    descriptionBn: 'ঐতিহ্যবাহী তাঁতিদের হাতে বোনা ৮৪ কাউন্টের খাঁটি ঢাকাই জামদানি শাড়ি। সোনালি জরির জমকালো ফুল ও কলকা পাড় সহ আকর্ষণীয় আঁচল। ব্লাউজ পিস অন্তর্ভুক্ত।',
    sizes: ['Free Size (12 Haat / 5.5m)'],
    colors: [
      { nameEn: 'Crimson Red', nameBn: 'রক্তিম লাল', hex: '#b31b1b' },
      { nameEn: 'Royal Blue', nameBn: 'রয়েল ব্লু', hex: '#4169e1' },
      { nameEn: 'Blush Pink', nameBn: 'হালকা গোলাপি', hex: '#ffb6c1' }
    ],
    stock: 12,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 54,
    fabric: '84 Count Pure Cotton Jamdani with Zari',
    sku: 'MFH-W-SR-101',
    tags: ['saree', 'jamdani', 'women', 'wedding', 'festive', 'traditional']
  },
  {
    id: 'prod-w-02',
    titleEn: 'Exclusive Silk Embroidered Three-Piece Suit',
    titleBn: 'এক্সক্লুসিভ সিল্ক এমব্রয়ডারি থ্রি-পিস সেট',
    category: 'women',
    subCategory: 'three-piece',
    price: 4250,
    originalPrice: 5100,
    images: [
      'https://images.unsplash.com/photo-1583391733975-02111d4d8c76?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: '3-Piece party suit set comprising heavy hand-embroidered raw silk kameez, chiffon dupatta with scalloped lace border, and butter-soft santoon trouser.',
    descriptionBn: 'পার্টি ও যেকোনো অনুষ্ঠানের উপযোগী গর্জিয়াস থ্রি-পিস। র-সিল্কের কামিজ, শিফনের ওড়না ও জমকালো কারচুপির কাজ।',
    sizes: ['36 (S)', '38 (M)', '40 (L)', '42 (XL)', '44 (XXL)'],
    colors: [
      { nameEn: 'Pastel Mint', nameBn: 'মিন্ট গ্রিন', hex: '#98ff98' },
      { nameEn: 'Dusty Rose', nameBn: 'ডাস্টি রোজ', hex: '#dcae96' },
      { nameEn: 'Lavender Violet', nameBn: 'ল্যাভেন্ডার', hex: '#e6e6fa' }
    ],
    stock: 14,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.8,
    reviewCount: 31,
    fabric: 'Raw Silk & Pure Chiffon Dupatta',
    sku: 'MFH-W-TP-102',
    tags: ['three-piece', 'salwar-kameez', 'women', 'eid', 'silk']
  },
  {
    id: 'prod-w-03',
    titleEn: 'Designer A-Line Cotton Kurti with Mirror Work',
    titleBn: 'ডিজাইনার এ-লাইন কটন কুর্তি (মিরর ওয়ার্ক)',
    category: 'women',
    subCategory: 'kurti',
    price: 1650,
    originalPrice: 2100,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733975-02111d4d8c76?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Casual yet elegant daily wear kurti made from lightweight organic cotton featuring hand-stitched foil mirror embellishments along the neckline.',
    descriptionBn: 'দৈনন্দিন ও ভার্সিটি/অফিস ব্যবহারের জন্য আকর্ষণীয় মিরর ওয়ার্ক কটন কুর্তি। ১০০% সুতি কাপড়ে আরামদায়ক কাটিং।',
    sizes: ['36', '38', '40', '42'],
    colors: [
      { nameEn: 'Mustard Yellow', nameBn: 'সরিষা হলুদ', hex: '#e1ad01' },
      { nameEn: 'Teal Blue', nameBn: 'টিল ব্লু', hex: '#008080' },
      { nameEn: 'Coral Peach', nameBn: 'পীচ', hex: '#ff7f50' }
    ],
    stock: 20,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.7,
    reviewCount: 29,
    fabric: 'Organic Slub Cotton',
    sku: 'MFH-W-KT-103',
    tags: ['kurti', 'women', 'cotton', 'casual', 'dailywear']
  },
  {
    id: 'prod-w-04',
    titleEn: 'Festive Banarasi Katan Silk Saree - Emerald Green',
    titleBn: 'উৎসবের বেনারসি কাতান সিল্ক শাড়ি - গাঢ় সবুজ',
    category: 'women',
    subCategory: 'saree',
    price: 6500,
    originalPrice: 8500,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Regal Banarasi silk with antique gold mina zari border, heavy contrast pallu, and timeless bridal appeal.',
    descriptionBn: 'বিয়ে ও স্পেশাল উৎসবের জন্য নিখুঁত কাতান সিল্ক শাড়ি। এন্টিক গোল্ড মিনা জরির বর্ডার ও গর্জিয়াস আঁচল।',
    sizes: ['Free Size (12 Haat)'],
    colors: [
      { nameEn: 'Emerald Green', nameBn: 'পান্না সবুজ', hex: '#046307' },
      { nameEn: 'Deep Maroon', nameBn: 'মেরুন', hex: '#58111a' }
    ],
    stock: 8,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 41,
    fabric: 'Pure Banarasi Katan Silk',
    sku: 'MFH-W-BK-104',
    tags: ['saree', 'katan', 'banarasi', 'wedding', 'women', 'festive']
  },

  // =================== CHILDREN'S CLOTHING ===================
  {
    id: 'prod-c-01',
    titleEn: 'Boys Festive Cotton Panjabi & Pajama Set',
    titleBn: 'ছেলেদের উৎসব কালেকশন কটন পাঞ্জাবি ও পায়জামা সেট',
    category: 'children',
    subCategory: 'kids-panjabi',
    price: 1450,
    originalPrice: 1850,
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Super soft, itch-free organic cotton Panjabi with elastic waistband pajama tailored specifically for boys. Stylish chest embroidery.',
    descriptionBn: 'ছোট্ট ছেলেদের জন্য আরামদায়ক সুতি পাঞ্জাবি ও ইলাস্টিক কোমরযুক্ত পায়জামা সেট। বুকে চমৎকার রঙিন সুতার কাজ।',
    sizes: ['2-3 Years', '4-5 Years', '6-7 Years', '8-9 Years', '10-12 Years'],
    colors: [
      { nameEn: 'Bright White', nameBn: 'উজ্জ্বল সাদা', hex: '#ffffff' },
      { nameEn: 'Sky Blue', nameBn: 'আকাশি', hex: '#87cefa' },
      { nameEn: 'Golden Yellow', nameBn: 'হলুদ', hex: '#ffd700' }
    ],
    stock: 25,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 37,
    fabric: '100% Combed Baby Cotton',
    sku: 'MFH-C-KP-201',
    tags: ['kids', 'children', 'boys', 'panjabi', 'eid']
  },
  {
    id: 'prod-c-02',
    titleEn: 'Girls Princess Tulle Party Frock - Butterfly Pink',
    titleBn: 'মেয়েদের প্রিন্সেস টিউল পার্টি ফ্রক - বাটারফ্লাই পিংক',
    category: 'children',
    subCategory: 'frock',
    price: 1750,
    originalPrice: 2300,
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Multi-layer flare net and soft breathable inner cotton lining. Decorated with 3D butterfly appliqués, satin sash, and back bow tie.',
    descriptionBn: 'শিশুদের জন্মদিনের পার্টি ও উৎসবের জন্য আকর্ষণীয় মাল্টিলেয়ার ফ্রক। ভেতরে রয়েছে আরামদায়ক সুতি আস্তরণ।',
    sizes: ['2-3 Years', '4-5 Years', '6-7 Years', '8-10 Years'],
    colors: [
      { nameEn: 'Cotton Candy Pink', nameBn: 'গোলাপি', hex: '#ffc0cb' },
      { nameEn: 'Lilac Purple', nameBn: 'বেগুনি', hex: '#c8a2c8' },
      { nameEn: 'Snow White', nameBn: 'সাদা', hex: '#fdfbf7' }
    ],
    stock: 19,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 28,
    fabric: 'Soft Tulle Mesh with Pure Cotton Lining',
    sku: 'MFH-C-GF-202',
    tags: ['kids', 'girls', 'frock', 'party', 'dress', 'children']
  },
  {
    id: 'prod-c-03',
    titleEn: 'Toddler Casual Cotton Shirt & Shorts 2-Piece Set',
    titleBn: 'বাচ্চাদের আরামদায়ক কটন শার্ট ও শর্টস ২-পিস সেট',
    category: 'children',
    subCategory: 'baby-set',
    price: 1100,
    originalPrice: 1450,
    images: [
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Ultra-breathable printed cuban collar cotton shirt paired with twill shorts. Ideal for casual daytime outings and play sessions.',
    descriptionBn: 'গরমের দিনে বাচ্চাদের সেরা আরামের জন্য প্রিমিয়াম প্রিন্টেড সুতি শার্ট ও টুইল শর্টস সেট।',
    sizes: ['1-2 Years', '2-3 Years', '3-4 Years', '4-5 Years'],
    colors: [
      { nameEn: 'Tropical Olive', nameBn: 'অলিভ প্রিন্ট', hex: '#6b8e23' },
      { nameEn: 'Navy Nautical', nameBn: 'নেভি ব্লু', hex: '#191970' }
    ],
    stock: 22,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.6,
    reviewCount: 15,
    fabric: '100% Breathable Cotton',
    sku: 'MFH-C-BS-203',
    tags: ['kids', 'toddler', 'shirt', 'shorts', 'casual']
  },
  {
    id: 'prod-c-04',
    titleEn: 'Girls Festive Embroidered Lehenga Choli Set',
    titleBn: 'মেয়েদের জমকালো এমব্রয়ডারি লেহেঙ্গা চোলি সেট',
    category: 'children',
    subCategory: 'lehenga',
    price: 2600,
    originalPrice: 3400,
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
    ],
    descriptionEn: 'Radiant festive lehenga with golden gota patti border, matching short choli, and lightweight netted dupatta. Lightweight and comfortable for kids to dance and play.',
    descriptionBn: 'বিয়ে ও ঈদের সাজে ছোট্ট রাজকন্যাদের লেহেঙ্গা চোলি সেট। সোনালি গোটা পট্টি কাজ ও আরামদায়ক ফ্যাব্রিক।',
    sizes: ['3-4 Years', '5-6 Years', '7-8 Years', '9-10 Years', '11-12 Years'],
    colors: [
      { nameEn: 'Rani Magenta', nameBn: 'রানি গোলাপি', hex: '#c71585' },
      { nameEn: 'Sunny Yellow', nameBn: 'হলুদ', hex: '#ffd700' },
      { nameEn: 'Peacock Green', nameBn: 'ময়ূর সবুজ', hex: '#005f73' }
    ],
    stock: 16,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 32,
    fabric: 'Silk Blend with Cotton Lining',
    sku: 'MFH-C-GL-204',
    tags: ['kids', 'girls', 'lehenga', 'eid', 'festive', 'traditional']
  }
];

export const initialCoupons = [
  {
    id: 'c-01',
    code: 'EID2026',
    discountType: 'percentage' as const,
    discountValue: 15,
    minOrderValue: 2000,
    descriptionEn: '15% Off on orders above ৳2,000 for Eid & Festive shopping',
    descriptionBn: 'ঈদ স্পেশাল: ২,০০০ টাকার বেশি অর্ডারে ১৫% মূল্যছাড়',
    isActive: true
  },
  {
    id: 'c-02',
    code: 'MINARUL10',
    discountType: 'percentage' as const,
    discountValue: 10,
    minOrderValue: 1000,
    descriptionEn: '10% instant discount on your clothing order',
    descriptionBn: 'যেকোনো পোশাকে ইনস্ট্যান্ট ১০% মূল্যছাড়',
    isActive: true
  },
  {
    id: 'c-03',
    code: 'WELCOME200',
    discountType: 'fixed' as const,
    discountValue: 200,
    minOrderValue: 1500,
    descriptionEn: '৳200 Flat Off on first order above ৳1,500',
    descriptionBn: 'প্রথম অর্ডারে ফ্ল্যাট ২০০ টাকা ছাড় (ন্যূনতম ১,৫০০ টাকার কেনাকাটায়)',
    isActive: true
  }
];

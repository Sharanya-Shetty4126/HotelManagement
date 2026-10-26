// server/prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Master Menu transcribed directly from Julius Hotel Menu PDF
const MENU = [
  {
    category: 'Side Dish / Snack',
    items: [
      { name: 'Roasted Papad', price: 35, description: 'Crisp fire-roasted lentil wafer', emoji: '🫓', isVeg: true, rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
      { name: 'Oil Papad', price: 35, description: 'Crispy deep-fried golden papad', emoji: '🫓', isVeg: true, rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chilli Fry', price: 35, description: 'Spiced pan-tossed green chillies with sea salt', emoji: '🌶️', isVeg: true, rating: 4.4 },
      { name: 'Masala Papad', price: 60, description: 'Crispy papad topped with chopped onions, tomatoes, coriander & chaat masala', emoji: '🥗', isVeg: true, rating: 4.8, imageUrl: '/images/dishes/masala_papad.png' },
      { name: 'Raja Masala', price: 70, description: 'Special royal spiced masala peanut crunchy salad', emoji: '🥜', isVeg: true, rating: 4.6 },
      { name: 'Finger Chips', price: 100, description: 'Crispy golden French fries dusted with salt', emoji: '🍟', isVeg: true, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80' },
      { name: 'Aloo Chat', price: 100, description: 'Tangy and spicy diced potato tossed with chutneys', emoji: '🥔', isVeg: true, rating: 4.5 },
      { name: 'G.P. Dry', price: 130, description: 'Green peas seasoned and dry roasted with coastal spices', emoji: '🫛', isVeg: true, rating: 4.4 },
      { name: 'Garlic Dry', price: 130, description: 'Crisp golden fried whole garlic cloves in spiced salt', emoji: '🧄', isVeg: true, rating: 4.7 },
      { name: 'Shenga Boiled', price: 60, description: 'Traditional coastal boiled hot peanuts in sea salt', emoji: '🥜', isVeg: true, rating: 4.6, imageUrl: '/images/dishes/boiled_peanut_chaat.png' },
      { name: 'Shenga Dry', price: 50, description: 'Crunchy salted roasted groundnuts', emoji: '🥜', isVeg: true, rating: 4.5 },
    ]
  },
  {
    category: 'Soups',
    items: [
      { name: 'Veg Clear Soup', price: 120, description: 'Light nutritious broth with fine seasonal vegetables', emoji: '🍲', isVeg: true, rating: 4.6 },
      { name: 'Veg Hot & Sour Soup', price: 130, description: 'Spicy and tangy Chinese broth with shredded garden veggies', emoji: '🥣', isVeg: true, rating: 4.7 },
      { name: 'Veg Manchow Soup', price: 130, description: 'Spiced garlic and ginger vegetable soup topped with crispy fried noodles', emoji: '🍜', isVeg: true, rating: 4.8, imageUrl: '/images/dishes/veg_manchow_soup.png' },
      { name: 'Veg Noodle Soup', price: 140, description: 'Comforting noodle soup with mild oriental broth and veggies', emoji: '🍜', isVeg: true, rating: 4.6 },
      { name: 'Palak Soup', price: 130, description: 'Velvety pureed spinach soup infused with roasted cumin and garlic', emoji: '🥬', isVeg: true, rating: 4.5 },
      { name: 'Cream of Tomato Soup', price: 120, description: 'Classic velvety ripe tomato soup finished with fresh cream and croutons', emoji: '🍅', isVeg: true, rating: 4.8 },
      { name: 'Cream of Veg Soup', price: 140, description: 'Rich creamy soup loaded with finely chopped garden vegetables', emoji: '🥣', isVeg: true, rating: 4.5 },
      { name: 'Veg Sweet Corn Soup', price: 130, description: 'Mild comforting sweet corn soup with gentle oriental seasoning', emoji: '🌽', isVeg: true, rating: 4.7 },
      { name: 'Chicken Hot & Sour Soup', price: 160, description: 'Fiery and tangy broth simmered with tender shredded chicken and egg drops', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Lung Fung Soup', price: 160, description: 'Thick Cantonese style rich chicken broth with egg swirl and mushrooms', emoji: '🍲', isVeg: false, rating: 4.7 },
      { name: 'Chicken Clear Soup', price: 140, description: 'Simmered wholesome chicken bone broth with herbs', emoji: '🥣', isVeg: false, rating: 4.7 },
      { name: 'Chicken Manchow Soup', price: 150, description: 'Spiced dark soy and garlic chicken soup crowned with crunchy noodles', emoji: '🍜', isVeg: false, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chicken Noodle Soup', price: 150, description: 'Tender chicken strips and noodles in a clear aromatic broth', emoji: '🍜', isVeg: false, rating: 4.7 },
      { name: 'Mutton Manchow Soup', price: 170, description: 'Hearty slow-simmered spiced mutton broth with crispy noodles', emoji: '🍲', isVeg: false, rating: 4.9 },
    ]
  },
  {
    category: 'Chinese Starters',
    items: [
      { name: 'Onion Pakoda', price: 140, description: 'Crisp golden onion fritters with coastal carom seeds', emoji: '🧅', isVeg: true, rating: 4.7 },
      { name: 'Ring Onion Pakoda', price: 140, description: 'Crispy batter-fried onion rings dusted with chaat masala', emoji: '🧅', isVeg: true, rating: 4.6 },
      { name: 'Veg Pakoda', price: 150, description: 'Crispy mixed vegetable fritters served with tangy chutney', emoji: '🥦', isVeg: true, rating: 4.6 },
      { name: 'Aloo Chilli Pakoda', price: 150, description: 'Crisp potato and chili slices fried in seasoned gram flour', emoji: '🥔', isVeg: true, rating: 4.5 },
      { name: 'Aloo Tawa', price: 140, description: 'Spicy pan-seared potato medallions with coastal masala', emoji: '🥔', isVeg: true, rating: 4.5 },
      { name: 'Gobi 65', price: 140, description: 'South Indian style spiced crispy fried cauliflower with curry leaves', emoji: '🥦', isVeg: true, rating: 4.7 },
      { name: 'Gobi Chilly', price: 140, description: 'Crisp cauliflower florets tossed with peppers, onions and chili sauce', emoji: '🌶️', isVeg: true, rating: 4.8 },
      { name: 'Gobi Manchurian', price: 140, description: 'All-time favorite cauliflower tossed in sweet-savory garlic Manchurian sauce', emoji: '🥦', isVeg: true, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80' },
      { name: 'Veg Crispy', price: 200, description: 'Crunchy golden vegetables tossed in a tangy schezwan honey glaze', emoji: '🥕', isVeg: true, rating: 4.7 },
      { name: 'Veg Spring Roll', price: 200, description: 'Crispy rolled pastry sheets stuffed with wok-tossed seasoned vegetables', emoji: '🌯', isVeg: true, rating: 4.7 },
      { name: 'Veg 65', price: 180, description: 'Mixed vegetable clusters fried crisp in Chennai 65 marinade', emoji: '🥗', isVeg: true, rating: 4.6 },
      { name: 'Veg Chilly', price: 180, description: 'Assorted veggies tossed with diced capsicum and spicy soy sauce', emoji: '🌶️', isVeg: true, rating: 4.6 },
      { name: 'Veg Manchurian', price: 190, description: 'Vegetable dumplings tossed in dark savory ginger-garlic gravy', emoji: '🧆', isVeg: true, rating: 4.7 },
      { name: 'Veg Bullet', price: 200, description: 'Crispy spiced vegetable and potato croquettes', emoji: '🍢', isVeg: true, rating: 4.6 },
      { name: 'Babycorn 65', price: 210, description: 'Crispy babycorn tossed with curry leaves, curd and red chili paste', emoji: '🌽', isVeg: true, rating: 4.7 },
      { name: 'Babycorn Chilly', price: 210, description: 'Tender babycorn stir-fried with bell peppers and green chilies', emoji: '🌶️', isVeg: true, rating: 4.8 },
      { name: 'Babycorn Manchurian', price: 210, description: 'Crunchy babycorn bites wok-tossed in Manchurian sauce', emoji: '🌽', isVeg: true, rating: 4.7 },
      { name: 'Paneer 65', price: 220, description: 'Juicy paneer cubes tossed in aromatic spiced 65 masala', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Paneer Chilly', price: 240, description: 'Cottage cheese cubes wok-seared with peppers, onions and dark soy', emoji: '🧀', isVeg: true, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80' },
      { name: 'Paneer Manchurian', price: 240, description: 'Crispy fried paneer cubes in savory Chinese garlic sauce', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Mushroom 65', price: 240, description: 'Fresh whole button mushrooms in crisp South Indian 65 batter', emoji: '🍄', isVeg: true, rating: 4.7 },
      { name: 'Mushroom Chilly', price: 240, description: 'Sauteed button mushrooms tossed with green chilies and bell peppers', emoji: '🍄', isVeg: true, rating: 4.7 },
      { name: 'Mushroom Manchurian', price: 240, description: 'Tender mushrooms tossed in spiced ginger-garlic sauce', emoji: '🍄', isVeg: true, rating: 4.7 },
      { name: 'Mushroom Pepper Dry', price: 240, description: 'Button mushrooms sauteed in crushed coastal black pepper and curry leaves', emoji: '🍄', isVeg: true, rating: 4.8 },
      { name: 'Kaju Dry', price: 250, description: 'Golden fried premium cashews tossed with butter and roasted spices', emoji: '🥜', isVeg: true, rating: 4.9 },
      { name: 'Veg Gold Coin', price: 250, description: 'Crispy sesame-encrusted vegetable toasts', emoji: '🪙', isVeg: true, rating: 4.7 },
      { name: 'Paneer Bhurji', price: 250, description: 'Spiced scrambled cottage cheese with onions, tomatoes and green chilies', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Paneer Satay', price: 250, description: 'Skewered paneer grilled with peanut marinade', emoji: '🍢', isVeg: true, rating: 4.7 },
      { name: 'Babycorn Rapan Dry', price: 220, description: 'Special crispy battered babycorn dry preparation', emoji: '🌽', isVeg: true, rating: 4.6 },
      { name: 'Gobi Rapan Dry', price: 140, description: 'Crispy spiced cauliflower dry starter', emoji: '🥦', isVeg: true, rating: 4.6 },
      { name: 'Paneer Pop Dry', price: 240, description: 'Bite-sized popping crunchy paneer nuggets', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Egg Pakoda', price: 150, description: 'Hard-boiled eggs coated in spiced gram flour and fried crisp', emoji: '🥚', isVeg: false, rating: 4.6 },
      { name: 'Egg 65', price: 190, description: 'Boiled egg slices tossed in fiery 65 masala', emoji: '🥚', isVeg: false, rating: 4.7 },
      { name: 'Egg Chilly', price: 190, description: 'Egg cubes stir-fried with capsicum, onion and hot chili sauce', emoji: '🌶️', isVeg: false, rating: 4.7 },
      { name: 'Egg Manchurian', price: 190, description: 'Batter-fried egg chunks in rich Manchurian garlic sauce', emoji: '🥚', isVeg: false, rating: 4.7 },
      { name: 'Chicken 65', price: 250, description: 'Iconic spicy, deep-fried chicken cubes with curry leaves and mustard seeds', emoji: '🍗', isVeg: false, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chicken Chilly', price: 250, description: 'Boneless chicken chunks tossed with crunchy peppers, scallions and soy', emoji: '🌶️', isVeg: false, rating: 4.9 },
      { name: 'Chicken Manchurian', price: 250, description: 'Crisp chicken bites in tangy, savory garlic and ginger Manchurian sauce', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Crispy', price: 260, description: 'Shredded chicken fried extra crispy and tossed in spicy schezwan sauce', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Lemon', price: 260, description: 'Wok-tossed chicken in a zesty lemon and coriander reduction', emoji: '🍋', isVeg: false, rating: 4.7 },
      { name: 'Chicken Dilkush', price: 280, description: 'Chef special rich cashew and mild herb coated chicken starter', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Garlic', price: 250, description: 'Succulent chicken pieces tossed in abundant charred garlic and chili', emoji: '🧄', isVeg: false, rating: 4.8 },
      { name: 'Chicken Lollipop (6 pcs)', price: 280, description: 'Frenched chicken winglets fried crisp and served with hot schezwan dip', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Hot Pan', price: 270, description: 'Sizzling pan-tossed spicy chicken with onions and chilies', emoji: '🍳', isVeg: false, rating: 4.8 },
      { name: 'Chicken Satay', price: 270, description: 'Grilled skewered chicken tenders glazed with spiced peanut sauce', emoji: '🍢', isVeg: false, rating: 4.8 },
      { name: 'Chicken Spring Roll', price: 290, description: 'Crispy rolls packed with shredded chicken and oriental vegetables', emoji: '🌯', isVeg: false, rating: 4.8 },
      { name: 'Chicken Pepper Dry', price: 250, description: 'Coastal black pepper marinated tender chicken dry roasted with curry leaves', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Mutton Sukka', price: 370, description: 'Traditional dry spiced coastal mutton roasted with grated coconut and shallots', emoji: '🍖', isVeg: false, rating: 4.9 },
      { name: 'Mutton Ghee Roast', price: 370, description: 'Kundapura style tender mutton chunks roasted slow in clarified ghee and Byadgi chili', emoji: '🍖', isVeg: false, rating: 4.9 },
      { name: 'Mutton Ranods', price: 340, description: 'Chef signature spiced mutton dry fry', emoji: '🍖', isVeg: false, rating: 4.8 },
      { name: 'Mutton 65', price: 340, description: 'Tender mutton boneless cubes fried crisp in spicy 65 masala', emoji: '🍖', isVeg: false, rating: 4.8 },
      { name: 'Mutton Kebab', price: 340, description: 'Minced spiced mutton patties shallow fried to perfection', emoji: '🍖', isVeg: false, rating: 4.9 },
      { name: 'Mutton Chilly', price: 340, description: 'Boneless tender mutton tossed with bell peppers and green chilies', emoji: '🌶️', isVeg: false, rating: 4.8 },
    ]
  },
  {
    category: 'Tandoor Starters',
    items: [
      { name: 'Hara Bhara Kabab', price: 230, description: 'Pan-seared spinach, green peas and paneer patties with aromatic spices', emoji: '🟢', isVeg: true, rating: 4.7 },
      { name: 'Aloo Tikki', price: 140, description: 'Golden tandoori spiced potato patties served with mint chutney', emoji: '🥔', isVeg: true, rating: 4.6 },
      { name: 'Babycorn Tikka', price: 250, description: 'Tender babycorn skewers charred in clay oven with spiced yogurt glaze', emoji: '🌽', isVeg: true, rating: 4.7 },
      { name: 'Tandoori Aloo Gobi', price: 210, description: 'Potato and cauliflower florets marinated in tandoori spices and roasted', emoji: '🥦', isVeg: true, rating: 4.6 },
      { name: 'Mushroom Tikka', price: 250, description: 'Button mushrooms stuffed and roasted in clay tandoor', emoji: '🍄', isVeg: true, rating: 4.8 },
      { name: 'Paneer Tikka', price: 260, description: 'Fresh cottage cheese cubes marinated in ajwain yogurt and fire-roasted', emoji: '🧀', isVeg: true, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80' },
      { name: 'Paneer Hariyali Tikka', price: 260, description: 'Cottage cheese marinated in fresh mint, coriander and green chili paste', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Paneer Cheese Tikka', price: 290, description: 'Melt-in-mouth paneer layered with processed cheese and roasted in clay oven', emoji: '🧀', isVeg: true, rating: 4.9 },
      { name: 'Paneer Lasooni Tikka', price: 270, description: 'Paneer steaks steeped in roasted garlic, cream and mustard oil marinade', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Paneer Malai Kabab', price: 290, description: 'Silky paneer cubes steeped in fresh cream, cardamom and cashew paste', emoji: '🧀', isVeg: true, rating: 4.9 },
      { name: 'Paneer Platter (Full)', price: 1050, description: 'Grand assortment of Paneer Tikka, Hariyali, Malai & Lasooni tikkas', emoji: '🍱', isVeg: true, rating: 4.9 },
      { name: 'Paneer Platter (Half)', price: 550, description: 'Assortment of chef signature paneer tikkas with mint dip', emoji: '🍱', isVeg: true, rating: 4.8 },
      { name: 'Chicken Kabab (Full)', price: 240, description: 'Juicy spiced chicken pieces char-grilled over charcoal', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Kabab (Half)', price: 130, description: 'Half portion of charred spicy chicken kabab', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Kalmi Kabab (1 pc)', price: 140, description: 'Tender chicken drumstick coated in rich spiced cashew cream and roasted', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Tangdi Kabab (2 pcs)', price: 220, description: 'Stuffed and marinated chicken leg quarters roasted crisp in tandoor', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Tikka Kabab', price: 280, description: 'Boneless chicken cubes in classic Kashmiri chili and yogurt marinade', emoji: '🍗', isVeg: false, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chicken Malai Kabab', price: 300, description: 'Velvety boneless chicken steeped in rich cream, cheese and mild white pepper', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Adraki Kabab', price: 300, description: 'Clay-oven roasted chicken infused with fresh crushed ginger and spices', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Angara Kabab', price: 300, description: 'Smoky, fiery red-hot chicken tikka grilled over red-hot charcoal', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Hariyali Kabab', price: 300, description: 'Tender chicken skewers marinated in garden-fresh mint, cilantro and green chili', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Seekh Kabab', price: 300, description: 'Spiced minced chicken skewers grilled over charcoal', emoji: '🍢', isVeg: false, rating: 4.9 },
      { name: 'Chicken Khole Kabab', price: 300, description: 'Special marinated chicken roll skewers with aromatic spices', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Banjara Kabab', price: 300, description: 'Rustic gypsy style chicken kabab with roasted cumin, coriander and yogurt', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Reshmi Kabab', price: 300, description: 'Silky smooth chicken breast marinated with beaten eggs, cream and cashews', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Kasturi Kabab', price: 300, description: 'Fragrant chicken skewers infused with roasted fenugreek leaves (kasuri methi)', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Tandoori (Full)', price: 640, description: 'Whole spring chicken marinated overnight and roasted in clay oven', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Tandoori (Half)', price: 340, description: 'Half spring chicken roasted in clay oven with charred lemon', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Platter (Full)', price: 1150, description: 'Grand platter of Tikka, Malai, Hariyali, Seekh and Kalmi kababs', emoji: '🍱', isVeg: false, rating: 4.9 },
      { name: 'Chicken Platter (Half)', price: 620, description: 'Sampler platter of assorted chef special chicken tandoori kababs', emoji: '🍱', isVeg: false, rating: 4.8 },
    ]
  },
  {
    category: 'Egg Dishes',
    items: [
      { name: 'Boiled Egg (2 pcs)', price: 40, description: 'Fresh farm eggs hard-boiled and served with pepper salt', emoji: '🥚', isVeg: false, rating: 4.6 },
      { name: 'Egg Half Fry', price: 70, description: 'Sunny-side-up fried eggs seasoned with black pepper and herbs', emoji: '🍳', isVeg: false, rating: 4.7 },
      { name: 'Egg Omelette', price: 80, description: 'Fluffy pan-fried eggs with diced onions, tomatoes and green chilies', emoji: '🍳', isVeg: false, rating: 4.8 },
      { name: 'Egg Bhurji', price: 90, description: 'Spicy Indian scrambled eggs tossed with onions, green chilies and butter', emoji: '🍳', isVeg: false, rating: 4.9 },
    ]
  },
  {
    category: 'Seafood Specials',
    items: [
      { name: 'Pomfret Tandoori', price: 390, description: 'Whole fresh pomfret coated in ajwain tandoori masala and charred in clay oven', emoji: '🐟', isVeg: false, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80' },
      { name: 'Pomfret Tawa Fry', price: 380, description: 'Fresh pomfret pan-fried on iron tawa with coastal red chili paste', emoji: '🐟', isVeg: false, rating: 4.9 },
      { name: 'Pomfret Rawa Fry', price: 380, description: 'Semolina-crusted crispy white pomfret with Byadgi chili marinade', emoji: '🐟', isVeg: false, rating: 4.9 },
      { name: 'Pomfret Masala Fry', price: 380, description: 'Pan-roasted pomfret slathered with thick spicy coastal onion-garlic masala', emoji: '🐟', isVeg: false, rating: 4.8 },
      { name: 'Pomfret Curry', price: 390, description: 'Authentic coastal coconut and kokum fish curry with fresh pomfret', emoji: '🍛', isVeg: false, rating: 4.9 },
      { name: 'King Fish Rawa Fry', price: 360, description: 'Crisp semolina crusted Surmai steak marinated in lemon and coastal spices', emoji: '🐠', isVeg: false, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80' },
      { name: 'King Fish Tawa Fry', price: 360, description: 'Pan-seared seer fish steak in spicy coastal masala', emoji: '🐠', isVeg: false, rating: 4.8 },
      { name: 'King Fish Masala Fry', price: 360, description: 'Surmai steak smothered in aromatic roasted coastal red masala', emoji: '🐠', isVeg: false, rating: 4.8 },
      { name: 'King Fish Biryani', price: 380, description: 'Fragrant Jeerakasala rice dum-cooked with spiced King Fish steaks', emoji: '🍚', isVeg: false, rating: 4.9 },
      { name: 'Lady Fish Rawa Fry', price: 280, description: 'Authentic Kane fish coated in crisp rawa and golden fried', emoji: '🐟', isVeg: false, rating: 4.8 },
      { name: 'Lady Fish Tawa Fry', price: 280, description: 'Fresh Kane fish roasted on tawa with tangy spicy paste', emoji: '🐟', isVeg: false, rating: 4.8 },
      { name: 'Lady Fish Masala Curry', price: 290, description: 'Tender Kane fish in traditional spicy coconut teppal curry', emoji: '🍛', isVeg: false, rating: 4.9 },
      { name: 'Silver Fish Rawa Fry', price: 220, description: 'Crispy crunchy fried silver fish (Motia/Bolingir)', emoji: '🐟', isVeg: false, rating: 4.7 },
      { name: 'Silver Fish Tawa Fry', price: 220, description: 'Silver fish pan-fried with coastal red chili and lemon juice', emoji: '🐟', isVeg: false, rating: 4.7 },
      { name: 'Silver Fish Curry', price: 220, description: 'Traditional coastal village style spicy silver fish curry', emoji: '🍛', isVeg: false, rating: 4.7 },
      { name: 'Shark Chilli', price: 260, description: 'Boneless tender shark bites tossed in spicy wok-fried chili sauce', emoji: '🦈', isVeg: false, rating: 4.7 },
      { name: 'Shark Masala Fry', price: 260, description: 'Fresh shark chunks pan-roasted with coastal masala and curry leaves', emoji: '🦈', isVeg: false, rating: 4.7 },
      { name: 'Shark Curry', price: 260, description: 'Rich coconut and tamarind shark fish curry', emoji: '🍛', isVeg: false, rating: 4.7 },
      { name: 'Bangda Rawa Fry', price: 180, description: 'Fresh Arabian Sea mackerel coated in seasoned rawa and crisp fried', emoji: '🐟', isVeg: false, rating: 4.8 },
      { name: 'Bangda Tawa Fry', price: 180, description: 'Mackerel pan-roasted with spicy Byadgi chili marinade', emoji: '🐟', isVeg: false, rating: 4.8 },
      { name: 'Bangda Masala Curry', price: 190, description: 'Hearty coastal mackerel curry cooked with ground coconut and raw mango', emoji: '🍛', isVeg: false, rating: 4.9 },
      { name: 'Prawns Ghee Roast', price: 360, description: 'Signature coastal tiger prawns slow-roasted in clarified spiced ghee', emoji: '🦐', isVeg: false, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop&q=80' },
      { name: 'Prawns Butter Garlic', price: 340, description: 'Juicy tiger prawns tossed in rich garlic butter and fresh herbs', emoji: '🦐', isVeg: false, rating: 4.9 },
      { name: 'Prawns Rawa Fry', price: 340, description: 'Crispy semolina crusted golden fried prawns', emoji: '🦐', isVeg: false, rating: 4.8 },
      { name: 'Prawns Masala Fry', price: 340, description: 'Succulent prawns tossed in a thick roasted onion and tomato masala', emoji: '🦐', isVeg: false, rating: 4.8 },
      { name: 'Prawns Chilli', price: 340, description: 'Indo-Chinese style prawns stir-fried with bell peppers and green chilies', emoji: '🌶️', isVeg: false, rating: 4.8 },
      { name: 'Prawns Biryani', price: 360, description: 'Aromatic layered rice cooked with coastal spiced prawns', emoji: '🍚', isVeg: false, rating: 4.9 },
      { name: 'Squid Ghee Roast', price: 340, description: 'Tender squid rings roasted in rich clarified ghee and red masala', emoji: '🦑', isVeg: false, rating: 4.8 },
      { name: 'Squid Sukka', price: 320, description: 'Fresh squid tossed with roasted grated coconut and coastal spices', emoji: '🦑', isVeg: false, rating: 4.8 },
      { name: 'Squid Butter Garlic', price: 320, description: 'Sauteed squid rings in aromatic garlic butter sauce', emoji: '🦑', isVeg: false, rating: 4.7 },
      { name: 'Squid Pepper Dry', price: 320, description: 'Squid tossed with freshly crushed black peppercorns and curry leaves', emoji: '🦑', isVeg: false, rating: 4.8 },
      { name: 'Crab Ghee Roast', price: 390, description: 'Fresh estuary mud crab slow roasted in rich ghee and spicy Byadgi masala', emoji: '🦀', isVeg: false, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?w=600&auto=format&fit=crop&q=80' },
      { name: 'Crab Sukka', price: 380, description: 'Whole crab cooked with roasted grated coconut, onions and coastal spices', emoji: '🦀', isVeg: false, rating: 4.9 },
      { name: 'Crab Butter Garlic', price: 380, description: 'Whole crab tossed with generous butter and crushed garlic', emoji: '🦀', isVeg: false, rating: 4.8 },
      { name: 'Crab Pepper Dry', price: 380, description: 'Crab dry roasted with crushed black pepper and onions', emoji: '🦀', isVeg: false, rating: 4.8 },
      { name: 'Dhodi Rawa / Tawa Fry', price: 260, description: 'Fresh sea dhodi fish pan-fried with coastal spices', emoji: '🐟', isVeg: false, rating: 4.7 },
      { name: 'Nang Tawa Fry', price: 260, description: 'Fresh sole fish roasted crisp with chili-lime masala', emoji: '🐟', isVeg: false, rating: 4.7 },
      { name: 'Shell Fish Sukka', price: 280, description: 'Coastal clams (Marwai) tossed with roasted coconut masala', emoji: '🐚', isVeg: false, rating: 4.8 },
    ]
  },
  {
    category: 'Indian Gravies',
    items: [
      { name: 'Aloo Jeera', price: 140, description: 'Potatoes tossed with cumin seeds, turmeric and fresh coriander', emoji: '🥔', isVeg: true, rating: 4.6 },
      { name: 'Dal Fry', price: 160, description: 'Yellow lentils tempered with cumin, garlic, green chilies and butter', emoji: '🍲', isVeg: true, rating: 4.7 },
      { name: 'Bhendi Masala', price: 170, description: 'Tender okra stir-cooked with onions, tomatoes and roasted spices', emoji: '🥦', isVeg: true, rating: 4.5 },
      { name: 'Capsicum Masala', price: 190, description: 'Bell peppers in a rich spiced onion-tomato gravy', emoji: '🫑', isVeg: true, rating: 4.5 },
      { name: 'Aloo Mutter', price: 200, description: 'Classic potato and green peas curry in spiced gravy', emoji: '🥔', isVeg: true, rating: 4.6 },
      { name: 'Aloo Palak', price: 180, description: 'Diced potatoes simmered in a wholesome spiced spinach puree', emoji: '🥬', isVeg: true, rating: 4.5 },
      { name: 'Dal Kolhapuri', price: 180, description: 'Spicy, fiery red lentils prepared Kolhapuri style', emoji: '🍲', isVeg: true, rating: 4.7 },
      { name: 'Dal Tadka', price: 160, description: 'Creamy yellow lentils tempered with ghee, dry red chilies and garlic', emoji: '🍲', isVeg: true, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80' },
      { name: 'Tomato Curry', price: 190, description: 'Tangy tomato curry tempered with mustard seeds and curry leaves', emoji: '🍅', isVeg: true, rating: 4.5 },
      { name: 'Mix Vegetable', price: 210, description: 'Seasonal garden vegetables simmered in a spiced onion gravy', emoji: '🥗', isVeg: true, rating: 4.6 },
      { name: 'Veg Handi', price: 220, description: 'Assorted vegetables slow cooked in traditional earthen handi style', emoji: '🍲', isVeg: true, rating: 4.7 },
      { name: 'Veg Kurma', price: 220, description: 'Mild vegetables in coconut, cashew and poppy seed curry', emoji: '🍲', isVeg: true, rating: 4.6 },
      { name: 'Methi Chaman', price: 230, description: 'Kashmiri style fresh fenugreek leaves and paneer in rich gravy', emoji: '🥬', isVeg: true, rating: 4.7 },
      { name: 'Veg Kolhapuri', price: 230, description: 'Fiery vegetable curry in authentic spicy Kolhapuri red gravy', emoji: '🌶️', isVeg: true, rating: 4.7 },
      { name: 'Veg Kadai', price: 220, description: 'Mixed vegetables and bell peppers tossed in fresh crushed kadai masala', emoji: '🥘', isVeg: true, rating: 4.7 },
      { name: 'Lasooni Palak', price: 220, description: 'Spinach puree infused with burnt garlic and tempered butter', emoji: '🥬', isVeg: true, rating: 4.8 },
      { name: 'Paneer Kolhapuri', price: 270, description: 'Cottage cheese cubes in spicy and flavorful Kolhapuri masala', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Paneer Masala', price: 260, description: 'Tender paneer cubes simmered in spiced onion-tomato gravy', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Paneer Mutter', price: 250, description: 'Soft paneer and green peas simmered in a mild spiced gravy', emoji: '🧀', isVeg: true, rating: 4.7 },
      { name: 'Paneer Palak', price: 240, description: 'Cottage cheese cubes in smooth seasoned spinach gravy', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Veg Jalfrezi', price: 250, description: 'Spiced stir-fried crunchy vegetables in tangy sweet-sour gravy', emoji: '🥗', isVeg: true, rating: 4.6 },
      { name: 'Veg Diwani Handi', price: 270, description: 'Royal mix of seasonal vegetables and spinach in rich cream gravy', emoji: '🍲', isVeg: true, rating: 4.8 },
      { name: 'Veg Tawa Masala', price: 230, description: 'Spicy pan-roasted vegetables cooked on iron griddle', emoji: '🥘', isVeg: true, rating: 4.6 },
      { name: 'Mushroom Kadai', price: 250, description: 'Button mushrooms and capsicum tossed with fresh ground kadai spices', emoji: '🍄', isVeg: true, rating: 4.7 },
      { name: 'Mushroom Masala', price: 230, description: 'Button mushrooms cooked in rich onion-tomato gravy', emoji: '🍄', isVeg: true, rating: 4.7 },
      { name: 'Plain Palak', price: 190, description: 'Smooth seasoned spinach puree tempered with garlic and cumin', emoji: '🥬', isVeg: true, rating: 4.5 },
      { name: 'Paneer Do Pyaza', price: 260, description: 'Cottage cheese prepared with twice the onions and aromatic spices', emoji: '🧀', isVeg: true, rating: 4.7 },
      { name: 'Paneer Hyderabadi', price: 260, description: 'Hyderabadi style green spinach, mint and curd gravy with paneer', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Paneer Kadai', price: 260, description: 'Paneer cubes and bell peppers tossed in fresh pounded kadai masala', emoji: '🧀', isVeg: true, rating: 4.9 },
      { name: 'Paneer Kurma', price: 250, description: 'Soft paneer in rich mild coconut-cashew gravy', emoji: '🧀', isVeg: true, rating: 4.7 },
      { name: 'Paneer Makhanwala', price: 260, description: 'Paneer cubes in silky butter, cream and sweet tomato gravy', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Veg Makhanwala', price: 240, description: 'Garden vegetables in rich butter and tomato cream gravy', emoji: '🥗', isVeg: true, rating: 4.7 },
      { name: 'Kaju Kolhapuri', price: 270, description: 'Whole roasted cashews in spicy Kolhapuri red chili gravy', emoji: '🥜', isVeg: true, rating: 4.8 },
      { name: 'Kaju Curry', price: 260, description: 'Roasted cashews simmered in rich creamy tomato and onion sauce', emoji: '🥜', isVeg: true, rating: 4.8 },
      { name: 'Kaju Hyderabadi', price: 270, description: 'Cashews cooked in a flavorful mint and coriander green gravy', emoji: '🥜', isVeg: true, rating: 4.8 },
      { name: 'Kaju Masala', price: 260, description: 'Golden cashews cooked in thick spiced brown onion gravy', emoji: '🥜', isVeg: true, rating: 4.8 },
      { name: 'Kaju Makhanwala', price: 280, description: 'Cashews bathed in velvety butter-tomato cream sauce', emoji: '🥜', isVeg: true, rating: 4.9 },
      { name: 'Malai Kofta', price: 270, description: 'Melt-in-mouth paneer and potato dumplings in sweet cashew cream gravy', emoji: '🧆', isVeg: true, rating: 4.9 },
      { name: 'Veg Patiala', price: 280, description: 'Rolled vegetable papad envelopes served over spiced gravy', emoji: '🍲', isVeg: true, rating: 4.8 },
      { name: 'Paneer Tawa Masala', price: 270, description: 'Pan-seared spiced paneer cooked on a flat tawa with aromatics', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Paneer Tikka Masala', price: 270, description: 'Char-grilled paneer tikka simmered in a spiced orange-red gravy', emoji: '🧀', isVeg: true, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80' },
      { name: 'Paneer Butter Masala', price: 270, description: 'All-time favorite cottage cheese in rich makhani butter-tomato gravy', emoji: '🧀', isVeg: true, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80' },
      { name: 'Veg Malwani', price: 230, description: 'Authentic Konkan coastal style coconut and spice vegetable gravy', emoji: '🥗', isVeg: true, rating: 4.7 },
      { name: 'Mushroom Handi', price: 250, description: 'Button mushrooms slow-cooked in handi with whole spices', emoji: '🍄', isVeg: true, rating: 4.7 },
      { name: 'Paneer Handi', price: 250, description: 'Paneer cooked in a traditional handi with rich aromatic brown gravy', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Kaju Paneer Handi', price: 270, description: 'Royal combination of cashews and paneer in handi gravy', emoji: '🧀', isVeg: true, rating: 4.9 },
      { name: 'Kaju Handi', price: 270, description: 'Whole cashews simmered slow in spiced earthen pot gravy', emoji: '🥜', isVeg: true, rating: 4.8 },
      { name: 'Julius Special Veg', price: 380, description: 'Chef special dual-layered royal vegetable gravy with paneer and cashews', emoji: '⭐', isVeg: true, rating: 4.9 },
      { name: 'Egg Masala', price: 180, description: 'Hard-boiled eggs simmered in a spiced onion, ginger and tomato gravy', emoji: '🥚', isVeg: false, rating: 4.7 },
      { name: 'Egg Kolhapuri', price: 190, description: 'Eggs in a fiery red Kolhapuri chili gravy', emoji: '🌶️', isVeg: false, rating: 4.7 },
      { name: 'Egg Hyderabadi', price: 200, description: 'Eggs simmered in a spiced mint and coriander green sauce', emoji: '🥚', isVeg: false, rating: 4.7 },
      { name: 'Egg Makhanwala', price: 200, description: 'Boiled eggs bathed in velvety butter-tomato cream sauce', emoji: '🥚', isVeg: false, rating: 4.8 },
      { name: 'Egg Maharaja', price: 230, description: 'Rich royal cashew and egg curry with whole spices', emoji: '👑', isVeg: false, rating: 4.8 },
      { name: 'Egg Afghani', price: 230, description: 'Eggs simmered in mild white cream and cashew sauce with black pepper', emoji: '🥚', isVeg: false, rating: 4.8 },
      { name: 'Egg Curry', price: 160, description: 'Classic homestyle Indian egg curry', emoji: '🍛', isVeg: false, rating: 4.7 },
      { name: 'Chicken Sukka', price: 270, description: 'Traditional coastal dry chicken tossed with roasted coconut and aromatics', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Gadde Lur-Sukka', price: 200, description: 'Rustic coastal regional chicken sukka preparation', emoji: '🍗', isVeg: false, rating: 4.7 },
      { name: 'Chicken Masala', price: 240, description: 'Tender chicken pieces simmered in spiced brown onion-tomato gravy', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Kolhapuri', price: 260, description: 'Fiery chicken curry infused with authentic spicy Kolhapuri red masala', emoji: '🌶️', isVeg: false, rating: 4.8 },
      { name: 'Chicken Jalfrezi', price: 270, description: 'Shredded chicken and bell peppers tossed in thick tangy spiced sauce', emoji: '🍗', isVeg: false, rating: 4.7 },
      { name: 'Chicken Kadai Masala', price: 250, description: 'Chicken and bell peppers tossed with roasted coriander and red chilies', emoji: '🥘', isVeg: false, rating: 4.9 },
      { name: 'Chicken Do Pyaza', price: 270, description: 'Chicken cooked with double the onions in a rich aromatic sauce', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Mughlai', price: 260, description: 'Royal Mughlai style chicken in egg, cream and cashew enriched gravy', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Handi', price: 260, description: 'Slow-cooked country chicken simmered in clay handi with whole spices', emoji: '🍲', isVeg: false, rating: 4.8 },
      { name: 'Chicken Butter Masala', price: 300, description: 'All-time favorite tandoori chicken chunks in rich butter-tomato gravy', emoji: '🍗', isVeg: false, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chicken Tikka Masala', price: 280, description: 'Char-grilled chicken tikka in spiced tomato, cream and onion sauce', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Malwani', price: 260, description: 'Konkan coastal chicken curry infused with roasted coconut and spices', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Kundapur Chicken', price: 280, description: 'Authentic Kundapura coastal chicken in silky coconut and coriander curry', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Murgh Musallam', price: 530, description: 'Whole marinated chicken slow-roasted and simmered in royal spiced gravy', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Julius Special', price: 450, description: 'Chef signature special coastal chicken preparation with premium nuts and herbs', emoji: '⭐', isVeg: false, rating: 4.9 },
      { name: 'Chicken Adraki Masala', price: 270, description: 'Succulent chicken in a ginger-forward aromatic spiced sauce', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Mutton Masala', price: 320, description: 'Tender baby mutton slow-simmered in rich traditional brown gravy', emoji: '🍖', isVeg: false, rating: 4.9 },
      { name: 'Mutton Handi', price: 340, description: 'Mutton pieces slow-cooked in handi with aromatic spices until tender', emoji: '🍲', isVeg: false, rating: 4.9 },
      { name: 'Mutton Kadai', price: 330, description: 'Tender mutton cooked in wok with capsicum and freshly pounded kadai spices', emoji: '🥘', isVeg: false, rating: 4.8 },
      { name: 'Mutton Kolhapuri', price: 350, description: 'Fiery, spicy mutton cooked in authentic Kolhapuri red masala', emoji: '🌶️', isVeg: false, rating: 4.9 },
      { name: 'Mutton Makhanwala', price: 360, description: 'Boneless tender mutton in a buttery, silky tomato and cashew reduction', emoji: '🍖', isVeg: false, rating: 4.9 },
      { name: 'Mutton Ginger', price: 340, description: 'Tender mutton sauteed with abundant julienned ginger and warm spices', emoji: '🍖', isVeg: false, rating: 4.8 },
      { name: 'Mutton Rogan Josh', price: 340, description: 'Classic Kashmiri mutton curry flavored with alkanet root and fennel', emoji: '🍖', isVeg: false, rating: 4.9 },
      { name: 'Mutton Malwani', price: 350, description: 'Coastal Konkan mutton curry cooked with roasted coconut paste and teppal', emoji: '🍖', isVeg: false, rating: 4.8 },
      { name: 'Mutton Julius Special', price: 700, description: 'Grand house-special royal tender mutton delicacy served in rich spiced gravy', emoji: '👑', isVeg: false, rating: 5.0 },
    ]
  },
  {
    category: 'Indian Breads',
    items: [
      { name: 'Tandoori Roti', price: 35, description: 'Whole wheat flatbread baked crisp in clay oven', emoji: '🫓', isVeg: true, rating: 4.6 },
      { name: 'Butter Roti', price: 40, description: 'Tandoori wheat roti brushed with fresh churned butter', emoji: '🫓', isVeg: true, rating: 4.7 },
      { name: 'Naan', price: 50, description: 'Refined flour leavened flatbread baked in tandoor', emoji: '🥖', isVeg: true, rating: 4.7 },
      { name: 'Butter Naan', price: 60, description: 'Soft tandoori naan brushed generously with melted butter', emoji: '🥖', isVeg: true, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
      { name: 'Butter Garlic Naan', price: 80, description: 'Crisp naan topped with minced roasted garlic and fresh butter', emoji: '🥖', isVeg: true, rating: 4.9 },
      { name: 'Cheese Butter Garlic Naan', price: 95, description: 'Naan loaded with melted cheese, roasted garlic and butter', emoji: '🥖', isVeg: true, rating: 5.0 },
      { name: 'Garlic Naan', price: 70, description: 'Tandoor naan encrusted with minced roasted garlic and cilantro', emoji: '🥖', isVeg: true, rating: 4.8 },
      { name: 'Kulcha', price: 45, description: 'Soft leavened round tandoori bread with sesame and nigella seeds', emoji: '🫓', isVeg: true, rating: 4.6 },
      { name: 'Butter Kulcha', price: 50, description: 'Fluffy tandoor kulcha glazed with melted butter', emoji: '🫓', isVeg: true, rating: 4.7 },
      { name: 'Parota', price: 50, description: 'Flaky layered coastal South Indian parota', emoji: '🫓', isVeg: true, rating: 4.8 },
      { name: 'Butter Parota', price: 55, description: 'Multi-layered flaky parota brushed with butter', emoji: '🫓', isVeg: true, rating: 4.8 },
      { name: 'Garlic Parota', price: 80, description: 'Crispy layered parota infused with minced garlic and butter', emoji: '🫓', isVeg: true, rating: 4.7 },
      { name: 'Cheese Parota', price: 90, description: 'Crispy parota layered with molten cheese', emoji: '🧀', isVeg: true, rating: 4.9 },
      { name: 'Methi Roti', price: 45, description: 'Tandoori wheat roti spiced with fresh fenugreek leaves', emoji: '🫓', isVeg: true, rating: 4.6 },
      { name: 'Aloo Stuffed Parota', price: 90, description: 'Whole wheat flatbread stuffed with spiced mashed potatoes', emoji: '🥔', isVeg: true, rating: 4.8 },
      { name: 'Paneer Stuffed Parota', price: 150, description: 'Flatbread stuffed with seasoned grated cottage cheese and herbs', emoji: '🧀', isVeg: true, rating: 4.9 },
      { name: 'Veg Stuffed Parota', price: 110, description: 'Parota packed with spiced seasonal vegetables', emoji: '🥗', isVeg: true, rating: 4.7 },
      { name: 'Chicken Stuffed Parota', price: 190, description: 'Flaky parota loaded with spiced minced chicken filling', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chapathi', price: 30, description: 'Thin homestyle whole wheat tawa phulka', emoji: '🫓', isVeg: true, rating: 4.6 },
    ]
  },
  {
    category: 'Chinese Rice & Noodles',
    items: [
      { name: 'Veg Fried Rice', price: 170, description: 'Wok-tossed basmati rice with finely chopped garden vegetables and soy', emoji: '🍚', isVeg: true, rating: 4.7 },
      { name: 'Veg Schezwan Fried Rice', price: 180, description: 'Spicy wok-tossed rice in fiery homemade schezwan sauce', emoji: '🌶️', isVeg: true, rating: 4.8 },
      { name: 'Veg Schezwan Triple Fried Rice', price: 210, description: 'Layered schezwan rice and crispy noodles served with spicy Manchurian gravy', emoji: '🍛', isVeg: true, rating: 4.9 },
      { name: 'Veg Hong Kong Fried Rice', price: 210, description: 'Wok rice tossed with bell peppers, cashews and mild sweet-savory sauce', emoji: '🍚', isVeg: true, rating: 4.7 },
      { name: 'Veg Singapore Fried Rice', price: 200, description: 'Aromatic curry powder and turmeric infused wok rice with vegetables', emoji: '🍚', isVeg: true, rating: 4.7 },
      { name: 'Mushroom Fried Rice', price: 200, description: 'Stir-fried rice loaded with fresh sliced button mushrooms and scallions', emoji: '🍄', isVeg: true, rating: 4.8 },
      { name: 'Paneer Fried Rice', price: 210, description: 'Fried rice with golden paneer cubes, veggies and mild seasoning', emoji: '🧀', isVeg: true, rating: 4.8 },
      { name: 'Onion Chilli Fried Rice', price: 180, description: 'Spicy wok-fried rice with charred onions and fresh green chilies', emoji: '🌶️', isVeg: true, rating: 4.6 },
      { name: 'Egg Fried Rice', price: 190, description: 'Classic wok-tossed rice with scrambled eggs and spring onions', emoji: '🥚', isVeg: false, rating: 4.8 },
      { name: 'Egg Schezwan Fried Rice', price: 210, description: 'Spicy schezwan wok rice loaded with scrambled eggs', emoji: '🌶️', isVeg: false, rating: 4.8 },
      { name: 'Chicken Fried Rice', price: 210, description: 'Fragrant wok rice tossed with tender shredded chicken, egg and scallions', emoji: '🍗', isVeg: false, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chicken Schezwan Fried Rice', price: 220, description: 'Fiery schezwan wok-fried rice with tender chicken chunks', emoji: '🌶️', isVeg: false, rating: 4.9 },
      { name: 'Chicken Singapore Fried Rice', price: 270, description: 'Fragrant Singapore spiced chicken fried rice with yellow curry notes', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Chicken Schezwan Triple Fried Rice', price: 270, description: 'Combination of chicken fried rice, noodles and fried egg with schezwan gravy', emoji: '🍛', isVeg: false, rating: 4.9 },
      { name: 'Prawns Fried Rice', price: 330, description: 'Wok-tossed basmati rice packed with juicy coastal prawns and egg', emoji: '🦐', isVeg: false, rating: 4.9 },
      { name: 'Veg Hakka Noodles', price: 200, description: 'Stir-fried oriental noodles tossed with julienned vegetables', emoji: '🍜', isVeg: true, rating: 4.8 },
      { name: 'Veg Schezwan Noodles', price: 210, description: 'Noodles tossed in spicy red schezwan sauce and fresh veggies', emoji: '🌶️', isVeg: true, rating: 4.8 },
      { name: 'Veg Crispy Noodles', price: 200, description: 'Golden crispy noodles served with hot vegetable sweet and sour glaze', emoji: '🍜', isVeg: true, rating: 4.7 },
      { name: 'Veg Hong Kong Noodles', price: 200, description: 'Sweet-savory oriental noodles with colorful bell peppers and greens', emoji: '🍜', isVeg: true, rating: 4.7 },
      { name: 'Veg American Chopsuey', price: 210, description: 'Crispy fried noodles topped with tangy sweet-sour vegetable sauce and pineapple', emoji: '🍜', isVeg: true, rating: 4.8 },
      { name: 'Veg Chinese Noodles', price: 210, description: 'Classic street style wok noodles with cabbage and soy', emoji: '🍜', isVeg: true, rating: 4.6 },
      { name: 'Veg Chinese Chop', price: 220, description: 'Crispy noodle bed crowned with seasoned stir-fried greens and sauce', emoji: '🍜', isVeg: true, rating: 4.7 },
    ]
  },
  {
    category: 'Biryani & Indian Rice',
    items: [
      { name: 'Plain Rice (Full)', price: 55, description: 'Steamed fluffy white rice', emoji: '🍚', isVeg: true, rating: 4.5 },
      { name: 'Plain Rice (Half)', price: 35, description: 'Single portion steamed white rice', emoji: '🍚', isVeg: true, rating: 4.5 },
      { name: 'Steam Rice', price: 80, description: 'Aromatic steamed long-grain basmati rice', emoji: '🍚', isVeg: true, rating: 4.6 },
      { name: 'Boiled Rice (Kaje Rice)', price: 65, description: 'Traditional coastal wholesome red boiled rice', emoji: '🍚', isVeg: true, rating: 4.7 },
      { name: 'Kuska Rice (Full)', price: 150, description: 'Fragrant biryani rice cooked in rich spiced meat-less stock', emoji: '🍚', isVeg: true, rating: 4.8 },
      { name: 'Kuska Rice (Half)', price: 80, description: 'Half portion spiced biryani flavored rice', emoji: '🍚', isVeg: true, rating: 4.7 },
      { name: 'Masala Rice', price: 150, description: 'Basmati rice tossed with roasted onions, tomatoes and garam masala', emoji: '🍚', isVeg: true, rating: 4.6 },
      { name: 'Veg Pulao', price: 180, description: 'Aromatic long-grain rice layered with green peas, carrots and whole spices', emoji: '🍚', isVeg: true, rating: 4.7 },
      { name: 'Curd Rice', price: 140, description: 'Cooling coastal curd rice tempered with mustard seeds, ginger and curry leaves', emoji: '🍚', isVeg: true, rating: 4.8 },
      { name: 'Special Curd Rice', price: 170, description: 'Rich curd rice garnished with pomegranate, roasted cashews and tempered spices', emoji: '🍚', isVeg: true, rating: 4.9 },
      { name: 'Ghee Rice', price: 160, description: 'Fragrant Jeerakasala rice cooked in rich clarified ghee and roasted cashews', emoji: '🍚', isVeg: true, rating: 4.9 },
      { name: 'Palak Khichdi', price: 160, description: 'Comforting lentil and rice porridge infused with seasoned spinach puree', emoji: '🍲', isVeg: true, rating: 4.7 },
      { name: 'Dal Khichdi', price: 170, description: 'Wholesome rice and yellow lentils tempered with cumin, garlic and ghee', emoji: '🍲', isVeg: true, rating: 4.8 },
      { name: 'Palak Rice', price: 150, description: 'Basmati rice cooked with fresh pureed spinach and whole aromatics', emoji: '🍚', isVeg: true, rating: 4.6 },
      { name: 'Lemon Rice', price: 150, description: 'Tangy yellow rice tempered with mustard, peanuts, curry leaves and lemon', emoji: '🍋', isVeg: true, rating: 4.7 },
      { name: 'Peas Pulao', price: 180, description: 'Basmati rice cooked with sweet green peas and mild whole spices', emoji: '🍚', isVeg: true, rating: 4.7 },
      { name: 'Veg Biryani', price: 180, description: 'Layered basmati rice dum-cooked with spiced vegetables and saffron', emoji: '🍚', isVeg: true, rating: 4.8 },
      { name: 'Jeera Rice', price: 150, description: 'Long-grain basmati rice tempered with golden roasted cumin seeds and ghee', emoji: '🍚', isVeg: true, rating: 4.8 },
      { name: 'Egg Biryani', price: 190, description: 'Aromatic dum biryani cooked with fried hard-boiled eggs and caramel onions', emoji: '🥚', isVeg: false, rating: 4.8 },
      { name: 'Chicken Biryani (Full)', price: 230, description: 'Authentic coastal dum biryani with tender chicken pieces, raita and salan', emoji: '🍗', isVeg: false, rating: 4.9, imageUrl: '/images/dishes/chicken_biryani.png' },
      { name: 'Chicken Biryani (Half)', price: 140, description: 'Single portion authentic chicken dum biryani', emoji: '🍗', isVeg: false, rating: 4.8, imageUrl: '/images/dishes/chicken_biryani.png' },
      { name: 'Chicken Tikka Biryani', price: 240, description: 'Fragrant biryani rice layered with smoky tandoori chicken tikka chunks', emoji: '🍗', isVeg: false, rating: 4.9 },
      { name: 'Chicken Kolhapuri Biryani', price: 260, description: 'Spicy fiery chicken biryani infused with Kolhapuri spices', emoji: '🌶️', isVeg: false, rating: 4.9 },
      { name: 'Prawns Biryani', price: 360, description: 'Coastal spiced tiger prawns layered with aromatic ghee-infused basmati rice', emoji: '🦐', isVeg: false, rating: 4.9 },
      { name: 'Mutton Biryani (Full)', price: 310, description: 'Royal dum biryani cooked with succulent tender mutton pieces and saffron', emoji: '🍖', isVeg: false, rating: 5.0, imageUrl: '/images/dishes/mutton_biryani.png' },
      { name: 'Mutton Biryani (Half)', price: 190, description: 'Single portion authentic mutton dum biryani', emoji: '🍖', isVeg: false, rating: 4.9, imageUrl: '/images/dishes/mutton_biryani.png' },
    ]
  },
  {
    category: 'Julius Bar & Beverages',
    items: [
      { name: 'Honnavar Toddy Punch', price: 280, description: 'Signature tropical punch with tender coconut, lime, mint and coastal herbs', emoji: '🍹', isVeg: true, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80' },
      { name: 'Kokum Sol Kadi Fizz', price: 140, description: 'Digestive kokum fruit infusion with roasted cumin and coconut milk', emoji: '🍸', isVeg: true, rating: 4.9 },
      { name: 'Alphonso Mango Mule', price: 220, description: 'Ripe coastal mango puree with a hint of chili and ginger fizz', emoji: '🥭', isVeg: true, rating: 4.6 },
      { name: 'Fresh Tender Coconut (Elaneer)', price: 90, description: 'Chilled sweet coastal coconut water served fresh', emoji: '🥥', isVeg: true, rating: 4.7 },
      { name: 'Fresh Lime Soda (Sweet / Salt)', price: 70, description: 'Fresh squeezed lime with sparkling soda (Sweet, Salt or Mixed)', emoji: '🍋', isVeg: true, rating: 4.8 },
      { name: 'Cold Soft Drinks (330ml)', price: 50, description: 'Chilled Thums Up, Coke, Sprite or Fanta', emoji: '🥤', isVeg: true, rating: 4.6 },
      { name: 'Mineral Water (1 Litre)', price: 30, description: 'Packaged premium drinking water', emoji: '💧', isVeg: true, rating: 4.5 },
    ]
  },
  {
    category: 'Desserts',
    items: [
      { name: 'Honnavar Special Gadbad', price: 160, description: 'Layered coastal classic with jelly, dry fruits, fresh fruit and three ice cream scoops', emoji: '🍨', isVeg: true, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80' },
      { name: 'Elaneer Payasam', price: 140, description: 'Silky tender coconut pulp pudding simmered with cardamom and milk', emoji: '🍮', isVeg: true, rating: 4.8 },
      { name: 'Gulab Jamun with Ice Cream', price: 120, description: 'Warm soft gulab jamuns served with a scoop of creamy vanilla ice cream', emoji: '🍨', isVeg: true, rating: 4.9 },
      { name: 'Sizzling Brownie with Vanilla', price: 180, description: 'Fudgy chocolate brownie on a hot sizzler plate with vanilla ice cream & chocolate fudge', emoji: '🍫', isVeg: true, rating: 5.0 },
    ]
  }
];

const TABLES = [
  { number: 1, section: 'AC', capacity: 4 },
  { number: 2, section: 'AC', capacity: 4 },
  { number: 3, section: 'AC', capacity: 2 },
  { number: 4, section: 'AC', capacity: 6 },
  { number: 5, section: 'Non-AC', capacity: 4 },
  { number: 6, section: 'Non-AC', capacity: 4 },
  { number: 7, section: 'Non-AC', capacity: 2 },
  { number: 8, section: 'Non-AC', capacity: 8 },
];

async function main() {
  try {
    await prisma.$executeRaw`DEALLOCATE ALL;`;
    console.log('✅ Prepared statements cleared');
  } catch (e) {
    // Non-fatal on poolers
  }

  const qrSecret = process.env.QR_SECRET || 'hotel-management-qr-secret-key-2026';

  // --- Seed Admin Users (preserve default and custom) ---
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { passwordHash: passwordHash },
    create: {
      username: 'admin',
      passwordHash: passwordHash,
      name: 'Julius Restaurant Manager'
    }
  });

  const customHash = await bcrypt.hash('julius@R^2U', 10);
  await prisma.admin.upsert({
    where: { username: 'juliusHonnavarHotel' },
    update: { passwordHash: customHash },
    create: {
      username: 'juliusHonnavarHotel',
      passwordHash: customHash,
      name: 'Julius Honnavar Hotel Admin'
    }
  });
  console.log('✅ Seeded admin accounts.');

  // --- Seed Tables ---
  for (const t of TABLES) {
    const table = await prisma.table.upsert({
      where: { number: t.number },
      update: { section: t.section, capacity: t.capacity },
      create: {
        number: t.number,
        section: t.section,
        capacity: t.capacity,
        qrToken: `pending-${t.number}`
      }
    });

    const qrToken = jwt.sign({ tableId: table.id }, qrSecret);
    await prisma.table.update({
      where: { id: table.id },
      data: { qrToken }
    });
  }
  console.log('✅ Seeded 8 restaurant tables.');

  // --- Seed Master Menu ---
  let order = 0;
  for (const group of MENU) {
    const category = await prisma.menuCategory.upsert({
      where: { name: group.category },
      update: { displayOrder: order++ },
      create: { name: group.category, displayOrder: order++ }
    });

    for (const item of group.items) {
      const existing = await prisma.menuItem.findFirst({
        where: { name: item.name, categoryId: category.id }
      });
      if (!existing) {
        await prisma.menuItem.create({
          data: {
            ...item,
            categoryId: category.id
          }
        });
      } else {
        await prisma.menuItem.update({
          where: { id: existing.id },
          data: {
            price: item.price,
            description: item.description,
            emoji: item.emoji,
            imageUrl: item.imageUrl || null,
            isVeg: item.isVeg,
            rating: item.rating
          }
        });
      }
    }
  }

  // Deactivate any old items not in the official MENU categories
  const activeCategoryNames = MENU.map((g) => g.category);
  await prisma.menuItem.updateMany({
    where: { category: { name: { notIn: activeCategoryNames } } },
    data: { available: false }
  });

  console.log(`✅ Seeded full Julius menu: ${MENU.length} categories with all PDF items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
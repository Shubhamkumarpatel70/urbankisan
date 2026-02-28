const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");

const products = [
  {
    name: "Organic Basmati Rice",
    description:
      "Premium long-grain basmati rice from the foothills of Himalayas. Aged for 2 years to develop its characteristic fragrance and fluffy texture. Perfect for biryanis, pulaos, and everyday meals.",
    price: 299,
    category: "grains",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600",
    weight: "1kg",
    stock: 50,
    isFeatured: true,
  },
  {
    name: "Kashmiri Red Chilli",
    description:
      "Authentic Kashmiri chilli powder with rich color and mild heat. Known for its vibrant red color that enhances the appearance of dishes without adding excessive heat.",
    price: 189,
    category: "spices",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
    weight: "250g",
    stock: 100,
    isFeatured: true,
  },
  {
    name: "Pure A2 Ghee",
    description:
      "Traditional bilona method ghee from grass-fed desi cows. Made using the ancient Indian method of churning curd to extract butter, then slow-cooked to create pure, aromatic ghee.",
    price: 599,
    category: "dairy",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600",
    weight: "500ml",
    stock: 30,
    isFeatured: true,
  },
  {
    name: "Fox Nuts (Makhana)",
    description:
      "Premium quality roasted makhana - the perfect healthy snack. Low in calories, high in protein, and incredibly versatile.",
    price: 249,
    category: "snacks",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600",
    weight: "200g",
    stock: 75,
    isFeatured: true,
  },
  {
    name: "Organic Turmeric Powder",
    description:
      "High curcumin content turmeric from Erode, Tamil Nadu. Stone-ground for maximum potency and flavor. Essential for authentic Indian cooking and health benefits.",
    price: 149,
    category: "spices",
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600",
    weight: "200g",
    stock: 80,
    isFeatured: false,
  },
  {
    name: "Cold Pressed Coconut Oil",
    description:
      "Pure virgin coconut oil extracted without heat. Retains all natural nutrients and medium-chain fatty acids. Perfect for cooking, skincare, and haircare.",
    price: 349,
    category: "oils",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600",
    weight: "500ml",
    stock: 45,
    isFeatured: false,
  },
  {
    name: "Organic Jaggery",
    description:
      "Unrefined cane jaggery - a natural sweetener rich in minerals. Made from the juice of organic sugarcane without any chemicals or bleaching agents.",
    price: 129,
    category: "organic",
    image: "https://images.unsplash.com/photo-1604684858948-57bcdb207670?w=600",
    weight: "500g",
    stock: 60,
    isFeatured: false,
  },
  {
    name: "Quinoa",
    description:
      "Protein-rich superfood grain. Contains all nine essential amino acids, making it a complete protein. Great for salads, bowls, and as a rice alternative.",
    price: 399,
    category: "grains",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600",
    weight: "500g",
    stock: 35,
    isFeatured: false,
  },
  {
    name: "Garam Masala",
    description:
      "Aromatic blend of 13 hand-picked spices for authentic Indian cooking. Each batch is freshly ground to ensure maximum flavor and fragrance.",
    price: 169,
    category: "spices",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
    weight: "100g",
    stock: 90,
    isFeatured: false,
  },
  {
    name: "Organic Honey",
    description:
      "Raw, unprocessed honey from wild bee farms in the Western Ghats. No added sugar, no pasteurization - just pure, natural honey with all its enzymes intact.",
    price: 449,
    category: "organic",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600",
    weight: "500g",
    stock: 40,
    isFeatured: false,
  },
  {
    name: "Roasted Almonds",
    description:
      "Lightly salted premium California almonds, dry-roasted for a perfect crunch. A healthy snack packed with protein, fiber, and healthy fats.",
    price: 599,
    category: "snacks",
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600",
    weight: "250g",
    stock: 55,
    isFeatured: false,
  },
  {
    name: "Mustard Oil",
    description:
      "Pure cold-pressed yellow mustard oil with a strong, pungent flavor. Traditional oil used in Indian cooking, known for its health benefits and distinctive taste.",
    price: 199,
    category: "oils",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600",
    weight: "1L",
    stock: 70,
    isFeatured: false,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Product.deleteMany({});
    console.log("Cleared existing products");

    const created = await Product.insertMany(products);
    console.log(`Seeded ${created.length} products`);

    await mongoose.connection.close();
    console.log("Done! Connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedDB();

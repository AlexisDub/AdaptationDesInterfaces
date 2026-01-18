/**
 * Base de données locale d'enrichissement des plats
 * 
 * Le backend ne fournit que: fullName, shortName, price, category, image
 * On enrichit localement avec: description, ingredients, allergens, isSpicy
 * 
 * Indexé par shortName (identifiant unique côté backend)
 */

export interface DishEnrichmentData {
  description: string;
  ingredients: string[];
  allergens: string[];
  isSpicy?: boolean;
  // prepTime sera récupéré du Kitchen Service (meanCookingTimeInSec)
}

/**
 * Données d'enrichissement par shortName
 * 
 * IMPORTANT: Quand vous ajoutez un nouveau plat via POST /menus,
 * ajoutez aussi son enrichissement ici avec le même shortName
 */
export const DISH_ENRICHMENT: Record<string, DishEnrichmentData> = {
  // === ENTRÉES (STARTER) - Backend ===
  "foie gras": {
    description: "Terrine de foie gras maison fondante, servie avec confit d'oignons et pain grillé",
    ingredients: ["Foie gras de canard", "Porto", "Sel", "Poivre", "Pain de campagne", "Confit d'oignons"],
    allergens: ["Gluten"],
  },
  
  "soft-boiled egg": {
    description: "Œuf mollet pané aux noisettes et chapelure, croustillant à l'extérieur",
    ingredients: ["Œuf", "Noisettes", "Chapelure", "Farine", "Huile"],
    allergens: ["Gluten", "Œuf", "Fruits à coque"],
  },
  
  "goat cheese": {
    description: "Mousse de chèvre de la ferme de Valbonne, légère et crémeuse",
    ingredients: ["Fromage de chèvre", "Crème fraîche", "Herbes de Provence", "Huile d'olive"],
    allergens: ["Produits laitiers"],
  },
  
  "salmon": {
    description: "Gravlax de saumon maison mariné à l'aneth, finement tranché",
    ingredients: ["Saumon frais", "Aneth", "Sel", "Sucre", "Citron", "Poivre"],
    allergens: ["Poisson"],
  },
  
  "crab maki": {
    description: "Maki de crabe à la mangue fraîche, roulé avec riz vinaigré",
    ingredients: ["Chair de crabe", "Mangue", "Riz à sushi", "Algue nori", "Vinaigre de riz"],
    allergens: ["Crustacés"],
  },
  
  "burrata": {
    description: "Burrata crémeuse italienne, cœur coulant de stracciatella",
    ingredients: ["Lait de bufflonne", "Crème", "Tomates cerises", "Basilic", "Huile d'olive"],
    allergens: ["Produits laitiers"],
  },
  
  // === PLATS (MAIN) - Backend ===
  "pizza": {
    description: "Pizza Regina délicieuse avec jambon, champignons et mozzarella fondante",
    ingredients: ["Pâte à pizza", "Sauce tomate", "Mozzarella", "Jambon", "Champignons", "Olives"],
    allergens: ["Gluten", "Produits laitiers"],
  },
  
  "lasagna": {
    description: "Lasagnes al forno gratinées, sauce bolognaise et béchamel maison",
    ingredients: ["Pâtes à lasagne", "Viande hachée", "Sauce tomate", "Béchamel", "Parmesan"],
    allergens: ["Gluten", "Produits laitiers"],
  },
  
  "beef burger": {
    description: "Burger maison au bœuf juteux, cheddar et légumes frais",
    ingredients: ["Bœuf haché", "Pain brioche", "Cheddar", "Tomate", "Salade", "Oignon", "Sauce burger"],
    allergens: ["Gluten", "Produits laitiers", "Œuf"],
  },
  
  "beef chuck": {
    description: "Paleron de bœuf cuit 48h à basse température, fondant et savoureux",
    ingredients: ["Paleron de bœuf", "Vin rouge", "Carottes", "Oignons", "Bouillon", "Thym"],
    allergens: [],
  },
  
  "half cooked tuna": {
    description: "Thon mi-cuit et poulpe grillé à la plancha, accompagnement méditerranéen",
    ingredients: ["Thon rouge", "Poulpe", "Huile d'olive", "Citron", "Herbes fraîches", "Légumes grillés"],
    allergens: ["Poisson", "Mollusques"],
  },
  
  // === DESSERTS (DESSERT) ===
  "tiramisu": {
    description: "Dessert italien aux biscuits imbibés de café et mascarpone",
    ingredients: ["Mascarpone", "Biscuits cuillère", "Café", "Cacao", "Œufs"],
    allergens: ["Gluten", "Produits laitiers", "Œuf"],
  },
  
  "tarte-citron": {
    description: "Tarte au citron meringuée avec pâte sablée croustillante",
    ingredients: ["Citrons", "Œufs", "Sucre", "Beurre", "Farine"],
    allergens: ["Gluten", "Produits laitiers", "Œuf"],
  },
  
  // === DESSERTS (DESSERT) - Backend ===
  "brownie": {
    description: "Brownie maison au chocolat, fondant à cœur et croquant en surface",
    ingredients: ["Chocolat noir", "Beurre", "Œufs", "Sucre", "Farine", "Noix"],
    allergens: ["Gluten", "Produits laitiers", "Œuf", "Fruits à coque"],
  },
  
  "chocolate": {
    description: "Déclinaison de chocolat Valrhona avec glace au chocolat salé",
    ingredients: ["Chocolat Valrhona", "Crème", "Lait", "Sel de Guérande", "Œufs"],
    allergens: ["Produits laitiers", "Œuf"],
  },
  
  "lemon": {
    description: "Marmelade de citron de Menton, crème citronnée, gelée au Limoncello et sorbet maison",
    ingredients: ["Citron de Menton", "Limoncello", "Crème", "Sucre", "Meringue"],
    allergens: ["Produits laitiers", "Œuf"],
  },
  
  "rasp and peaches": {
    description: "Framboises et pêches fraîches de saison, coulis de fruits rouges",
    ingredients: ["Framboises", "Pêches", "Sucre", "Menthe fraîche"],
    allergens: [],
  },
  
  "strawberries": {
    description: "Dessert de fraises fraîches avec mousse mascarpone vanillée",
    ingredients: ["Fraises", "Mascarpone", "Vanille", "Sucre", "Crème"],
    allergens: ["Produits laitiers", "Œuf"],
  },
  
  "seasonal fruit": {
    description: "Fruits frais de saison soigneusement sélectionnés",
    ingredients: ["Fruits de saison variés"],
    allergens: [],
  },
  
  "tiramisu": {
    description: "Tiramisu aux spéculoos, version gourmande du classique italien",
    ingredients: ["Mascarpone", "Spéculoos", "Café", "Cacao", "Œufs"],
    allergens: ["Gluten", "Produits laitiers", "Œuf"],
  },
  
  // === BOISSONS (BEVERAGE) - Backend ===
  "coke": {
    description: "Coca-Cola en bouteille 33cl, bien fraîche",
    ingredients: ["Eau gazéifiée", "Sucre", "Colorant caramel", "Arômes naturels", "Caféine"],
    allergens: [],
  },
  
  "ice tea": {
    description: "Ice Tea pêche 33cl, rafraîchissant",
    ingredients: ["Thé", "Sucre", "Arôme pêche", "Eau", "Acide citrique"],
    allergens: [],
  },
  
  "bottled water": {
    description: "Eau minérale en bouteille, plate et pure",
    ingredients: ["Eau minérale naturelle"],
    allergens: [],
  },
  
  "sparkling water": {
    description: "Eau gazeuse pétillante, désaltérante",
    ingredients: ["Eau minérale gazéifiée"],
    allergens: [],
  },
  
  "spritz": {
    description: "Spritz à l'italienne, apéritif pétillant à l'orange amère",
    ingredients: ["Prosecco", "Aperol", "Eau gazeuse", "Orange"],
    allergens: [],
  },
  
  "margarita": {
    description: "Margarita classique, cocktail mexicain au citron vert",
    ingredients: ["Tequila", "Triple sec", "Jus de citron vert", "Sel"],
    allergens: [],
  },
  
  "tequila": {
    description: "Tequila Sunrise, cocktail coloré orange et grenadine",
    ingredients: ["Tequila", "Jus d'orange", "Grenadine", "Glace"],
    allergens: [],
  },
  
  "mojito": {
    description: "Mojito cubain frais, menthe et citron vert",
    ingredients: ["Rhum blanc", "Menthe fraîche", "Citron vert", "Sucre de canne", "Eau gazeuse"],
    allergens: [],
  },
  
  "martini": {
    description: "Martini dry classique, élégant et raffiné",
    ingredients: ["Gin", "Vermouth dry", "Olive", "Glace"],
    allergens: [],
  },
  
  "lemonade": {
    description: "Limonade maison au citron frais, légèrement sucrée",
    ingredients: ["Citron", "Sucre", "Eau gazeuse", "Menthe"],
    allergens: [],
  },
  
  "apple juice": {
    description: "Jus de pomme frais 100% pur fruit",
    ingredients: ["Pommes pressées"],
    allergens: [],
  },
  
  "café": {
    description: "Café expresso italien, corsé et aromatique",
    ingredients: ["Café arabica"],
    allergens: [],
  },
};

/**
 * Récupère les données d'enrichissement pour un plat
 * Retourne des valeurs par défaut si non trouvé
 */
export const getEnrichmentData = (shortName: string): DishEnrichmentData => {
  return DISH_ENRICHMENT[shortName] || {
    description: "Description non disponible",
    ingredients: [],
    allergens: [],
    isSpicy: false,
  };
};

/**
 * Vérifie si un plat a des données d'enrichissement
 */
export const hasEnrichmentData = (shortName: string): boolean => {
  return shortName in DISH_ENRICHMENT;
};

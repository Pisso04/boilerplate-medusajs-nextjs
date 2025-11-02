export type SupportedLocale = "en" | "fr"
export type SortOptionValue = "price_asc" | "price_desc" | "created_at"

type LanguageOption = {
  locale: SupportedLocale
  label: string
  countryCode: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    locale: "fr",
    label: "FR",
    countryCode: "fr",
  },
  {
    locale: "en",
    label: "EN",
    countryCode: "us",
  },
]

export const getLocaleFromCountry = (
  countryCode?: string
): SupportedLocale => {
  const normalized = countryCode?.toLowerCase()
  if (normalized === "fr") {
    return "fr"
  }

  return "en"
}

export const getLanguageOptionByLocale = (locale: SupportedLocale) =>
  LANGUAGE_OPTIONS.find((option) => option.locale === locale)

export const getLanguageOptionByCountry = (countryCode?: string) =>
  LANGUAGE_OPTIONS.find(
    (option) => option.countryCode === countryCode?.toLowerCase()
  )

export const CATALOG_TRANSLATIONS: Record<
  SupportedLocale,
  {
    heading: string
    subheading: string
    sortBy: string
    sortOptions: {
      value: SortOptionValue
      label: string
    }[]
    viewDetails: string
    emptyState: {
      title: string
      description: string
    }
    product_info_title: string
    material: string
    country_of_origin: string
    type: string
    weight: string
    dimensions: string
    subTotal: string
    shipping: string
    discount: string
    taxes: string
    total: string
    cart: string
    viewYourCart: string
    alreadyHaveAnAccount: string
    signInFor: string
    signIn: string
    emptyCartDesc: string
    exploreProducts: string
    item: string
    quantity: string
    price: string
    days: string
    summary: string
    goToCheckout: string
    addPromotion: string
    apply: string
    promotionsApplied: string
    removeDiscount: string
    shippingAndReturns: string
    fastDelivery?: string
    fastDeliveryDesc?: string
    simpleExchange?: string
    simpleExchangeDesc?: string
    easyReturns?: string
    easyReturnsDesc?: string
    addToCart: string
    outOfStock: string
    rental: string
    dailyRate: string
    startRental: string
    addRentalToCart: string
    cancel: string
    startDate: string
    endDate: string
    relatedProducts: string
    relatedProductsDesc: string
    account: string
    remove: string
    goToCart: string
    goToProducts: string
    bagEmpty: string
  }
> = {
  en: {
    heading: "Drone Catalog",
    subheading:
      "Explore professional and recreational drones tailored to filming, racing, and aerial exploration.",
    sortBy: "Sort by",
    sortOptions: [
      { value: "price_asc", label: "Price: Low → High" },
      { value: "price_desc", label: "Price: High → Low" },
    ],
    viewDetails: "View details",
    emptyState: {
      title: "No drones match this view",
      description:
        "Try adjusting your filters or check back soon for new arrivals.",
    },
    product_info_title: "Product Information",
    material: "Material",
    country_of_origin: "Country of origin",
    type: "Type",
    weight: "Weight",
    dimensions: "Dimensions",
    subTotal: "Subtotal (excl. shipping and taxes)",
    shipping: "Shipping",
    discount: "Discount",
    taxes: "Taxes",
    total: "Total",
    cart: "Cart",
    viewYourCart: "View your cart",
    alreadyHaveAnAccount: "Already have an account?",
    signInFor: "Sign in for a better experience",
    signIn: "Sign In",
    emptyCartDesc:
      "You don&apos;t have anything in your cart. Let&apos;s change that, usethe link below to start browsing our products.",
    exploreProducts: "Explore products",
    item: "Item",
    quantity: "Quantity",
    price: "Price",
    days: "days",
    summary: "Summary",
    goToCheckout: "Go to checkout",
    addPromotion: "Add promotion code(s)",
    apply: "Apply",
    promotionsApplied: "Promotion(s) applied",
    removeDiscount: "Remove discount code from order",
    shippingAndReturns: "Shipping & Returns",
    fastDelivery: "Fast Delivery",
    fastDeliveryDesc:
      "Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home.",
    simpleExchange: "Simple Exchange",
    simpleExchangeDesc:
      "Is the fit not quite right? No worries - we&apos;ll exchange your product for a new one.",
    easyReturns: "Easy Returns",
    easyReturnsDesc:
      "Just return your product and we&apos;ll refund your money. No questions asked – we&apos;ll do our best to make sure your return is hassle-free.",
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    rental: "Rental",
    dailyRate: "Daily Rate",
    startRental: "Start Rental",
    addRentalToCart: "Add rental to cart",
    cancel: "Cancel",
    startDate: "Start Date",
    endDate: "End Date",
    relatedProducts: "Related Products",
    relatedProductsDesc: "You might also like these drones",
    account: "Account",
    remove: "Remove",
    goToCart: "Go to cart",
    goToProducts: "Go to all products page",
    bagEmpty: "Your shopping bag is empty.",
  },
  fr: {
    heading: "Catalogue de drones",
    subheading:
      "Découvrez des drones professionnels et de loisir pensés pour la prise de vue, la course et l’exploration aérienne.",
    sortBy: "Trier par",
    sortOptions: [
      { value: "price_asc", label: "Prix : plus bas → plus élevé" },
      { value: "price_desc", label: "Prix : plus élevé → plus bas" },
    ],
    viewDetails: "Voir les détails",
    emptyState: {
      title: "Aucun drone ne correspond à votre recherche",
      description:
        "Modifiez vos filtres ou revenez bientôt pour découvrir les nouveautés.",
    },
    product_info_title: "Informations sur le produit",
    material: "Matériau",
    country_of_origin: "Pays d'origine",
    type: "Type",
    weight: "Poids",
    dimensions: "Dimensions",
    subTotal: "Sous-total (hors frais de port et taxes)",
    shipping: "Frais de port",
    discount: "Remise",
    taxes: "Taxes",
    total: "Total",
    cart: "Panier",
    viewYourCart: "Voir votre panier",
    alreadyHaveAnAccount: "Vous avez déjà un compte ?",
    signInFor: "Connectez-vous pour une meilleure expérience",
    signIn: "Se connecter",
    emptyCartDesc:
      "Vous n&apos;avez rien dans votre panier. Changeons cela, utilisez le lien ci-dessous pour commencer à parcourir nos produits.",
    exploreProducts: "Explorer les produits",
    item: "Article",
    quantity: "Quantité",
    price: "Prix",
    days: "jours",
    summary: "Résumé",
    goToCheckout: "Procéder au paiement",
    addPromotion: "Ajouter le(s) code(s) promotionnel(s)",
    apply: "Appliquer",
    promotionsApplied: "Promotion(s) appliquée(s)",
    removeDiscount: "Supprimer le code de réduction de la commande",
    shippingAndReturns: "Expédition et retours",
    fastDelivery: "Livraison rapide",
    fastDeliveryDesc:
      "Votre colis arrivera sous 3 à 5 jours ouvrables à votre point de retrait ou dans le confort de votre domicile.",
    simpleExchange: "Échange simple",
    simpleExchangeDesc:
      "La taille ne convient pas tout à fait ? Pas de soucis - nous échangerons votre produit contre un nouveau.",
    easyReturns: "Retours faciles",
    easyReturnsDesc:
      "Il vous suffit de retourner votre produit et nous vous rembourserons votre argent. Aucune question posée – nous ferons de notre mieux pour que votre retour se fasse sans tracas.",
    addToCart: "Ajouter au panier",
    outOfStock: "Rupture de stock",
    rental: "Location",
    dailyRate: "Tarif journalier",
    startRental: "Commencer la location",
    addRentalToCart: "Ajouter la location au panier",
    cancel: "Annuler",
    startDate: "Date de début",
    endDate: "Date de fin",
    relatedProducts: "Produits connexes",
    relatedProductsDesc: "Vous pourriez également aimer ces drones",
    account: "Compte",
    remove: "Supprimer",
    goToCart: "Aller au panier",
    goToProducts: "Aller à la page des produits",
    bagEmpty: "Votre panier est vide.",
  },
}

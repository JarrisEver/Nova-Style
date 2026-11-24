import heroEditorialAutumn from './images/hero_editorial_autumn_1795492339490.jpg';
import loginAtelierShowcase from './images/login_atelier_showcase_1795492339824.jpg';
import avatarExecutivePortrait from './images/avatar_executive_portrait_1795492343204.jpg';

import prodMenswearOxford from './images/prod_menswear_oxford_1795492340429.jpg';
import prodWomenswearEditorial from './images/prod_womenswear_editorial_1795492341187.jpg';
import prodFootwearSneakers from './images/prod_footwear_sneakers_1795492341720.jpg';
import prodAccessoriesLuxury from './images/prod_accessories_luxury_1795492342237.jpg';
import prodOuterwearSport from './images/prod_outerwear_sport_1795492342224.jpg';

import prodDenimJeans from './images/prod_denim_jeans_1795495233026.jpg';
import prodPoloPique from './images/prod_polo_pique_1795495233126.jpg';
import prodSatinBlouse from './images/prod_satin_blouse_1795495235250.jpg';
import prodRunningShoes from './images/prod_running_shoes_1795495235880.jpg';
import prodChinoPants from './images/prod_chino_pants_1795495235120.jpg';
import prodLeatherWallet from './images/prod_leather_wallet_1795495234846.jpg';
import prodSportLeggings from './images/prod_sport_leggings_1795495234827.jpg';
import prodPlaidBlazer from './images/prod_plaid_blazer_1795495257533.jpg';
import prodAviatorSunglasses from './images/prod_aviator_sunglasses_1795495257913.jpg';
import prodDenimJacket from './images/prod_denim_jacket_1795495258041.jpg';
import prodOxfordShoes from './images/prod_oxford_shoes_1795495317234.jpg';
import prodSportHoodie from './images/prod_sport_hoodie_1795495257922.jpg';
import prodSteelWatch from './images/prod_steel_watch_1795495317338.jpg';
import prodSwimShorts from './images/prod_swim_shorts_1795495317893.jpg';
import prodPleatedSkirt from './images/prod_pleated_skirt_1795495317670.jpg';
import prodTrenchCoat from './images/prod_trench_coat_1795495317689.jpg';
import prodChelseaBoots from './images/prod_chelsea_boots_1795495335665.jpg';
import prodUrbanBackpack from './images/prod_urban_backpack_1795495335894.jpg';
import prodMerinoSweater from './images/prod_merino_sweater_1795495336965.jpg';
import prodWindbreaker from './images/prod_windbreaker_1795495336878.jpg';
import prodLeatherBelt from './images/prod_leather_belt_1795495337308.jpg';

export const BRAND_MEDIA = {
  heroEditorialAutumn,
  loginAtelierShowcase,
  avatarExecutivePortrait,
  // Uploaded user showcase visuals from /public/assets/aistudio/
  showcaseEcosystem: '/assets/aistudio/image_ca9ac8f0.png',
  showcaseDualHero: '/assets/aistudio/image_bf3d0e92.png',
  showcaseUrban: '/assets/aistudio/image_542c0dc7.png',
  showcase3DCards: '/assets/aistudio/image_b864fea4.png',
};

export const PRODUCT_MEDIA_BY_CATEGORY: Record<string, string> = {
  'Ropa Hombre': prodMenswearOxford,
  'Ropa Mujer': prodWomenswearEditorial,
  Calzado: prodFootwearSneakers,
  Accesorios: prodAccessoriesLuxury,
  'Ropa Deportiva': prodWindbreaker,
};

export const PRODUCT_MEDIA = {
  // Category defaults
  menswear: prodMenswearOxford,
  womenswear: prodWomenswearEditorial,
  footwear: prodFootwearSneakers,
  accessories: prodAccessoriesLuxury,
  outerwear: prodOuterwearSport,

  // Dedicated 1-to-1 product studio photos
  oxfordShirt: prodMenswearOxford,
  denimJeans: prodDenimJeans,
  floralDress: prodWomenswearEditorial,
  urbanSneakers: prodFootwearSneakers,
  poloPique: prodPoloPique,
  pufferJacket: prodOuterwearSport,
  satinBlouse: prodSatinBlouse,
  runningShoes: prodRunningShoes,
  chinoPants: prodChinoPants,
  leatherTote: prodAccessoriesLuxury,
  leatherWallet: prodLeatherWallet,
  sportLeggings: prodSportLeggings,
  plaidBlazer: prodPlaidBlazer,
  aviatorSunglasses: prodAviatorSunglasses,
  denimJacket: prodDenimJacket,
  oxfordShoes: prodOxfordShoes,
  sportHoodie: prodSportHoodie,
  steelWatch: prodSteelWatch,
  swimShorts: prodSwimShorts,
  pleatedSkirt: prodPleatedSkirt,
  trenchCoat: prodTrenchCoat,
  chelseaBoots: prodChelseaBoots,
  urbanBackpack: prodUrbanBackpack,
  merinoSweater: prodMerinoSweater,
  windbreaker: prodWindbreaker,
  leatherBelt: prodLeatherBelt,
};

export function resolveSafeMediaUrl(url: string | undefined, category?: string): string {
  if (!url || url.includes('unsplash.com') || url.includes('placeholder')) {
    if (category && PRODUCT_MEDIA_BY_CATEGORY[category]) {
      return PRODUCT_MEDIA_BY_CATEGORY[category];
    }
    return prodMenswearOxford;
  }
  return url;
}

export function resolveSafeAvatarUrl(url: string | undefined): string {
  if (!url || url.includes('unsplash.com') || url.includes('placeholder')) {
    return avatarExecutivePortrait;
  }
  return url;
}

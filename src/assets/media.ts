import heroEditorialAutumn from './images/hero_editorial_autumn_1795492339490.jpg';
import loginAtelierShowcase from './images/login_atelier_showcase_1795492339824.jpg';
import prodMenswearOxford from './images/prod_menswear_oxford_1795492340429.jpg';
import prodWomenswearEditorial from './images/prod_womenswear_editorial_1795492341187.jpg';
import prodFootwearSneakers from './images/prod_footwear_sneakers_1795492341720.jpg';
import prodAccessoriesLuxury from './images/prod_accessories_luxury_1795492342237.jpg';
import prodOuterwearSport from './images/prod_outerwear_sport_1795492342224.jpg';
import avatarExecutivePortrait from './images/avatar_executive_portrait_1795492343204.jpg';

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
  'Ropa Deportiva': prodOuterwearSport,
};

export const PRODUCT_MEDIA = {
  menswear: prodMenswearOxford,
  womenswear: prodWomenswearEditorial,
  footwear: prodFootwearSneakers,
  accessories: prodAccessoriesLuxury,
  outerwear: prodOuterwearSport,
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

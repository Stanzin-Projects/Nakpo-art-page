// Seed the gallery with the artist's framed works.
// Images live in frontend/public/artworks and are served at /artworks/artN.webp.
// Idempotent AND authoritative: re-running updates the listed titles and deletes
// any artwork not listed here, so the gallery always matches this seed exactly.
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';
import { connectDB } from './config/database.js';
import Artwork from './models/Artwork.model.js';
import Coupon from './models/Coupon.model.js';
import User from './models/User.model.js';
import SiteContent from './models/SiteContent.model.js';
import { hashPassword } from './utils/auth.js';
import { DEFAULT_CONTENT } from './routes/siteContent.routes.js';

dotenv.config();

const img = (n) => `/artworks/art${n}.webp`;

export const artworks = [
  {
    title: 'Shadows on the Summit',
    description:
      'A lone peak rising out of a moonless black sky — fine cross-hatching builds the ice and scree of the high Himalaya until the mountain seems to carry its own light.',
    imageUrl: img(1),
    category: 'Black & White',
    price: 640,
    originalPrice: 800,
    discount: 20,
    dimensions: '40 × 55 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
    isFeatured: true,
  },
  {
    title: 'The Valley Road',
    description:
      'A colour study of the road into Zanskar: a grey cloud trailing across a flat blue sky, a pale sun, and a river braiding through ochre and olive slopes.',
    imageUrl: img(2),
    category: 'Colour',
    price: 720,
    dimensions: '40 × 55 cm',
    medium: 'Ink & Colour',
    isOriginal: true,
    isFeatured: true,
  },
  {
    title: 'Gorge of the Zanskar',
    description:
      'Black ink on white paper, worked until the gorge reads as depth itself — rock spires, a dark running river, and the pale road that follows it.',
    imageUrl: img(3),
    category: 'Black & White',
    price: 580,
    dimensions: '40 × 55 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
  },
  {
    title: 'Taj Mahal, Ink Study',
    description:
      'The Taj drawn in patient black linework — dome, minarets and cypress avenue — a study of symmetry rather than a postcard.',
    imageUrl: img(4),
    category: 'Black & White',
    price: 480,
    dimensions: '55 × 40 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
  },
  {
    title: 'Camp Under Storm Light',
    description:
      'A watercolour from the road: two tents pitched in wet grass, a yellow one catching the last light while the storm gathers over the ridge.',
    imageUrl: img(5),
    category: 'Colour',
    price: 410,
    originalPrice: 480,
    discount: 15,
    dimensions: '40 × 55 cm',
    medium: 'Watercolour & Ink',
    isOriginal: true,
  },
  {
    title: 'Village at the Foot of the Cliff',
    description:
      'Flat white houses tucked beneath a wall of rock, with the sky given over almost entirely to black — the moment before a storm swallows the light.',
    imageUrl: img(6),
    category: 'Black & White',
    price: 560,
    dimensions: '40 × 55 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
    isFeatured: true,
  },
  {
    title: 'The Bird Keeper',
    description:
      'A figure in a painted bird mask and a red block-print jacket, set against a field of yellow — the folk costume of the high villages, drawn as a portrait.',
    imageUrl: img(7),
    category: 'Colour',
    price: 690,
    dimensions: '40 × 55 cm',
    medium: 'Ink & Gouache',
    isOriginal: true,
  },
  {
    title: 'Trekkers in the Canyon',
    description:
      'A wide canyon rendered in layered colour and hard outlines — a footpath, three walkers, a turquoise stream, and cliffs stacked like cut paper.',
    imageUrl: img(8),
    category: 'Colour',
    price: 780,
    dimensions: '55 × 40 cm',
    medium: 'Ink & Watercolour',
    isOriginal: true,
  },
  {
    title: 'Fields Below the Pass',
    description:
      'A village of flat-roofed houses at dusk, the mountain behind turning blue and violet while the barley fields keep the last of the daylight.',
    imageUrl: img(9),
    category: 'Colour',
    price: 820,
    dimensions: '55 × 40 cm',
    medium: 'Gouache',
    isOriginal: true,
  },
  {
    title: 'Camp in the Meadow',
    description:
      'Tents pitched in a green meadow with a grazing horse and a whitewashed house on the ridge — a quiet, sunlit day between two stages of a trek.',
    imageUrl: img(10),
    category: 'Colour',
    price: 640,
    dimensions: '55 × 40 cm',
    medium: 'Gouache',
    isOriginal: false,
  },
  {
    title: 'Monastery in the Cliff',
    description:
      'The cliffside monastery, its cells stacked into the rock face — drawn in ink so the architecture and the stone read as one continuous structure.',
    imageUrl: img(11),
    category: 'Black & White',
    price: 850,
    dimensions: '40 × 55 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
    isFeatured: true,
  },
  {
    title: 'Pines in the Snowlight',
    description:
      'A screen-print style landscape in coral, cream and black — pines, a folded snow ridge and two small figures crossing the slope.',
    imageUrl: img(12),
    category: 'Colour',
    price: 520,
    dimensions: '50 × 50 cm',
    medium: 'Screen Print',
    isOriginal: false,
  },
  {
    title: 'The Old Lane',
    description:
      'A stone-paved lane between old houses, trees and sky pushed to solid black so the only light left is the path itself.',
    imageUrl: img(13),
    category: 'Black & White',
    price: 540,
    dimensions: '40 × 55 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
  },
  {
    title: 'Under the Beams',
    description:
      'A close study of a timber roof from below — beams, rafters and thatch worked in dense line until the joinery becomes its own geometry.',
    imageUrl: img(14),
    category: 'Black & White',
    price: 460,
    dimensions: '40 × 55 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
  },
  {
    title: 'Ridge and Forest',
    description:
      'A forested ridge seen from above, with a village at its foot — thousands of strokes of ink building pine, rock and shadow across a wide sheet.',
    imageUrl: img(15),
    category: 'Black & White',
    price: 700,
    dimensions: '55 × 40 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
  },
  {
    title: 'House Under a Red Sky',
    description:
      'A Tibetan farmhouse in flat colour against a crimson sky — ochre walls, red window frames and a wall of stacked stone in the foreground.',
    imageUrl: img(16),
    category: 'Colour',
    price: 600,
    dimensions: '55 × 40 cm',
    medium: 'Gouache',
    isOriginal: true,
  },
];

const coupons = [
  {
    code: 'WELCOME15',
    description: '15% off your first order (min $50)',
    discountType: 'percent',
    value: 15,
    minSubtotal: 50,
  },
  {
    code: 'YAK10',
    description: '10% off any order over $100',
    discountType: 'percent',
    value: 10,
    minSubtotal: 100,
  },
  {
    code: 'ART50',
    description: '$50 off orders over $500',
    discountType: 'fixed',
    value: 50,
    minSubtotal: 500,
  },
];

async function seed() {
  await connectDB();
  let created = 0;
  let updated = 0;
  const titles = artworks.map((a) => a.title);
  for (const artwork of artworks) {
    const res = await Artwork.updateOne({ title: artwork.title }, { $set: artwork }, { upsert: true });
    if (res.upsertedCount > 0) created += 1;
    else updated += 1;
  }
  // Authoritative: remove anything not listed above so the gallery matches the seed.
  const removed = await Artwork.deleteMany({ title: { $nin: titles } });
  console.log(
    `✔ Seeded ${artworks.length} artworks (${created} created, ${updated} updated, ${removed.deletedCount} removed).`
  );

  let couponsCreated = 0;
  let couponsUpdated = 0;
  for (const coupon of coupons) {
    const res = await Coupon.updateOne({ code: coupon.code }, { $set: coupon }, { upsert: true });
    if (res.upsertedCount > 0) couponsCreated += 1;
    else couponsUpdated += 1;
  }
  console.log(`✔ Seeded ${coupons.length} coupons (${couponsCreated} created, ${couponsUpdated} updated).`);

  // Admin account — sign-in is reserved for the admin (guests order without an account).
  const ADMIN_EMAIL = 'admin@artbylopsang.com';
  const ADMIN_PASSWORD = 'admin123';
  const { salt, hash } = hashPassword(ADMIN_PASSWORD);
  const adminRes = await User.updateOne(
    { email: ADMIN_EMAIL },
    { $set: { name: 'Admin', email: ADMIN_EMAIL, salt, hash, isAdmin: true } },
    { upsert: true }
  );
  console.log(
    `✔ Admin account ready: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}${adminRes.upsertedCount > 0 ? ' (created)' : ' (updated)'}`
  );

  // Editable homepage sections (hero, gallery, about, contact).
  const contentRes = await SiteContent.updateOne({ key: 'main' }, { $set: DEFAULT_CONTENT }, { upsert: true });
  console.log(
    `✔ Site content seeded (${contentRes.upsertedCount > 0 ? 'created' : 'updated'}).`
  );

  const mongoose = (await import('mongoose')).default;
  await mongoose.disconnect();
  process.exit(0);
}

// Run only when executed directly (`node seed.js`), so the catalogue can be
// imported elsewhere without reseeding the database.
const isDirectRun =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}

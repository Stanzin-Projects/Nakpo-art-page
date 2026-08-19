// Seed the gallery with the artist's black-and-white artwork.
// Currently every gallery card uses the same image (frontend/public/yak-artwork.png,
// served at /yak-artwork.png) — swap in more images by editing the entries below
// (e.g. drop files in frontend/public and use /your-file.png).
// Idempotent AND authoritative: re-running updates the listed titles and deletes
// any artwork not listed here, so the gallery always matches this seed exactly.
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import Artwork from './models/Artwork.model.js';
import Coupon from './models/Coupon.model.js';
import User from './models/User.model.js';
import SiteContent from './models/SiteContent.model.js';
import { hashPassword } from './utils/auth.js';
import { DEFAULT_CONTENT } from './routes/siteContent.routes.js';

dotenv.config();

const IMAGE_URL = '/yak-artwork.png';

const artworks = [
  {
    title: 'Yak Study I',
    description:
      'A black-and-white ink study of the Himalayan yak — heavy cross-hatching and stippling capture the shaggy fur, curved horns, and quiet strength of the high mountains.',
    imageUrl: IMAGE_URL,
    category: 'Black & White',
    price: 420,
    originalPrice: 560,
    discount: 25,
    dimensions: '50 × 50 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
    isFeatured: true,
  },
  {
    title: 'Yak Study II',
    description:
      'The yak rendered in dense black linework against the light — a study in texture, shadow, and the presence of an animal that carries whole communities.',
    imageUrl: IMAGE_URL,
    category: 'Black & White',
    price: 680,
    dimensions: '50 × 50 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
  },
  {
    title: 'Yak Study III',
    description:
      'A bold monochrome portrait of the yak — confident contour lines and stark negative space, drawn from a life shaped by the Zanskar mountains.',
    imageUrl: IMAGE_URL,
    category: 'Black & White',
    price: 720,
    dimensions: '50 × 50 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
  },
  {
    title: 'Yak Study IV',
    description:
      'Ink and patience — every hair of the yak’s hanging fur is built up stroke by stroke, a meditation on detail in pure black and white.',
    imageUrl: IMAGE_URL,
    category: 'Black & White',
    price: 540,
    dimensions: '50 × 50 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
  },
  {
    title: 'Yak Study V',
    description:
      'The yak, seen head-on, with its distinctive hump and heavy winter coat — drawn in stark monochrome with a hand-inked signature at the corner.',
    imageUrl: IMAGE_URL,
    category: 'Black & White',
    price: 390,
    dimensions: '50 × 50 cm',
    medium: 'Pen & Ink',
    isOriginal: false,
  },
  {
    title: 'Yak Study VI',
    description:
      'A study in shadow and light — the yak emerging from a dark ground through layered cross-hatching, ink on paper, signed by the artist.',
    imageUrl: IMAGE_URL,
    category: 'Black & White',
    price: 460,
    dimensions: '50 × 50 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
    isFeatured: true,
  },
  {
    title: 'Yak Study VII',
    description:
      'An homage to the mountains — the yak in black ink, its shaggy silhouette built from fine parallel lines that give the fur its weight.',
    imageUrl: IMAGE_URL,
    category: 'Black & White',
    price: 350,
    originalPrice: 412,
    discount: 15,
    dimensions: '50 × 50 cm',
    medium: 'Pen & Ink',
    isOriginal: true,
  },
  {
    title: 'Yak Study VIII',
    description:
      'Crisp contours and stark silhouettes — the yak drawn with economy and precision, proving how much drama black ink on white paper can hold.',
    imageUrl: IMAGE_URL,
    category: 'Black & White',
    price: 380,
    dimensions: '50 × 50 cm',
    medium: 'Pen & Ink',
    isOriginal: false,
  },
  {
    title: 'Yak Study IX',
    description:
      'A patient pen-and-ink rendering of the yak — stippling and cross-hatching turn a single subject into a rich study of light, fur, and character.',
    imageUrl: IMAGE_URL,
    category: 'Black & White',
    price: 310,
    dimensions: '50 × 50 cm',
    medium: 'Pen & Ink',
    isOriginal: false,
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

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

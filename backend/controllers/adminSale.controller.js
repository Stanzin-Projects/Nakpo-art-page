import Artwork from '../models/Artwork.model.js';
import SiteContent from '../models/SiteContent.model.js';

const round = (n) => Math.round(n * 100) / 100;

function parsePercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n <= 0 || n >= 100) return null;
  return Math.round(n * 100) / 100;
}

/**
 * Apply one percentage off every artwork.
 *
 * The pre-sale price is remembered in `priceBeforeSale`, so running the sale a
 * second time cannot compound the discount and ending it restores exactly the
 * prices that were there before.
 */
export async function applySale(req, res) {
  try {
    const percent = parsePercent(req.body.percent);
    if (percent === null) return res.status(400).json({ message: 'Enter a discount between 1 and 99 percent' });

    const label = String(req.body.label || '').trim();
    const endsAt = req.body.endsAt ? String(req.body.endsAt) : '';

    const artworks = await Artwork.find();
    let updated = 0;

    for (const art of artworks) {
      const baseline = art.priceBeforeSale ?? art.price;
      if (baseline === undefined || baseline === null) continue;
      const salePrice = round(Number(baseline) * (1 - percent / 100));
      art.priceBeforeSale = baseline;
      art.price = salePrice;
      art.originalPrice = baseline;
      art.discount = percent;
      await art.save();
      updated += 1;
    }

    const sale = await SiteContent.findOneAndUpdate(
      { key: 'main' },
      { $set: { sale: { active: true, label, percent, endsAt } } },
      { new: true, upsert: true }
    );

    res.json({ updated, percent, sale: sale.sale });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/** End the sale: restore every price that the sale changed. */
export async function clearSale(req, res) {
  try {
    const artworks = await Artwork.find({ priceBeforeSale: { $ne: null } });
    let restored = 0;

    for (const art of artworks) {
      if (art.priceBeforeSale === undefined || art.priceBeforeSale === null) continue;
      art.price = art.priceBeforeSale;
      art.priceBeforeSale = undefined;
      art.discount = 0;
      art.originalPrice = undefined;
      await art.save();
      restored += 1;
    }

    const doc = await SiteContent.findOne({ key: 'main' });
    if (doc) {
      doc.sale = { active: false, label: doc.sale?.label || '', percent: 0, endsAt: '' };
      await doc.save();
    }

    res.json({ restored, sale: doc?.sale || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

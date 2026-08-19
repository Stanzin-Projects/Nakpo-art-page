import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ImagePlus,
  Loader2,
  LayoutGrid,
  PanelsTopLeft,
} from 'lucide-react';
import { getArtworks, createArtwork, updateArtwork, deleteArtwork } from '../api/artwork.api';
import { getSiteContent, updateSiteContent } from '../api/siteContent.api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  medium: '',
  dimensions: '',
  price: '',
  originalPrice: '',
  discount: '',
  year: '',
  isOriginal: true,
  isFeatured: false,
  imageUrl: '',
};

const EMPTY_CONTENT = {
  hero: { title: '', subtitle: '', description: '', ctaText: '', backgroundImage: '' },
  gallery: { title: '', description: '' },
  about: { title: '', subtitle: '', description: '', image: '', stats: [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }] },
  contact: { title: '', description: '', email: '', phone: '', address: '', website: '' },
};

export default function AdminPage() {
  const { user } = useAuth();
  const { push } = useToast();

  const [tab, setTab] = useState('artworks');

  // ---- artworks ----
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  // ---- site sections ----
  const [content, setContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getArtworks();
      setArtworks(res.data || []);
    } catch (err) {
      push(err.response?.data?.message || 'Could not load artworks', 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  const loadContent = useCallback(async () => {
    try {
      const res = await getSiteContent();
      setContent(res.data);
    } catch (err) {
      push(err.response?.data?.message || 'Could not load site content', 'error');
    } finally {
      setContentLoading(false);
    }
  }, [push]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    load();
    loadContent();
  }, [user, load, loadContent]);

  // ---- artwork editor ----
  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setEditorOpen(true);
  };

  const openEdit = (art) => {
    setEditing(art);
    setForm({
      title: art.title || '',
      description: art.description || '',
      category: art.category || '',
      medium: art.medium || '',
      dimensions: art.dimensions || '',
      price: art.price ?? '',
      originalPrice: art.originalPrice ?? '',
      discount: art.discount ?? '',
      year: art.year ?? '',
      isOriginal: art.isOriginal ?? true,
      isFeatured: art.isFeatured ?? false,
      imageUrl: art.imageUrl || art.image || '',
    });
    setFile(null);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditing(null);
    setFile(null);
    setEditorOpen(false);
  };

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      push('Title is required', 'error');
      return;
    }
    if (!editing && !file) {
      push('Choose an image file to upload', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = file
        ? (() => {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v === null || v === undefined ? '' : v));
            fd.append('image', file);
            return fd;
          })()
        : { ...form, imageUrl: form.imageUrl.trim() };

      if (editing) {
        await updateArtwork(editing._id || editing.id, payload);
        push(`"${form.title}" updated`);
      } else {
        await createArtwork(payload);
        push(`"${form.title}" added to the gallery`);
      }
      closeEditor();
      setLoading(true);
      await load();
    } catch (err) {
      push(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (art) => {
    const id = art._id || art.id;
    if (!window.confirm(`Delete "${art.title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteArtwork(id);
      push(`"${art.title}" deleted`, 'info');
      await load();
    } catch (err) {
      push(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ---- sections editor ----
  const setSection = (section, key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setContent((c) => ({ ...c, [section]: { ...(c?.[section] || {}), [key]: value } }));
  };

  const setStat = (section, index, key) => (e) => {
    const value = e.target.value;
    setContent((c) => {
      const stats = [...((c?.[section]?.stats) || [])];
      stats[index] = { ...stats[index], [key]: value };
      return { ...c, [section]: { ...c[section], stats } };
    });
  };

  const handleSaveSections = async () => {
    if (!content) return;
    setSavingContent(true);
    try {
      await updateSiteContent({
        hero: content.hero || {},
        gallery: content.gallery || {},
        about: content.about || {},
        contact: content.contact || {},
      });
      push('Sections updated — the homepage now shows your changes');
    } catch (err) {
      push(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSavingContent(false);
    }
  };

  // ---- access guard ----
  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-medium mb-2">Admin access required</h1>
        <p className="text-muted-foreground mb-6">Sign in with the admin account to manage the site.</p>
        <Link to="/login" className="h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center">
          Admin Sign In
        </Link>
      </div>
    );
  }
  if (!user.isAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-medium mb-2">Admin access required</h1>
        <p className="text-muted-foreground">Only the admin can manage the site. Guests browse and order directly.</p>
      </div>
    );
  }

  const inputCls = 'w-full h-10 px-3 rounded-md border border-border bg-background text-sm';
  const labelCls = 'block text-xs text-muted-foreground mb-1';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-medium">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage the gallery and every section of the site.</p>
        </div>
        {tab === 'artworks' && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add Artwork
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => setTab('artworks')}
          className={`inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium ${
            tab === 'artworks' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
          }`}
        >
          <LayoutGrid className="h-4 w-4" /> Artworks
        </button>
        <button
          type="button"
          onClick={() => setTab('sections')}
          className={`inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium ${
            tab === 'sections' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
          }`}
        >
          <PanelsTopLeft className="h-4 w-4" /> Site Sections
        </button>
      </div>

      {/* ================= Artworks tab ================= */}
      {tab === 'artworks' && (
        <>
          {editorOpen && (
            <div className="mb-10 border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-medium">{editing ? `Edit: ${editing.title}` : 'Add New Artwork'}</h2>
                <button type="button" onClick={closeEditor} className="p-2 hover:bg-muted rounded-md" title="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Title *</label>
                    <input value={form.title} onChange={set('title')} className={inputCls} placeholder="Yak Study X" />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={set('description')}
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none"
                      placeholder="A short description of the piece…"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Category</label>
                      <input value={form.category} onChange={set('category')} className={inputCls} placeholder="Black & White" />
                    </div>
                    <div>
                      <label className={labelCls}>Medium</label>
                      <input value={form.medium} onChange={set('medium')} className={inputCls} placeholder="Pen & Ink" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Dimensions</label>
                    <input value={form.dimensions} onChange={set('dimensions')} className={inputCls} placeholder="50 × 50 cm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!form.isOriginal} onChange={set('isOriginal')} /> Original
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!form.isFeatured} onChange={set('isFeatured')} /> Featured
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Price (₹)</label>
                      <input type="number" value={form.price} onChange={set('price')} className={inputCls} placeholder="420" />
                    </div>
                    <div>
                      <label className={labelCls}>Original Price (₹)</label>
                      <input type="number" value={form.originalPrice} onChange={set('originalPrice')} className={inputCls} placeholder="560" />
                    </div>
                    <div>
                      <label className={labelCls}>Discount %</label>
                      <input type="number" value={form.discount} onChange={set('discount')} className={inputCls} placeholder="25" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Year</label>
                      <input type="number" value={form.year} onChange={set('year')} className={inputCls} placeholder="2026" />
                    </div>
                  </div>

                  <div>
                    <label className={`${labelCls} inline-flex items-center gap-1.5`}>
                      <ImagePlus className="h-3.5 w-3.5" /> Upload an image file *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm"
                    />
                    {file ? (
                      <p className="text-xs text-muted-foreground mt-1">Selected: {file.name}</p>
                    ) : (
                      editing && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Keep the current image — or choose a new file to replace it.
                        </p>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0">
                      {file ? (
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageWithFallback src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Live preview of the selected image.</div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {editing ? 'Save Changes' : 'Add Artwork'}
                    </button>
                    <button
                      type="button"
                      onClick={closeEditor}
                      className="h-10 px-5 rounded-md border border-border text-sm font-medium hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading artworks…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((art) => {
                const id = art._id || art.id;
                const image = art.imageUrl || art.image;
                return (
                  <div key={String(id)} className="border border-border rounded-lg overflow-hidden flex flex-col">
                    <div className="aspect-[4/5] overflow-hidden bg-muted">
                      <ImageWithFallback src={image} alt={art.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium">{art.title}</h3>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">₹{art.price ?? 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {art.category || 'general'}
                        {art.discount ? ` · ${art.discount}% off` : ''}
                      </p>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                        <button
                          type="button"
                          onClick={() => openEdit(art)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-border text-sm font-medium hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(art)}
                          disabled={deletingId === String(id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === String(id) ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ================= Sections tab ================= */}
      {tab === 'sections' && (
        <div className="space-y-8">
          {contentLoading || !content ? (
            <div className="text-center py-12 text-muted-foreground">Loading sections…</div>
          ) : (
            <>
              {/* Hero */}
              <SectionCard title="Hero Section">
                <Field label="Title" value={content.hero?.title || ''} onChange={setSection('hero', 'title')} />
                <Field label="Subtitle" value={content.hero?.subtitle || ''} onChange={setSection('hero', 'subtitle')} />
                <Field label="Description" value={content.hero?.description || ''} onChange={setSection('hero', 'description')} textarea />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Button text" value={content.hero?.ctaText || ''} onChange={setSection('hero', 'ctaText')} />
                  <Field label="Background image URL" value={content.hero?.backgroundImage || ''} onChange={setSection('hero', 'backgroundImage')} />
                </div>
              </SectionCard>

              {/* Gallery */}
              <SectionCard title="Gallery Section">
                <Field label="Heading" value={content.gallery?.title || ''} onChange={setSection('gallery', 'title')} />
                <Field label="Description" value={content.gallery?.description || ''} onChange={setSection('gallery', 'description')} textarea />
              </SectionCard>

              {/* About */}
              <SectionCard title="About Section">
                <Field label="Title" value={content.about?.title || ''} onChange={setSection('about', 'title')} />
                <Field label="Subtitle" value={content.about?.subtitle || ''} onChange={setSection('about', 'subtitle')} />
                <Field label="Description" value={content.about?.description || ''} onChange={setSection('about', 'description')} textarea />
                <Field label="Image URL" value={content.about?.image || ''} onChange={setSection('about', 'image')} />
                <div>
                  <p className="text-sm font-medium mb-2">Stats</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(content.about?.stats || []).map((stat, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <input
                          value={stat.value || ''}
                          onChange={setStat('about', i, 'value')}
                          className={inputCls}
                          placeholder="100+"
                        />
                        <input
                          value={stat.label || ''}
                          onChange={setStat('about', i, 'label')}
                          className={inputCls}
                          placeholder="Artworks Created"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Contact */}
              <SectionCard title="Contact Section">
                <Field label="Title" value={content.contact?.title || ''} onChange={setSection('contact', 'title')} />
                <Field label="Description" value={content.contact?.description || ''} onChange={setSection('contact', 'description')} textarea />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email" value={content.contact?.email || ''} onChange={setSection('contact', 'email')} />
                  <Field label="Phone" value={content.contact?.phone || ''} onChange={setSection('contact', 'phone')} />
                  <Field label="Address" value={content.contact?.address || ''} onChange={setSection('contact', 'address')} />
                  <Field label="Website" value={content.contact?.website || ''} onChange={setSection('contact', 'website')} />
                </div>
              </SectionCard>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSections}
                  disabled={savingContent}
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  {savingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save All Sections
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="border border-border rounded-lg p-6">
      <h2 className="font-medium mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, textarea }) {
  const cls = 'w-full h-10 px-3 rounded-md border border-border bg-background text-sm';
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none"
        />
      ) : (
        <input value={value} onChange={onChange} className={cls} />
      )}
    </div>
  );
}

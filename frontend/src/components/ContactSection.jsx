import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Globe, Instagram, Twitter, Facebook } from 'lucide-react';
import { submitContact } from '../api/contact.api';

const defaultContact = {
  title: 'Get In Touch',
  description:
    "Have a question about a piece? Interested in commissioning custom artwork? I'd love to hear from you.",
  email: 'nakpocreativestudio@gmail.com',
  phone: '+1234567892',
  address: 'Dehradun Uttarakhand',
  website: 'https://644286d91e53c.site123.me/',
};

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/', color: 'hover:text-pink-500' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/', color: 'hover:text-blue-500' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/', color: 'hover:text-blue-600' },
];

export function ContactSection({ siteContent }) {
  const contactData = siteContent?.contact || defaultContact;
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [sending, setSending] = useState(false);

  const contactInfo = [
    { icon: Mail, label: 'Email', value: contactData.email },
    { icon: Phone, label: 'Phone', value: contactData.phone },
    { icon: MapPin, label: 'Studio', value: contactData.address },
    { icon: Globe, label: 'Website', value: contactData.website },
  ].filter((item) => item.value);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: null, message: '' });
    try {
      await submitContact({ name: formData.name, email: formData.email, message: formData.message || formData.subject });
      setStatus({ type: 'success', message: "Message sent! I'll get back to you soon." });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to send. Try again.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-16 lg:py-20 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 text-foreground">{contactData.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{contactData.description}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-muted/20 rounded-2xl p-6">
            <h3 className="font-medium text-xl mb-6 text-foreground">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium mb-2 text-foreground">
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full h-10 px-4 rounded-md border-0 bg-background text-foreground text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium mb-2 text-foreground">
                    Email *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full h-10 px-4 rounded-md border-0 bg-background text-foreground text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium mb-2 text-foreground">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  className="w-full h-10 px-4 rounded-md border-0 bg-background text-foreground text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium mb-2 text-foreground">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell me about your project or questions..."
                  className="w-full px-4 py-3 rounded-md border-0 bg-background text-foreground text-sm resize-y"
                />
              </div>
              {status.message && (
                <p className={status.type === 'success' ? 'text-green-600 text-sm' : 'text-destructive text-sm'}>
                  {status.message}
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full inline-flex items-center justify-center h-11 px-8 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-5 w-5 mr-2" />
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-muted/20 rounded-2xl p-6">
              <h3 className="font-medium text-xl mb-6 text-foreground">Contact Information</h3>
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{info.label}</p>
                      <p className="text-muted-foreground">
                        {info.label === 'Website' ? (
                          <a href={info.value} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                            {info.value}
                          </a>
                        ) : (
                          info.value
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted/20 rounded-2xl p-6">
              <h3 className="font-medium text-xl mb-6 text-foreground">Follow My Journey</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Stay updated with my latest creations and behind-the-scenes glimpses.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 bg-background rounded-full flex items-center justify-center text-muted-foreground transition-colors ${social.color}`}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-6">
              <h3 className="font-medium mb-3 text-foreground">Custom Commissions</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Interested in a custom piece? I love creating personalized artworks. Commission pieces typically take
                4–8 weeks depending on size and complexity.
              </p>
              <a href="#contact" className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted">
                Learn More About Commissions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

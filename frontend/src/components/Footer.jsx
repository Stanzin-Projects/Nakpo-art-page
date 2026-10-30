import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PushpinTearFooter from './PushpinTearFooter';

const EMAIL = 'artist@artbylopsang.com';

/**
 * Site footer: the pushpin tear footer, branded for ARTBYLOPSANG.
 * Section links (#gallery, #about, #contact) scroll on the home page and
 * route back to it from other pages; internal paths go through the router.
 */
export function Footer({ siteName = 'ARTBYLOPSANG', tagline }) {
  const navigate = useNavigate();
  const { openTracking } = useCart();

  const onLinkClick = (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');

    if (href === '#track') {
      e.preventDefault();
      openTracking();
      return;
    }
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      if (window.location.pathname !== '/') {
        navigate('/', { state: { scrollTo: id } });
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (href && href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <div onClickCapture={onLinkClick}>
      <PushpinTearFooter
        brand="lopsang."
        name={siteName}
        logoHref="/"
        sheet="#0a0a0a"
        paper="#f4f1ea"
        sheetInk="#ffffff"
        paperInk="#0a0a0a"
        seed={12}
        email={EMAIL}
        newsletter={{ label: 'new works, once a month', placeholder: 'your@email' }}
        status={{ label: 'commissions open' }}
        mark="ed. 2026"
        timeZone="Asia/Kathmandu"
        timeLabel="NPT"
        socials={[
          { icon: 'ig', label: 'Instagram', href: '#' },
          { icon: 'x', label: 'X', href: '#' },
        ]}
        columns={[
          {
            title: 'index',
            links: [
              { label: 'Gallery', href: '#gallery' },
              { label: 'About', href: '#about' },
              { label: 'Contact', href: '#contact' },
            ],
            cta: { label: 'browse.', href: '#gallery' },
          },
          {
            title: 'shop',
            links: [
              { label: 'Track Order', href: '#track' },
              { label: 'Wishlist', href: '/wishlist' },
              { label: 'My Account', href: '/account' },
            ],
            cta: { label: 'talk.', href: 'mailto:' + EMAIL },
          },
        ]}
        sideLinks={[
          { icon: 'globe', label: 'shipping', href: '#' },
          { icon: 'doc', label: 'terms', href: '#' },
        ]}
        chat={{ label: 'say hi' }}
        copyright={'© ' + new Date().getFullYear() + ' ' + siteName}
        credit={tagline ? 'original art & prints' : undefined}
        handle={{ label: '@artbylopsang', href: '#' }}
      />
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center border border-border rounded-lg p-8 bg-background">
        <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-medium mb-2">Registration is Closed</h1>
        <p className="text-muted-foreground text-sm mb-6">
          This site is a shopfront — guests can browse the gallery, select artworks and order
          directly without an account. Sign-in is reserved for the admin only.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex items-center justify-center"
          >
            Browse the Gallery
          </Link>
          <Link
            to="/login"
            className="block w-full h-11 rounded-md border border-border font-medium flex items-center justify-center"
          >
            Admin Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

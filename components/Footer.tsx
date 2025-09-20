
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-slate-400">
        <p className="mb-2">&copy; {new Date().getFullYear()} AI Face Swap Studio. All rights reserved.</p>
        <div className="flex justify-center gap-6 text-sm">
          <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
        </div>
        <p className="text-xs mt-4 text-slate-500">
          Disclaimer: All uploaded images are automatically deleted from our servers within 24 hours to protect your privacy.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

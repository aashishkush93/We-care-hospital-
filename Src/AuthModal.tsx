import React from 'react';
import { X } from 'lucide-react';
import { AuthGate } from './AuthGate';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      id="auth-modal-overlay"
    >
      <div
        className="relative max-w-5xl w-full max-h-[95vh] overflow-y-auto"
        id="auth-modal-content"
      >
        {/* Close Button on top-right */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-white rounded-full transition-colors cursor-pointer shadow-md"
          id="close-auth-modal-btn"
          aria-label="Close Authentication Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <AuthGate isModal={true} onDismiss={closeAuthModal} />
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (username.trim() === 'admin' && password === 'admin123') {
      setIsLoading(true);
      playButtonTap();
      setTimeout(() => {
        setIsLoading(false);
        playSuccessChime();
        onSuccessLogin();
        onClose();
      }, 500);
    } else {
      setErrorMessage('Неверный логин или пароль администратора (по умолчанию: admin / admin123)');
    }
  };

  const handleFillDemoCreds = () => {
    playButtonTap();
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-4 flex justify-center items-center">
      <div className="relative w-full max-w-md bg-[#091511] border-2 border-[#d4af37]/50 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-200 space-y-5 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/90 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-inner">
              <ShieldCheck className="w-6 h-6 text-[#fef08a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                  СЛУЖБА БЕЗОПАСНОСТИ
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display mt-0.5">
                Вход для Администратора
              </h2>
            </div>
          </div>

          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Demo Credentials Info Box */}
        <div className="bg-[#051711] border border-[#d4af37]/30 p-3.5 rounded-2xl text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#fef08a] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Данные для входа (по умолчанию):</span>
            </span>
            <button
              type="button"
              onClick={handleFillDemoCreds}
              className="text-[11px] text-[#d4af37] hover:underline font-semibold cursor-pointer"
            >
              Вставить в 1 клик
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#030d0a] p-2 rounded-xl border border-slate-800">
            <div>Логин: <strong className="text-emerald-400">admin</strong></div>
            <div>Пароль: <strong className="text-emerald-400">admin123</strong></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Логин администратора:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 rounded-xl text-sm text-white font-mono focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Пароль:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 rounded-xl text-sm text-white font-mono focus:outline-none"
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Авторизация...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Войти в Панель Администратора</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Отмена и вернуться
          </button>
        </div>

      </div>
    </div>
  );
};

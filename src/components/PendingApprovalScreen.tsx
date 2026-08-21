import React, { useState } from 'react';
import { 
  Hourglass, 
  Clock, 
  UserCheck, 
  RefreshCw, 
  LogOut, 
  Scale
} from 'lucide-react';
import { UserProfile } from '../types';
import { playButtonTap } from '../utils/audio';

interface PendingApprovalScreenProps {
  user: UserProfile;
  onRefreshStatus: () => void;
  onLogout: () => void;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({
  user,
  onRefreshStatus,
  onLogout,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState('Только что');

  const handleManualCheck = () => {
    setIsChecking(true);
    playButtonTap();
    setTimeout(() => {
      onRefreshStatus();
      setIsChecking(false);
      setLastCheckedTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-[#081712] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-amber-950/20 text-slate-200 space-y-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>СТАТУС: НА РАССМОТРЕНИИ (PENDING)</span>
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ID заявки: #{user.id.replace('user_', '')}
          </span>
        </div>

        {/* Big Sandglass Animation & Headline */}
        <div className="text-center space-y-4 py-2">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-950/80 via-[#1a1408] to-emerald-950/80 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 shadow-2xl shadow-amber-900/40">
              <Hourglass className="w-12 h-12 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-amber-500 text-black font-extrabold text-[11px] shadow-md">
              ⏳ 1–3 ч
            </div>
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Заявка на рассмотрении у администратора
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Ожидайте подтверждения модератором (обычно 1–3 часа). Доступ к созданию котлов, участию в сборах и жеребьевкам откроется автоматически после проверки номера и поручителя.
            </p>
          </div>
        </div>

        {/* User Application Details Summary Card */}
        <div className="bg-[#05110d] border border-[#d4af37]/30 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="text-[#fef08a] font-bold flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Данные вашей заявки:</span>
            </span>
            <span className="text-emerald-400 font-semibold">{user.registeredAt || 'Сегодня'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#030a08] p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">ФИО заявителя:</span>
              <strong className="text-white text-sm">{user.fullName}</strong>
            </div>

            <div className="bg-[#030a08] p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Основной телефон:</span>
              <strong className="text-emerald-400 text-sm font-mono">{user.phone}</strong>
            </div>

            <div className="bg-[#030a08] p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Резервный номер (Поручитель):</span>
              <strong className="text-[#fef08a] text-sm font-mono">{user.guarantorPhone}</strong>
            </div>

            <div className="bg-[#030a08] p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Кем приходится (Связь):</span>
              <strong className="text-slate-200 text-sm">{user.guarantorRelation || 'Брат'} {user.guarantorName ? `(${user.guarantorName})` : ''}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200">
            <Scale className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Служба безопасности Вай Котел сверяет номер поручителя и проверяет отсутствие задолженностей в базе.</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="w-full py-3.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#f59e0b] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Сверка с базой данных...' : 'Проверить статус одобрения'}</span>
          </button>
        </div>

        {/* Footer / Switch user */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Последняя проверка: {lastCheckedTime}</span>
          <button
            type="button"
            onClick={() => {
              playButtonTap();
              onLogout();
            }}
            className="text-slate-300 hover:text-white underline decoration-dotted flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти из аккаунта</span>
          </button>
        </div>

      </div>
    </div>
  );
};

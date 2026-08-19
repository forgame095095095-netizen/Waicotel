import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Play, RotateCcw, Award, CheckCircle2, UserCheck, Shield, Shuffle, ArrowRight } from 'lucide-react';
import { Kotel, KotelMember } from '../types';
import { playTickSound, playSuccessChime, playFanfare, playButtonTap } from '../utils/audio';

interface BarabanWheelProps {
  kotels: Kotel[];
  selectedKotelId: string;
  onSelectKotel: (id: string) => void;
  onApplyDrawResults: (kotelId: string, updatedMembers: KotelMember[]) => void;
  onOpenKotelDetail: (kotelId: string) => void;
}

export const BarabanWheel: React.FC<BarabanWheelProps> = ({
  kotels,
  selectedKotelId,
  onSelectKotel,
  onApplyDrawResults,
  onOpenKotelDetail,
}) => {
  const currentKotel = kotels.find((k) => k.id === selectedKotelId) || kotels[0];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Wheel state
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [drawnResults, setDrawnResults] = useState<{ memberId: string; name: string; drawNumber: number }[]>([]);
  const [remainingMembers, setRemainingMembers] = useState<KotelMember[]>([]);
  const [currentDrawnWinner, setCurrentDrawnWinner] = useState<{ member: KotelMember; drawNumber: number } | null>(null);
  const [isDrawComplete, setIsDrawComplete] = useState(false);

  // Initialize remaining members on Kotel change
  useEffect(() => {
    if (!currentKotel) return;

    // Check if kotel already has drawn members
    const alreadyDrawn = currentKotel.members
      .filter((m) => m.drawNumber !== null)
      .map((m) => ({ memberId: m.id, name: m.name, drawNumber: m.drawNumber! }))
      .sort((a, b) => a.drawNumber - b.drawNumber);

    setDrawnResults(alreadyDrawn);

    const undrawn = currentKotel.members.filter((m) => m.drawNumber === null);
    setRemainingMembers(undrawn.length > 0 ? undrawn : currentKotel.members);
    setIsDrawComplete(currentKotel.drawCompleted && undrawn.length === 0);
    setCurrentDrawnWinner(null);
  }, [currentKotel]);

  // Render Wheel on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 18;

    ctx.clearRect(0, 0, size, size);

    const pool = remainingMembers.length > 0 ? remainingMembers : currentKotel?.members || [];
    const numSlices = pool.length;
    if (numSlices === 0) return;

    const sliceAngle = (2 * Math.PI) / numSlices;

    // Draw outer golden ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a1a14';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d4af37';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // Draw golden rim dots
    const totalDots = 24;
    for (let i = 0; i < totalDots; i++) {
      const dotAngle = (i * 2 * Math.PI) / totalDots;
      const dotX = center + (radius + 6) * Math.cos(dotAngle);
      const dotY = center + (radius + 6) * Math.sin(dotAngle);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#d4af37';
      ctx.fill();
    }

    // Draw Slices
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotationAngle);

    pool.forEach((member, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice colors (alternate dark emerald & deep teal with gold borders)
      const colors = ['#063d2e', '#0b261e', '#0f4837', '#081e18', '#0c382b'];
      const sliceColor = colors[index % colors.length];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sliceColor;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.stroke();

      // Text inside slice
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;

      // Truncate name if long
      const displayName = member.name.replace(' (Вы)', '');
      const shortName = displayName.length > 14 ? displayName.substring(0, 13) + '…' : displayName;
      ctx.fillText(shortName, radius - 28, 0);

      // Draw mini dot near edge
      ctx.beginPath();
      ctx.arc(radius - 12, 0, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#d4af37';
      ctx.fill();

      ctx.restore();
    });

    // Draw Center Boss / Hub
    ctx.restore();

    // Center Gold Shield
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, 36, 0, 2 * Math.PI);
    ctx.fillStyle = '#061711';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d4af37';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Inner Emblem
    ctx.beginPath();
    ctx.arc(center, center, 26, 0, 2 * Math.PI);
    ctx.fillStyle = '#10392d';
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px "Cinzel", serif';
    ctx.fillText('VK', center, center);
    ctx.restore();

  }, [rotationAngle, remainingMembers, currentKotel]);

  // Spin Wheel Mechanism with Physics & Audio ticks
  const spinWheelForNextNumber = () => {
    if (isSpinning || remainingMembers.length === 0 || isDrawComplete) return;

    playButtonTap();
    setIsSpinning(true);
    setCurrentDrawnWinner(null);

    const pool = [...remainingMembers];
    const numSlices = pool.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Pick random winner from remaining
    const winnerIndex = Math.floor(Math.random() * numSlices);
    const winner = pool[winnerIndex];
    const nextDrawNumber = drawnResults.length + 1;

    // Target rotation to stop at needle (top / -90 deg = 3*PI/2)
    // Needle is at -Math.PI / 2 (top)
    const targetSliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = (3 * Math.PI / 2) - targetSliceCenter;

    // Add 4 to 7 full extra rotations for excitement
    const extraRotations = (5 + Math.floor(Math.random() * 3)) * (2 * Math.PI);
    const startAngle = rotationAngle % (2 * Math.PI);
    const finalAngle = startAngle + extraRotations + ((targetAngle - (startAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));

    const duration = 4000; // 4 seconds
    const startTime = performance.now();
    let lastTickAngle = startAngle;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + (finalAngle - startAngle) * easeOut;

      setRotationAngle(currentAngle);

      // Trigger audio tick as slices cross needle
      if (Math.abs(currentAngle - lastTickAngle) >= sliceAngle * 0.7) {
        playTickSound(800 + Math.random() * 200);
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Spin finished!
        setIsSpinning(false);
        playSuccessChime();

        // Update drawn list
        const newDrawnList = [
          ...drawnResults,
          { memberId: winner.id, name: winner.name, drawNumber: nextDrawNumber },
        ];
        setDrawnResults(newDrawnList);

        const newRemaining = remainingMembers.filter((m) => m.id !== winner.id);
        setRemainingMembers(newRemaining);

        setCurrentDrawnWinner({ member: winner, drawNumber: nextDrawNumber });

        // Trigger confetti for single win
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#fef08a', '#10b981', '#064e3b'],
        });

        if (newRemaining.length === 0) {
          setIsDrawComplete(true);
          playFanfare();
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.5 },
              colors: ['#d4af37', '#fef08a', '#34d399', '#ffffff'],
            });
          }, 400);
        }
      }
    };

    requestAnimationFrame(animateSpin);
  };

  // Auto-run full sequential draw
  const handleAutoFullDraw = () => {
    if (isSpinning || isDrawComplete) return;

    playButtonTap();
    setIsSpinning(true);

    // Shuffle remaining members randomly
    const pool = [...remainingMembers];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    const newResults = [...drawnResults];
    shuffled.forEach((member, idx) => {
      newResults.push({
        memberId: member.id,
        name: member.name,
        drawNumber: drawnResults.length + idx + 1,
      });
    });

    let step = 0;
    const interval = setInterval(() => {
      playTickSound(900);
      step++;
      setRotationAngle((prev) => prev + 0.8);

      if (step > 15) {
        clearInterval(interval);
        setDrawnResults(newResults);
        setRemainingMembers([]);
        setIsDrawComplete(true);
        setIsSpinning(false);
        playFanfare();

        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#d4af37', '#fef08a', '#34d399', '#ffffff'],
        });
      }
    }, 100);
  };

  // Reset Draw
  const handleResetDraw = () => {
    playButtonTap();
    setDrawnResults([]);
    setRemainingMembers(currentKotel ? currentKotel.members : []);
    setIsDrawComplete(false);
    setCurrentDrawnWinner(null);
  };

  // Apply Results to Kotel
  const handleSaveToKotel = () => {
    if (!currentKotel) return;
    playButtonTap();

    const updatedMembers = currentKotel.members.map((m) => {
      const drawn = drawnResults.find((d) => d.memberId === m.id);
      return {
        ...m,
        drawNumber: drawn ? drawn.drawNumber : m.drawNumber,
      };
    });

    onApplyDrawResults(currentKotel.id, updatedMembers);
    onOpenKotelDetail(currentKotel.id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner / Selection */}
      <div className="bg-[#0b1f19] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                Честная жеребьевка (Барабан)
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                Шариатский стандарт открытого распределения
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Барабан жеребьевки очереди
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Случайное беспристрастное распределение очередности получения пула выплат между всеми участниками котла в прямом эфире.
            </p>
          </div>

          {/* Kotel Selector Dropdown */}
          <div className="bg-[#07130f] p-2 rounded-xl border border-slate-700/80 shrink-0">
            <label className="block text-[11px] text-slate-400 mb-1 px-1 font-medium">
              Выберите активный котел:
            </label>
            <select
              value={selectedKotelId}
              onChange={(e) => onSelectKotel(e.target.value)}
              className="bg-[#0c241d] text-white text-xs font-semibold px-3 py-2 rounded-lg border border-[#d4af37]/30 outline-none cursor-pointer"
            >
              {kotels.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.title} ({k.totalMembers} уч. • {(k.totalPool).toLocaleString('ru-RU')} ₽)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Wheel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Wheel Canvas & Controls (7 cols) */}
        <div className="lg:col-span-7 bg-[#091511] border border-[#d4af37]/25 rounded-2xl p-6 flex flex-col items-center justify-between shadow-2xl relative">
          
          {/* Wheel Status Bar */}
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-bold text-slate-200">
                Котел: <span className="text-[#fef08a]">{currentKotel?.title}</span>
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Разыграно: <strong className="text-emerald-400">{drawnResults.length}</strong> из {currentKotel?.totalMembers || 12}
            </div>
          </div>

          {/* Wheel Container with Gold Pointer */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Top Indicator Needle */}
            <div className="absolute -top-3 z-30 flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              <div className="w-6 h-8 bg-gradient-to-b from-[#fef08a] to-[#d4af37] [clip-path:polygon(50%_100%,0_0,100%_0)] border-t border-white"></div>
              <div className="w-3 h-3 bg-red-600 rounded-full -mt-7 border border-white shadow-md"></div>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="max-w-full w-[340px] sm:w-[380px] h-auto rounded-full cursor-pointer select-none"
              onClick={spinWheelForNextNumber}
            />
          </div>

          {/* Winner Flash Announcement */}
          {currentDrawnWinner && !isDrawComplete && (
            <div className="w-full bg-[#0d2a20] border border-[#d4af37]/40 rounded-xl p-3.5 text-center my-2 animate-bounce">
              <span className="text-xs text-emerald-300 font-medium">🎉 Вытянут номер #{currentDrawnWinner.drawNumber}:</span>
              <div className="text-base font-bold text-[#fef08a]">
                {currentDrawnWinner.member.name}
              </div>
              <p className="text-[11px] text-slate-300">
                Получает общий фонд {(currentKotel.totalPool).toLocaleString('ru-RU')} ₽ в {currentDrawnWinner.drawNumber}-м месяце
              </p>
            </div>
          )}

          {isDrawComplete && (
            <div className="w-full bg-gradient-to-r from-[#063325] via-[#0e4836] to-[#063325] border-2 border-[#d4af37] rounded-xl p-4 text-center my-2 shadow-xl shadow-[#d4af37]/15">
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#fef08a]">
                <Award className="w-5 h-5 text-[#d4af37]" />
                Жеребьевка успешно завершена!
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                Все {currentKotel.totalMembers} номеров распределены. Нажмите «Применить результаты к котлу» для фиксации графика.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={spinWheelForNextNumber}
              disabled={isSpinning || isDrawComplete || remainingMembers.length === 0}
              className="flex-1 min-w-[160px] py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold text-xs sm:text-sm hover:opacity-95 disabled:opacity-40 shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{isSpinning ? 'Барабан крутится...' : `Крутить для №${drawnResults.length + 1}`}</span>
            </button>

            <button
              onClick={handleAutoFullDraw}
              disabled={isSpinning || isDrawComplete}
              className="py-3.5 px-4 rounded-xl bg-[#0e2a22] border border-emerald-500/40 text-emerald-200 hover:bg-[#12382e] disabled:opacity-40 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-[#d4af37]" />
              <span>Авто-жеребьевка всех</span>
            </button>

            <button
              onClick={handleResetDraw}
              disabled={isSpinning || drawnResults.length === 0}
              title="Сбросить результаты"
              className="py-3.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Save to Kotel Button */}
          {drawnResults.length > 0 && (
            <button
              onClick={handleSaveToKotel}
              className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Применить результаты к графику котла</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* Right Column: Live Assigned Queue Table (5 cols) */}
        <div className="lg:col-span-5 bg-[#091511] border border-[#d4af37]/25 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#d4af37]" />
                  Очередность выплат
                </h3>
                <p className="text-[11px] text-slate-400">
                  Порядок получения фонда {(currentKotel?.totalPool || 0).toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono-nums">
                {drawnResults.length}/{currentKotel?.totalMembers || 12}
              </span>
            </div>

            {/* Results List */}
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {drawnResults.map((item) => {
                const member = currentKotel?.members.find((m) => m.id === item.memberId);
                const isFirst = item.drawNumber === 1;

                return (
                  <div
                    key={item.memberId}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isFirst
                        ? 'bg-[#103326] border-[#d4af37]/50 shadow-md shadow-[#d4af37]/10'
                        : 'bg-[#061410] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Position Badge */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono-nums font-bold text-xs ${
                        isFirst
                          ? 'bg-[#d4af37] text-black shadow-sm'
                          : 'bg-emerald-950 border border-emerald-500/30 text-emerald-300'
                      }`}>
                        #{item.drawNumber}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {member?.isCurrentUser && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                              Вы
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {member?.city || 'г. Грозный'} • Рейтинг: <strong className="text-emerald-400">{member?.amanaScore || 120}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono-nums text-[#fef08a]">
                        {(currentKotel?.totalPool || 0).toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-[10px] text-emerald-400 font-medium">
                        Месяц {item.drawNumber}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Undrawn Placeholders */}
              {remainingMembers.map((member, idx) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#06120e]/60 border border-dashed border-slate-800 text-slate-500 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-600 font-mono-nums">
                      ?
                    </div>
                    <span className="text-xs text-slate-400">{member.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 italic">Ожидает барабан</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sharia Guarantee Notice */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 bg-[#061510] p-2.5 rounded-xl">
            <Shield className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <span>
              Жеребьевка проводится строго по принципу прозрачности. Все участники получают равную сумму без скрытых удержаний (0% комиссии).
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

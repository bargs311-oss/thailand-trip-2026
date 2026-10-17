import React, { useState } from 'react';
import { ItineraryItem } from '../types';
import { X, ExternalLink, Copy, Check, Ticket, AlertCircle, FileText, Download, Image as ImageIcon } from 'lucide-react';
import { getDocumentType } from '../lib/storage';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItineraryItem | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const docType = getDocumentType(item.ticket_url);

  const handleCopy = () => {
    if (item.ticket_info) {
      navigator.clipboard.writeText(item.ticket_info);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90vh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white truncate">שובר וכרטיס כניסה</h3>
              <p className="text-[11px] text-slate-400 truncate">{item.time_slot}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition shrink-0"
            title="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 flex-1 touch-scroll">
          {/* Attraction Title */}
          <div className="text-center">
            <h4 className="text-lg font-black text-white">{item.title}</h4>
            {item.title_ja && (
              <p className="text-xs text-slate-400 font-japanese mt-0.5">{item.title_ja}</p>
            )}
            <p className="text-xs text-japan-sakura font-medium mt-1">{item.location_name}</p>
          </div>

          {/* 1. Direct Image Preview if uploaded file is an image */}
          {docType === 'image' && item.ticket_url && (
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-700/80 flex flex-col items-center justify-center shadow-lg">
              <div className="relative w-full max-h-64 flex items-center justify-center overflow-hidden rounded-xl bg-slate-900">
                <img
                  src={item.ticket_url}
                  alt={item.title}
                  className="max-h-64 object-contain rounded-xl w-auto"
                />
              </div>
              <a
                href={item.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                download={`${item.title}-ticket`}
                className="mt-2.5 text-xs text-japan-sakura hover:text-white font-bold flex items-center gap-1.5 transition"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>פתח תמונת כרטיס מלאה / הורד</span>
              </a>
            </div>
          )}

          {/* 2. Prominent PDF Ticket Button if uploaded file is a PDF */}
          {docType === 'pdf' && item.ticket_url && (
            <div className="p-4 bg-gradient-to-r from-red-950/50 via-slate-900 to-rose-950/40 border border-red-800/50 rounded-2xl text-center space-y-3 shadow-lg">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">כרטיס כניסה / שובר PDF</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">מסמך דיגיטלי מאומת מוכן להצגה בכניסה</p>
              </div>
              <a
                href={item.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                download={`${item.title}-ticket.pdf`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-japan-red to-rose-600 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950/50 hover:brightness-110 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>פתח / הורד כרטיס PDF (Open Ticket)</span>
              </a>
            </div>
          )}

          {/* 3. Simulated QR Code / Barcode Card (for quick offline scanning or verification) */}
          <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center text-black shadow-inner border border-neutral-300">
            <div className="w-40 h-40 bg-neutral-100 rounded-xl p-2 border-2 border-dashed border-neutral-400 flex flex-col items-center justify-center relative">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-2">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35 || i === 14 || i === 21
                        ? 'bg-black'
                        : i % 5 === 0
                        ? 'bg-black'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 py-1 text-[10px] font-black rounded border border-neutral-400 uppercase tracking-widest">
                  PASS
                </span>
              </div>
            </div>

            <p className="text-[11px] font-mono font-bold text-neutral-600 mt-2">
              JAPAN-PASS-DIGITAL-VERIFIED
            </p>
          </div>

          {/* Ticket Information & Codes */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">פרטי הזמנה וקוד:</span>
              <button
                onClick={handleCopy}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'הועתק!' : 'העתק קוד'}</span>
              </button>
            </div>
            <p className="text-sm font-mono font-bold text-slate-100 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 break-words">
              {item.ticket_info || 'אין מידע נוסף על הכרטיס'}
            </p>
          </div>

          {/* Tips / Entry notes */}
          {item.notes && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>{item.notes}</p>
            </div>
          )}

          {/* External Link or Action if it's a web URL */}
          {docType === 'link' && item.ticket_url && (
            <a
              href={item.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-japan-red to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-95 transition active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>פתח קישור מקורי לכרטיס</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

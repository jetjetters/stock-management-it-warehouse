'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { useCustomization } from '@/components/providers/customization-provider';

type HandoverPrintClientProps = {
  handover: {
    id: string;
    documentNo: string;
    locationName: string;
    giverName: string;
    recipientName: string;
    remarks: string | null;
    handoverDate: Date | string;
    items: Array<{
      id: string;
      deviceName: string;
      serialNo: string;
      brandName: string;
      recipient: string;
      remarks: string | null;
    }>;
  };
};

export function HandoverPrintClient({ handover }: HandoverPrintClientProps) {
  const { config } = useCustomization();
  const formattedDate = new Date(handover.handoverDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    // Optional automatic print trigger could be placed here if desired
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 print:bg-white print:p-0">
      {/* Top Action Bar - Hidden during Printing */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/handovers/${handover.id}`}
          className="inline-flex items-center space-x-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all transform active:scale-95 cursor-pointer"
          style={{ backgroundColor: config.primaryColor }}
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen Sekarang</span>
        </button>
      </div>

      {/* Printable Paper Document Container */}
      <div className="print-clean-container max-w-4xl mx-auto bg-white text-black p-8 sm:p-12 shadow-2xl rounded-xl print:shadow-none print:p-0 print:max-w-none print:rounded-none">
        {/* Document Header with Perfectly Centered Title */}
        <div className="relative flex items-center justify-center border-b-2 border-black pb-3 mb-4">
          <div className="text-center">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-black uppercase">
              {config.handoverTitle || 'Form Serah Terima Barang IT'}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5">
              {handover.locationName || config.handoverLocation || 'PTK Shore Base Tanjung Batu'}
            </p>
          </div>

          {/* Header Logo */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.handoverLogo || '/pertamina-pl.png'}
              alt="Logo Serah Terima"
              className="h-9 sm:h-11 w-auto object-contain mix-blend-multiply max-w-[140px]"
            />
          </div>
        </div>

        {/* Handover Data Table */}
        <div className="mb-6 print:mb-4">
          <table className="w-full border-collapse border border-black text-center text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-bold uppercase text-black text-center">
                <th className="border border-black px-3 py-1.5 text-center w-12">NO</th>
                <th className="border border-black px-3 py-1.5 text-center">Nama Perangkat</th>
                <th className="border border-black px-3 py-1.5 text-center font-mono">SN</th>
                <th className="border border-black px-3 py-1.5 text-center">Merk</th>
                <th className="border border-black px-3 py-1.5 text-center">PIC</th>
                <th className="border border-black px-3 py-1.5 text-center">Remarks</th>
                <th className="border border-black px-3 py-1.5 text-center w-24">Sign</th>
              </tr>
            </thead>
            <tbody>
              {handover.items.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-black text-black text-center">
                  <td className="border border-black px-3 py-2 text-center font-semibold">
                    {idx + 1}
                  </td>
                  <td className="border border-black px-3 py-2 text-center font-semibold">
                    {item.deviceName}
                  </td>
                  <td className="border border-black px-3 py-2 text-center font-mono font-bold">
                    {item.serialNo}
                  </td>
                  <td className="border border-black px-3 py-2 text-center">{item.brandName}</td>
                  <td className="border border-black px-3 py-2 text-center font-semibold">
                    {item.recipient || handover.recipientName}
                  </td>
                  <td className="border border-black px-3 py-2 text-center">
                    {item.remarks || handover.remarks || '-'}
                  </td>
                  <td className="border border-black px-3 py-2 text-center text-gray-300 font-mono text-[10px]">
                    [ Tanda Tangan ]
                  </td>
                </tr>
              ))}

              {/* Empty placeholder rows if item count is less than 3 for spacious visual */}
              {Array.from({ length: Math.max(0, 3 - handover.items.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="border-b border-black text-black text-center">
                  <td className="border border-black px-3 py-2 text-center text-gray-400">
                    {handover.items.length + idx + 1}
                  </td>
                  <td className="border border-black px-3 py-2 text-center"></td>
                  <td className="border border-black px-3 py-2 text-center"></td>
                  <td className="border border-black px-3 py-2 text-center"></td>
                  <td className="border border-black px-3 py-2 text-center"></td>
                  <td className="border border-black px-3 py-2 text-center"></td>
                  <td className="border border-black px-3 py-2 text-center"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Signature Section matching scanned reference */}
        <div className="flex justify-end pt-2">
          <div className="text-center space-y-1 w-72">
            <p className="text-xs font-semibold text-black">
              Tanjung Batu, {formattedDate}
            </p>
            <p className="text-xs font-bold text-black border-b border-gray-400 pb-1">
              Diberikan Oleh,
            </p>

            {/* Signature Box Placeholder */}
            <div className="h-16 print:h-14 flex items-center justify-center text-gray-300 font-mono text-xs italic">
              ( Tanda Tangan / Paraf )
            </div>

            <p className="text-xs font-bold text-black tracking-wide underline">
              ({handover.giverName})
            </p>
          </div>
        </div>
      </div>

      {/* Print Specific CSS Styles */}
      <style jsx global>{`
        @page {
          size: landscape;
          margin: 0mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            width: 100% !important;
            height: auto !important;
          }
          aside, nav, header {
            display: none !important;
          }
          .print-clean-container {
            padding: 10mm 15mm !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}

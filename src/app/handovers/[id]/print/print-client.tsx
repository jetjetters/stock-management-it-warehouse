'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

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
  const formattedDate = new Date(handover.handoverDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    // Optionally auto-trigger print dialog
    const timer = setTimeout(() => {
      // window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 print:p-0 print:bg-white print:text-black">
      {/* Top Action Bar - Hidden in Print */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/handovers"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Kembali ke Daftar Surat</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak PDF / Print Dokumen</span>
        </button>
      </div>

      {/* Printable Paper Document Container */}
      <div className="max-w-4xl mx-auto bg-white text-black p-8 sm:p-12 shadow-2xl rounded-xl print:shadow-none print:p-0 print:max-w-none">
        {/* Document Header with Perfectly Centered Title */}
        <div className="relative flex items-center justify-center border-b-2 border-black pb-4 mb-6">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-black uppercase">
              Form Serah Terima Barang IT
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5">
              {handover.locationName || 'PTK Shore Base Tanjung Batu'}
            </p>
          </div>

          {/* PERTAMINA Header Logo */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pertamina-pl.jpeg"
              alt="PERTAMINA"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
        </div>

        {/* Handover Data Table */}
        <div className="mb-10">
          <table className="w-full border-collapse border border-black text-center text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-bold uppercase text-black text-center">
                <th className="border border-black px-3 py-2 text-center w-12">NO</th>
                <th className="border border-black px-3 py-2 text-center">Nama Perangkat</th>
                <th className="border border-black px-3 py-2 text-center font-mono">SN</th>
                <th className="border border-black px-3 py-2 text-center">Merk</th>
                <th className="border border-black px-3 py-2 text-center">PIC</th>
                <th className="border border-black px-3 py-2 text-center">Remarks</th>
                <th className="border border-black px-3 py-2 text-center w-24">Sign</th>
              </tr>
            </thead>
            <tbody>
              {handover.items.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-black text-black text-center">
                  <td className="border border-black px-3 py-2.5 text-center font-semibold">
                    {idx + 1}
                  </td>
                  <td className="border border-black px-3 py-2.5 text-center font-semibold">
                    {item.deviceName}
                  </td>
                  <td className="border border-black px-3 py-2.5 text-center font-mono font-bold">
                    {item.serialNo}
                  </td>
                  <td className="border border-black px-3 py-2.5 text-center">{item.brandName}</td>
                  <td className="border border-black px-3 py-2.5 text-center font-semibold">
                    {item.recipient || handover.recipientName}
                  </td>
                  <td className="border border-black px-3 py-2.5 text-center">
                    {item.remarks || handover.remarks || '-'}
                  </td>
                  <td className="border border-black px-3 py-2.5 text-center text-gray-300 font-mono text-[10px]">
                    [ Tanda Tangan ]
                  </td>
                </tr>
              ))}

              {/* Empty placeholder rows if item count is less than 3 for spacious visual */}
              {Array.from({ length: Math.max(0, 3 - handover.items.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="border-b border-black text-black text-center">
                  <td className="border border-black px-3 py-3 text-center text-gray-400">
                    {handover.items.length + idx + 1}
                  </td>
                  <td className="border border-black px-3 py-3 text-center"></td>
                  <td className="border border-black px-3 py-3 text-center"></td>
                  <td className="border border-black px-3 py-3 text-center"></td>
                  <td className="border border-black px-3 py-3 text-center"></td>
                  <td className="border border-black px-3 py-3 text-center"></td>
                  <td className="border border-black px-3 py-3 text-center"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Signature Section matching scanned reference */}
        <div className="flex justify-end pt-4">
          <div className="text-center space-y-1 w-72">
            <p className="text-xs font-semibold text-black">
              Tanjung Batu, {formattedDate}
            </p>
            <p className="text-xs font-bold text-black border-b border-gray-400 pb-1">
              Diberikan Oleh,
            </p>

            {/* Signature Box Placeholder */}
            <div className="h-20 flex items-center justify-center text-gray-300 font-mono text-xs italic">
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
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          aside, nav, header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

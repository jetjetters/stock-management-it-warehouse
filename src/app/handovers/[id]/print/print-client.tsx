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
        {/* Document Header matching physical scanned format */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-black">
              Form Serah Terima Barang IT
            </h1>
            <p className="text-sm font-bold text-gray-900 mt-1">
              {handover.locationName || 'PTK Shore Base Tanjung Batu'}
            </p>
          </div>

          {/* PERTAMINA TRANS KONTINENTAL Header Logo */}
          <div className="flex flex-col items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="PERTAMINA TRANS KONTINENTAL"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>
        </div>

        {/* Handover Data Table */}
        <div className="mb-10">
          <table className="w-full border-collapse border border-black text-left text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-bold uppercase text-black">
                <th className="border border-black px-3 py-2 text-center w-12">NO</th>
                <th className="border border-black px-3 py-2">Nama Perangkat</th>
                <th className="border border-black px-3 py-2 font-mono">SN</th>
                <th className="border border-black px-3 py-2">Merk</th>
                <th className="border border-black px-3 py-2">PIC</th>
                <th className="border border-black px-3 py-2">Remarks</th>
                <th className="border border-black px-3 py-2 text-center w-24">Sign</th>
              </tr>
            </thead>
            <tbody>
              {handover.items.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-black text-black">
                  <td className="border border-black px-3 py-2.5 text-center font-semibold">
                    {idx + 1}
                  </td>
                  <td className="border border-black px-3 py-2.5 font-semibold">
                    {item.deviceName}
                  </td>
                  <td className="border border-black px-3 py-2.5 font-mono font-bold">
                    {item.serialNo}
                  </td>
                  <td className="border border-black px-3 py-2.5">{item.brandName}</td>
                  <td className="border border-black px-3 py-2.5 font-semibold">
                    {item.recipient || handover.recipientName}
                  </td>
                  <td className="border border-black px-3 py-2.5">
                    {item.remarks || handover.remarks || '-'}
                  </td>
                  <td className="border border-black px-3 py-2.5 text-center text-gray-300 font-mono text-[10px]">
                    [ Tanda Tangan ]
                  </td>
                </tr>
              ))}

              {/* Empty placeholder rows if item count is less than 3 for spacious visual */}
              {Array.from({ length: Math.max(0, 3 - handover.items.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="border-b border-black text-black">
                  <td className="border border-black px-3 py-3 text-center text-gray-400">
                    {handover.items.length + idx + 1}
                  </td>
                  <td className="border border-black px-3 py-3"></td>
                  <td className="border border-black px-3 py-3"></td>
                  <td className="border border-black px-3 py-3"></td>
                  <td className="border border-black px-3 py-3"></td>
                  <td className="border border-black px-3 py-3"></td>
                  <td className="border border-black px-3 py-3"></td>
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

'use client';

import { useState } from 'react';
import { AppConfigData, DEFAULT_CONFIG } from '@/lib/config';
import { useCustomization } from '@/components/providers/customization-provider';
import {
  Palette,
  Image as ImageIcon,
  RotateCcw,
  Save,
  CheckCircle2,
  Upload,
  Layers,
  Sparkles,
  Eye,
  FileText,
  Sliders,
  AlertCircle,
} from 'lucide-react';

type PresetTheme = {
  name: string;
  primary: string;
  background: string;
  cardBg: string;
  cardBorder: string;
  sidebarBg: string;
};

const THEME_PRESETS: PresetTheme[] = [
  {
    name: 'Pertamina Signature',
    primary: '#b90051',
    background: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    sidebarBg: '#ffffff',
  },
  {
    name: 'Ocean Blue',
    primary: '#0284c7',
    background: '#f0f9ff',
    cardBg: '#ffffff',
    cardBorder: '#bae6fd',
    sidebarBg: '#ffffff',
  },
  {
    name: 'Emerald Forest',
    primary: '#059669',
    background: '#f0fdf4',
    cardBg: '#ffffff',
    cardBorder: '#bbf7d0',
    sidebarBg: '#ffffff',
  },
  {
    name: 'Royal Violet',
    primary: '#7c3aed',
    background: '#faf5ff',
    cardBg: '#ffffff',
    cardBorder: '#e9d5ff',
    sidebarBg: '#ffffff',
  },
  {
    name: 'Sunset Amber',
    primary: '#d97706',
    background: '#fffbeb',
    cardBg: '#ffffff',
    cardBorder: '#fde68a',
    sidebarBg: '#ffffff',
  },
  {
    name: 'Executive Dark',
    primary: '#3b82f6',
    background: '#0f172a',
    cardBg: '#1e293b',
    cardBorder: '#334155',
    sidebarBg: '#0f172a',
  },
];

type CustomizationClientProps = {
  initialConfig: AppConfigData;
};

export function CustomizationClient({ initialConfig }: CustomizationClientProps) {
  const { config, setLocalConfig, saveConfig, resetToDefault, isSaving } = useCustomization();
  const [formData, setFormData] = useState<AppConfigData>(config || initialConfig);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'logos' | 'colors' | 'document'>('logos');

  const handleFieldChange = (field: keyof AppConfigData, value: string | null) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setLocalConfig(updated); // Update live styling immediately
    setSaveStatus(null);
  };

  const applyPreset = (preset: PresetTheme) => {
    const updated: AppConfigData = {
      ...formData,
      primaryColor: preset.primary,
      backgroundColor: preset.background,
      cardBackgroundColor: preset.cardBg,
      cardBorderColor: preset.cardBorder,
      sidebarBackgroundColor: preset.sidebarBg,
    };
    setFormData(updated);
    setLocalConfig(updated);
    setSaveStatus(null);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'appLogo' | 'handoverLogo'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Ukuran file gambar maksimal 1MB agar performa aplikasi tetap cepat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      handleFieldChange(field, result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    const success = await saveConfig(formData);
    if (success) {
      setSaveStatus({
        type: 'success',
        message: 'Pengaturan kustomisasi berhasil disimpan ke cloud database Supabase!',
      });
    } else {
      setSaveStatus({
        type: 'error',
        message: 'Gagal menyimpan pengaturan ke database. Silakan coba lagi.',
      });
    }
  };

  const handleReset = async () => {
    if (confirm('Kembalikan semua pengaturan logo, judul, dan warna ke default sistem?')) {
      const success = await resetToDefault();
      if (success) {
        setFormData(DEFAULT_CONFIG);
        setSaveStatus({
          type: 'success',
          message: 'Pengaturan berhasil dikembalikan ke setelan default awal!',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div
        className="rounded-2xl border p-6 shadow-sm transition-colors duration-200"
        style={{
          backgroundColor: formData.cardBackgroundColor || '#ffffff',
          borderColor: formData.cardBorderColor || '#e2e8f0',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: formData.primaryColor }}
            >
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Kustomisasi Tampilan</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Sesuaikan logo instansi, format kop serah terima, dan palet warna sistem secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: formData.primaryColor }}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>

        {/* Alert Notification */}
        {saveStatus && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center space-x-2.5 text-xs font-medium ${
              saveStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{saveStatus.message}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('logos')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'logos'
              ? 'text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          style={activeTab === 'logos' ? { backgroundColor: formData.primaryColor } : {}}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Logo & Identitas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'colors'
              ? 'text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          style={activeTab === 'colors' ? { backgroundColor: formData.primaryColor } : {}}
        >
          <Sliders className="w-4 h-4" />
          <span>Warna & Tema</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('document')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'document'
              ? 'text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          style={activeTab === 'document' ? { backgroundColor: formData.primaryColor } : {}}
        >
          <FileText className="w-4 h-4" />
          <span>Kop Surat Serah Terima</span>
        </button>
      </div>

      {/* Tab 1: Logo & Identitas */}
      {activeTab === 'logos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main App Logo Card */}
          <div
            className="rounded-2xl border p-6 shadow-sm space-y-4"
            style={{
              backgroundColor: formData.cardBackgroundColor || '#ffffff',
              borderColor: formData.cardBorderColor || '#e2e8f0',
            }}
          >
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <ImageIcon className="w-4 h-4" style={{ color: formData.primaryColor }} />
              <h2 className="text-sm font-bold text-gray-900">Logo Aplikasi (Sidebar & Header)</h2>
            </div>

            {/* Current Preview */}
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-2 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.appLogo || '/logo.png'}
                  alt="Preview Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{formData.appTitle || 'IT Warehouse'}</p>
                <p className="text-[10px] text-gray-500">{formData.appSubtitle || 'PSTB'}</p>
                <span className="inline-block mt-1 text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                  Tampil di Sidebar
                </span>
              </div>
            </div>

            {/* Upload File */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Upload File Gambar Baru (PNG, JPG, SVG - Maks 1MB)
              </label>
              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-4 cursor-pointer transition bg-gray-50/50 hover:bg-gray-50">
                <div className="text-center space-y-1">
                  <Upload className="w-5 h-5 mx-auto text-gray-400" />
                  <span className="text-xs text-gray-600 font-medium">Pilih gambar dari komputer</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'appLogo')}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Atau Masukkan URL Gambar
              </label>
              <input
                type="text"
                value={formData.appLogo || ''}
                onChange={(e) => handleFieldChange('appLogo', e.target.value)}
                placeholder="Contoh: /logo.png atau https://domain.com/logo.png"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Preset Buttons */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Preset Logo Cepat</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleFieldChange('appLogo', '/logo.png')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition cursor-pointer"
                >
                  Logo Pertamina Trans Kontinental
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('appLogo', '/pertamina-pl.png')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition cursor-pointer"
                >
                  Logo Pertamina Port & Logistics
                </button>
              </div>
            </div>
          </div>

          {/* App Title & Subtitle Card */}
          <div
            className="rounded-2xl border p-6 shadow-sm space-y-4"
            style={{
              backgroundColor: formData.cardBackgroundColor || '#ffffff',
              borderColor: formData.cardBorderColor || '#e2e8f0',
            }}
          >
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Layers className="w-4 h-4" style={{ color: formData.primaryColor }} />
              <h2 className="text-sm font-bold text-gray-900">Nama & Subjudul Aplikasi</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Utama Aplikasi (Judul Sidebar)
              </label>
              <input
                type="text"
                value={formData.appTitle}
                onChange={(e) => handleFieldChange('appTitle', e.target.value)}
                placeholder="Contoh: IT Warehouse"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Subjudul Instansi / Kantor
              </label>
              <input
                type="text"
                value={formData.appSubtitle}
                onChange={(e) => handleFieldChange('appSubtitle', e.target.value)}
                placeholder="Contoh: PSTB atau Shore Base Tanjung Batu"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Live Sidebar Preview Mockup */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Pratinjau Tampilan Header Sidebar
              </span>
              <div
                className="p-3 rounded-xl border flex items-center space-x-3 shadow-xs"
                style={{ backgroundColor: formData.sidebarBackgroundColor || '#ffffff' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.appLogo || '/logo.png'}
                  alt="Logo"
                  className="h-8 w-auto object-contain shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 text-xs truncate">
                    {formData.appTitle || 'IT Warehouse'}
                  </h3>
                  <p className="text-[10px] text-gray-500 truncate">
                    {formData.appSubtitle || 'PSTB'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Warna & Tema */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          {/* Preset Theme Selection */}
          <div
            className="rounded-2xl border p-6 shadow-sm space-y-4"
            style={{
              backgroundColor: formData.cardBackgroundColor || '#ffffff',
              borderColor: formData.cardBorderColor || '#e2e8f0',
            }}
          >
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Sparkles className="w-4 h-4" style={{ color: formData.primaryColor }} />
              <h2 className="text-sm font-bold text-gray-900">Preset Tema Siap Pakai (1-Klik)</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition hover:scale-105 cursor-pointer flex flex-col justify-between h-24 ${
                    formData.primaryColor === preset.primary
                      ? 'ring-2 ring-blue-500 shadow-md'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: preset.background }}
                >
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.cardBg }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 leading-tight">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Color Pickers */}
          <div
            className="rounded-2xl border p-6 shadow-sm space-y-6"
            style={{
              backgroundColor: formData.cardBackgroundColor || '#ffffff',
              borderColor: formData.cardBorderColor || '#e2e8f0',
            }}
          >
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Sliders className="w-4 h-4" style={{ color: formData.primaryColor }} />
              <h2 className="text-sm font-bold text-gray-900">Pengaturan Palet Warna Kustom</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Warna Aksen / Tombol Utama (Primary)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                    className="w-28 text-xs font-mono px-2 py-2 rounded-lg border border-gray-200"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Tombol aksi, badge aktif, aksen sidebar.</p>
              </div>

              {/* Background Color */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Warna Latar Halaman (Background)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                    className="w-28 text-xs font-mono px-2 py-2 rounded-lg border border-gray-200"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Latar belakang seluruh halaman aplikasi.</p>
              </div>

              {/* Card Background Color */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Warna Background Card
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.cardBackgroundColor}
                    onChange={(e) => handleFieldChange('cardBackgroundColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.cardBackgroundColor}
                    onChange={(e) => handleFieldChange('cardBackgroundColor', e.target.value)}
                    className="w-28 text-xs font-mono px-2 py-2 rounded-lg border border-gray-200"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Warna kontainer tabel, form, dan kartu metrik.</p>
              </div>

              {/* Card Border Color */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Warna Garis Tepi Card (Border)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.cardBorderColor}
                    onChange={(e) => handleFieldChange('cardBorderColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.cardBorderColor}
                    onChange={(e) => handleFieldChange('cardBorderColor', e.target.value)}
                    className="w-28 text-xs font-mono px-2 py-2 rounded-lg border border-gray-200"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Garis pembatas kartu dan header tabel.</p>
              </div>

              {/* Sidebar Background Color */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Warna Background Sidebar
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.sidebarBackgroundColor}
                    onChange={(e) => handleFieldChange('sidebarBackgroundColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.sidebarBackgroundColor}
                    onChange={(e) => handleFieldChange('sidebarBackgroundColor', e.target.value)}
                    className="w-28 text-xs font-mono px-2 py-2 rounded-lg border border-gray-200"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Latar belakang navigasi menu di sebelah kiri.</p>
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div
            className="rounded-2xl border p-6 shadow-sm space-y-4"
            style={{
              backgroundColor: formData.cardBackgroundColor || '#ffffff',
              borderColor: formData.cardBorderColor || '#e2e8f0',
            }}
          >
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Eye className="w-4 h-4" style={{ color: formData.primaryColor }} />
              <h2 className="text-sm font-bold text-gray-900">Live Preview Komponen</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sample Card */}
              <div
                className="p-4 rounded-xl border shadow-xs space-y-2"
                style={{
                  backgroundColor: formData.cardBackgroundColor,
                  borderColor: formData.cardBorderColor,
                }}
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase">Kartu Metrik</span>
                <div className="text-2xl font-bold text-gray-900">128 Unit</div>
                <p className="text-xs text-gray-500">Inventaris Device Aktif</p>
                <div className="pt-2">
                  <span
                    className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg text-white"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Stok Tersedia
                  </span>
                </div>
              </div>

              {/* Sample Buttons & Badges */}
              <div
                className="p-4 rounded-xl border shadow-xs space-y-3"
                style={{
                  backgroundColor: formData.cardBackgroundColor,
                  borderColor: formData.cardBorderColor,
                }}
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase">Tombol & Aksi</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Tombol Utama
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                    style={{
                      borderColor: formData.primaryColor,
                      color: formData.primaryColor,
                    }}
                  >
                    Tombol Outline
                  </button>
                </div>
                <div className="text-xs text-gray-500">Input Form:</div>
                <input
                  type="text"
                  readOnly
                  value="Contoh input teks form"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200"
                />
              </div>

              {/* Sample Sidebar Nav Link */}
              <div
                className="p-4 rounded-xl border shadow-xs space-y-2"
                style={{
                  backgroundColor: formData.sidebarBackgroundColor,
                  borderColor: formData.cardBorderColor,
                }}
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase">Item Navigasi Sidebar</span>
                <div
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center space-x-2"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  <Palette className="w-4 h-4" />
                  <span>Menu Aktif Terpilih</span>
                </div>
                <div className="px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Menu Tidak Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kop Dokumen Serah Terima */}
      {activeTab === 'document' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-2xl border p-6 shadow-sm space-y-4"
            style={{
              backgroundColor: formData.cardBackgroundColor || '#ffffff',
              borderColor: formData.cardBorderColor || '#e2e8f0',
            }}
          >
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <FileText className="w-4 h-4" style={{ color: formData.primaryColor }} />
              <h2 className="text-sm font-bold text-gray-900">Logo Dokumen Serah Terima (Cetak PDF)</h2>
            </div>

            {/* Current Preview */}
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-24 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-2 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.handoverLogo || '/pertamina-pl.png'}
                  alt="Preview Logo Serah Terima"
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Logo Kop Dokumen</p>
                <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                  Tampil di Pojok Kanan Atas PDF
                </span>
              </div>
            </div>

            {/* Upload File */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Upload File Logo Kop Baru (Maks 1MB)
              </label>
              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-4 cursor-pointer transition bg-gray-50/50 hover:bg-gray-50">
                <div className="text-center space-y-1">
                  <Upload className="w-5 h-5 mx-auto text-gray-400" />
                  <span className="text-xs text-gray-600 font-medium">Pilih gambar logo kop surat</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'handoverLogo')}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Atau Masukkan URL Logo
              </label>
              <input
                type="text"
                value={formData.handoverLogo || ''}
                onChange={(e) => handleFieldChange('handoverLogo', e.target.value)}
                placeholder="Contoh: /pertamina-pl.png"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Preset Cepat</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleFieldChange('handoverLogo', '/pertamina-pl.png')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition cursor-pointer"
                >
                  Logo Pertamina Port & Logistics
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('handoverLogo', '/logo.png')}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition cursor-pointer"
                >
                  Logo Pertamina Trans Kontinental
                </button>
              </div>
            </div>
          </div>

          {/* Handover Document Settings */}
          <div
            className="rounded-2xl border p-6 shadow-sm space-y-4"
            style={{
              backgroundColor: formData.cardBackgroundColor || '#ffffff',
              borderColor: formData.cardBorderColor || '#e2e8f0',
            }}
          >
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <FileText className="w-4 h-4" style={{ color: formData.primaryColor }} />
              <h2 className="text-sm font-bold text-gray-900">Format Kop Teks Dokumen</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Judul Dokumen Berita Acara
              </label>
              <input
                type="text"
                value={formData.handoverTitle}
                onChange={(e) => handleFieldChange('handoverTitle', e.target.value)}
                placeholder="Contoh: BERITA ACARA SERAH TERIMA BARANG"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Lokasi / Instansi Default Dokumen
              </label>
              <input
                type="text"
                value={formData.handoverLocation}
                onChange={(e) => handleFieldChange('handoverLocation', e.target.value)}
                placeholder="Contoh: PTK Shore Base Tanjung Batu"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Live Paper Document Header Mockup */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Pratinjau Kop Surat Saat Dicetak
              </span>
              <div className="bg-white p-4 border border-black rounded-lg relative">
                <div className="text-center pr-16">
                  <h3 className="font-bold text-black text-xs uppercase leading-tight">
                    {formData.handoverTitle || 'BERITA ACARA SERAH TERIMA BARANG'}
                  </h3>
                  <p className="text-[10px] font-semibold text-gray-700 mt-0.5">
                    {formData.handoverLocation || 'PTK Shore Base Tanjung Batu'}
                  </p>
                </div>
                <div className="absolute right-3 top-0 bottom-0 flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.handoverLogo || '/pertamina-pl.png'}
                    alt="Logo Kop"
                    className="h-7 w-auto object-contain mix-blend-multiply"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

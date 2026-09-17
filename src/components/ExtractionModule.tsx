import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { ExtractionRecord } from '../types';
import { formatCurrency, formatCFT, formatNumber, formatDate } from '../utils/formatters';
import {
  Waves,
  PlusCircle,
  Search,
  Trash2,
  Edit2,
  X,
  Fuel,
  Cpu
} from 'lucide-react';

interface ExtractionModuleProps {
  showAddModalDefault?: boolean;
  onCloseAddModalDefault?: () => void;
}

export const ExtractionModule: React.FC<ExtractionModuleProps> = ({
  showAddModalDefault = false,
  onCloseAddModalDefault
}) => {
  const { data, language, userRole, addExtraction, updateExtraction, deleteExtraction, totalExtractedCFT } = useApp();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGhat, setSelectedGhat] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(showAddModalDefault);
  const [editingItem, setEditingItem] = useState<ExtractionRecord | null>(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ghatName, setGhatName] = useState('');
  const [machineId, setMachineId] = useState('বল গেট ড্রেজার - ০১');
  const [quantityCFT, setQuantityCFT] = useState<number>(0);
  const [extractionCost, setExtractionCost] = useState<number>(0);
  const [operatorName, setOperatorName] = useState('');
  const [note, setNote] = useState('');

  // Handle external open
  React.useEffect(() => {
    if (showAddModalDefault) {
      setIsModalOpen(true);
      resetForm();
    }
  }, [showAddModalDefault]);

  const resetForm = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setGhatName('');
    setMachineId('বল গেট ড্রেজার - ০১');
    setQuantityCFT(0);
    setExtractionCost(0);
    setOperatorName('');
    setNote('');
    setEditingItem(null);
  };

  const openEditModal = (item: ExtractionRecord) => {
    setEditingItem(item);
    setDate(item.date);
    setGhatName(item.ghatName);
    setMachineId(item.machineId);
    setQuantityCFT(item.quantityCFT);
    setExtractionCost(item.extractionCost);
    setOperatorName(item.operatorName);
    setNote(item.note || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghatName.trim() || quantityCFT <= 0) return;

    if (editingItem) {
      updateExtraction(editingItem.id, {
        date,
        ghatName: ghatName.trim(),
        machineId: machineId.trim(),
        quantityCFT: Number(quantityCFT),
        extractionCost: Number(extractionCost),
        operatorName: operatorName.trim(),
        note: note.trim()
      });
    } else {
      addExtraction({
        date,
        ghatName: ghatName.trim(),
        machineId: machineId.trim(),
        quantityCFT: Number(quantityCFT),
        extractionCost: Number(extractionCost),
        operatorName: operatorName.trim(),
        note: note.trim()
      });
    }

    setIsModalOpen(false);
    resetForm();
    if (onCloseAddModalDefault) onCloseAddModalDefault();
  };

  // Distinct ghats for filter
  const uniqueGhats = useMemo(() => {
    const set = new Set<string>();
    data.extractions.forEach(e => set.add(e.ghatName));
    return Array.from(set);
  }, [data.extractions]);

  // Filtered extractions
  const filteredExtractions = useMemo(() => {
    return data.extractions.filter(item => {
      const matchesSearch =
        item.ghatName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.machineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGhat = selectedGhat === 'all' || item.ghatName === selectedGhat;
      return matchesSearch && matchesGhat;
    });
  }, [data.extractions, searchTerm, selectedGhat]);

  // Total cost
  const totalCost = filteredExtractions.reduce((sum, e) => sum + e.extractionCost, 0);
  const totalCFT = filteredExtractions.reduce((sum, e) => sum + e.quantityCFT, 0);
  const avgCostPerCFT = totalCFT > 0 ? (totalCost / totalCFT).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Waves className="w-5 h-5 text-amber-600" />
            {t.extractionLog}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'নদী ও ঘাট থেকে বল গেট ড্রেজার দিয়ে উত্তোলিত বালুর পরিমাণ (CFT) ও সরাসরি পরিচালন খরচ।'
              : 'Record dredged sand extraction quantities (CFT) and direct fuel/operational pumping costs.'}
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            id="add-extraction-top-btn"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newExtraction}</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.totalExtracted}</span>
          <p className="text-xl font-black text-amber-800 mt-1">
            {formatCFT(totalCFT, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {filteredExtractions.length} {language === 'bn' ? 'টি উত্তোলন এন্ট্রি' : 'records logged'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            {language === 'bn' ? 'মোট উত্তোলন পরিচালন খরচ' : 'Total Direct Cost'}
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(totalCost, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'ডিজেল, তেল ও শ্রম খরচ' : 'Fuel, lubricants & wages'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.costPerCft}</span>
          <p className="text-xl font-black text-emerald-700 mt-1">
            ৳ {avgCostPerCFT} <span className="text-xs font-normal text-slate-600">/ CFT</span>
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'গড় উৎপাদন খরচ' : 'Average production rate'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {language === 'bn' ? 'ঘাট নির্বাচন:' : 'Ghat:'}
          </label>
          <select
            value={selectedGhat}
            onChange={e => setSelectedGhat(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
          >
            <option value="all">{language === 'bn' ? 'সকল ঘাট ও নদী' : 'All Ghats'}</option>
            {uniqueGhats.map(ghat => (
              <option key={ghat} value={ghat}>
                {ghat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Extraction Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">{t.date}</th>
                <th className="p-3">{t.ghatName}</th>
                <th className="p-3">{t.machineNumber}</th>
                <th className="p-3 text-right">{language === 'bn' ? 'উত্তোলিত পরিমাণ (CFT)' : 'Quantity (CFT)'}</th>
                <th className="p-3 text-right">{t.extractionCost}</th>
                <th className="p-3 text-right">{t.costPerCft}</th>
                <th className="p-3">{t.operatorName}</th>
                <th className="p-3">{t.note}</th>
                {userRole === 'admin' && <th className="p-3 text-center">{t.actions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExtractions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredExtractions.map(ext => {
                  const costPerCFT = ext.quantityCFT > 0 ? (ext.extractionCost / ext.quantityCFT).toFixed(2) : '0';
                  return (
                    <tr key={ext.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                        {formatDate(ext.date, language)}
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {ext.ghatName}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
                          <Cpu className="w-3 h-3" />
                          {ext.machineId}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-amber-900 text-sm whitespace-nowrap">
                        {formatCFT(ext.quantityCFT, language)}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(ext.extractionCost, language)}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-600 whitespace-nowrap">
                        ৳ {costPerCFT}
                      </td>
                      <td className="p-3 text-slate-700 whitespace-nowrap">
                        {ext.operatorName || '-'}
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">
                        {ext.note || '-'}
                      </td>
                      {userRole === 'admin' && (
                        <td className="p-3 text-center whitespace-nowrap space-x-1">
                          <button
                            onClick={() => openEditModal(ext)}
                            className="p-1 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-md transition-colors"
                            title={t.edit}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(t.confirmDelete)) {
                                deleteExtraction(ext.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                            title={t.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Extraction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-amber-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Waves className="w-5 h-5" />
                {editingItem
                  ? (language === 'bn' ? 'উত্তোলন তথ্য সম্পাদনা' : 'Edit Extraction Record')
                  : t.addExtractionTitle}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseAddModalDefault) onCloseAddModalDefault();
                }}
                className="p-1 text-amber-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.date} *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.machineNumber} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="বল গেট ড্রেজার - ০১"
                    value={machineId}
                    onChange={e => setMachineId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.ghatName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: মেঘনা চর ঘাট - পয়েন্ট ১' : 'e.g., Meghna River Ghat'}
                  value={ghatName}
                  onChange={e => setGhatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'উত্তোলিত পরিমাণ (CFT)' : 'Quantity (CFT)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="50000"
                    value={quantityCFT || ''}
                    onChange={e => setQuantityCFT(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.extractionCost} (৳) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="150000"
                    value={extractionCost || ''}
                    onChange={e => setExtractionCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.operatorName}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: উস্তাদ রহিম মাঝি' : 'Lead Operator Name'}
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.note}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'বালুর কোয়ালিটি বা পাইপলাইন সংক্রান্ত বিবরণ' : 'Sand grade or pipeline notes'}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseAddModalDefault) onCloseAddModalDefault();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

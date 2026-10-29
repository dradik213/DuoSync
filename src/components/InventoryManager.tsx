import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Printer, 
  Trash2, 
  Edit3, 
  Barcode as BarcodeIcon, 
  RefreshCw, 
  Check, 
  X, 
  DollarSign, 
  Tag, 
  Layers, 
  ArrowLeft,
  Sparkles,
  Download
} from 'lucide-react';
import { InventoryProduct } from '../types/calendar';
import { 
  loadMasterInventory, 
  saveMasterInventory, 
  generateBarcode, 
  generateBarcodeSvg, 
  playScannerBeep 
} from '../utils/barcodeUtils';

interface InventoryManagerProps {
  onClose?: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ onClose }) => {
  const [products, setProducts] = useState<InventoryProduct[]>(() => loadMasterInventory());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Product add/edit modal state
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('Crafts');
  const [formPrice, setFormPrice] = useState<string>('20.00');
  const [formCost, setFormCost] = useState<string>('5.00');
  const [formStock, setFormStock] = useState<string>('20');
  const [formDescription, setFormDescription] = useState('');

  // Mobile Label Printing Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printProduct, setPrintProduct] = useState<InventoryProduct | null>(null);
  const [labelCopies, setLabelCopies] = useState<number>(4);
  const [labelSize, setLabelSize] = useState<'standard' | 'compact' | 'receipt'>('standard');

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    const newBarcode = generateBarcode();
    const newSku = `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    setEditingProduct(null);
    setFormName('');
    setFormSku(newSku);
    setFormBarcode(newBarcode);
    setFormCategory('Crafts');
    setFormPrice('24.00');
    setFormCost('6.00');
    setFormStock('20');
    setFormDescription('');
    setIsEditingModalOpen(true);
  };

  const handleOpenEdit = (p: InventoryProduct) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormBarcode(p.barcode);
    setFormCategory(p.category);
    setFormPrice(p.price.toFixed(2));
    setFormCost(p.cost !== undefined ? p.cost.toFixed(2) : '');
    setFormStock(String(p.defaultStock));
    setFormDescription(p.description || '');
    setIsEditingModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBarcode.trim()) return;

    const priceNum = parseFloat(formPrice) || 0;
    const costNum = formCost ? parseFloat(formCost) : undefined;
    const stockNum = parseInt(formStock, 10) || 0;

    let updated: InventoryProduct[];
    if (editingProduct) {
      updated = products.map((item) =>
        item.id === editingProduct.id
          ? {
              ...item,
              name: formName.trim(),
              sku: formSku.trim(),
              barcode: formBarcode.trim(),
              category: formCategory.trim(),
              price: priceNum,
              cost: costNum,
              defaultStock: stockNum,
              description: formDescription.trim()
            }
          : item
      );
    } else {
      const newItem: InventoryProduct = {
        id: `prod-${Date.now()}`,
        name: formName.trim(),
        sku: formSku.trim(),
        barcode: formBarcode.trim(),
        category: formCategory.trim(),
        price: priceNum,
        cost: costNum,
        defaultStock: stockNum,
        description: formDescription.trim(),
        createdAt: new Date().toISOString()
      };
      updated = [newItem, ...products];
    }

    setProducts(updated);
    saveMasterInventory(updated);
    setIsEditingModalOpen(false);
    playScannerBeep(true);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from master inventory?`)) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveMasterInventory(updated);
    }
  };

  const handleOpenPrintDialog = (p: InventoryProduct) => {
    setPrintProduct(p);
    setLabelCopies(4);
    setIsPrintModalOpen(true);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  // Total inventory stats
  const totalStockCount = products.reduce((acc, p) => acc + (p.defaultStock || 0), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.price * (p.defaultStock || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4ded5] dark:border-[#353943] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <Package className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Master Inventory & Barcodes
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Create items, generate Code-128 barcodes, set pricing, and print mobile thermal labels for markets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Item & Barcode</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-stone-50 dark:bg-[#202329] rounded-xl border border-[#e4ded5] dark:border-[#353943]">
          <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Total SKUs</span>
          <span className="text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {products.length}
          </span>
        </div>
        <div className="p-3 bg-stone-50 dark:bg-[#202329] rounded-xl border border-[#e4ded5] dark:border-[#353943]">
          <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Default Stock Units</span>
          <span className="text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {totalStockCount}
          </span>
        </div>
        <div className="p-3 bg-stone-50 dark:bg-[#202329] rounded-xl border border-[#e4ded5] dark:border-[#353943]">
          <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Retail Valuation</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            ${totalRetailValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-3 bg-stone-50 dark:bg-[#202329] rounded-xl border border-[#e4ded5] dark:border-[#353943]">
          <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Mobile Label Type</span>
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mt-1">
            2" x 1" Thermal Roll
          </span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#1a1d22] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
          />
        </div>

        {/* Categories as clean interactive buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-[#252830] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#e4ded5] dark:border-[#353943] rounded-xl p-6">
          <Package className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">No inventory products found.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 cursor-pointer"
          >
            Create Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProducts.map((product) => {
            const barcodeSvg = generateBarcodeSvg(product.barcode, { height: 38, barWidth: 1.4 });

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-[#1f2228] rounded-xl border border-[#e4ded5] dark:border-[#353943] p-4 flex flex-col justify-between hover:border-stone-400 dark:hover:border-stone-600 transition-all shadow-2xs group"
              >
                <div>
                  {/* Category and Price */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      {product.category}
                    </span>
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 mb-1">
                    {product.name}
                  </h3>

                  {/* SKU & Stock Info */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 font-mono mb-3">
                    <span>{product.sku}</span>
                    <span>·</span>
                    <span>Stock: {product.defaultStock}</span>
                    {product.cost !== undefined && (
                      <>
                        <span>·</span>
                        <span>Cost: ${product.cost.toFixed(2)}</span>
                      </>
                    )}
                  </div>

                  {/* Barcode SVG Visual */}
                  <div className="bg-white p-2 rounded-lg border border-stone-200/90 dark:border-stone-700/60 flex items-center justify-center my-1">
                    <div 
                      dangerouslySetInnerHTML={{ __html: barcodeSvg.svgContent }}
                      className="w-full flex justify-center"
                    />
                  </div>
                </div>

                {/* Bottom Card Controls */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-1 text-xs mt-3">
                  <button
                    type="button"
                    onClick={() => handleOpenPrintDialog(product)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-stone-100 dark:bg-[#282c35] text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#323640] font-medium text-[11px] transition-colors cursor-pointer"
                    title="Print barcode labels for mobile thermal printer"
                  >
                    <Printer className="w-3 h-3 text-stone-500" />
                    <span>Print Label</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 rounded hover:bg-stone-100 dark:hover:bg-[#282c35] transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d22] rounded-2xl border border-[#e4ded5] dark:border-[#353943] max-w-lg w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e4ded5] dark:border-[#353943] pb-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BarcodeIcon className="w-4 h-4 text-amber-600" />
                <span>{editingProduct ? 'Edit Inventory Item' : 'New Product & Barcode'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stoneware Ceramic Mug"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              {/* Category & SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceramics, Apparel, Candles"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              {/* Barcode Number & Regenerate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Barcode (Code 128 / UPC)
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormBarcode(generateBarcode())}
                    className="text-[11px] text-amber-700 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Unique</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100 font-mono tracking-wider"
                />
              </div>

              {/* Live Barcode Preview Box */}
              {formBarcode && (
                <div className="p-3 bg-white rounded-lg border border-stone-200 text-center">
                  <span className="text-[10px] text-stone-400 font-mono block mb-1">Print Preview</span>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: generateBarcodeSvg(formBarcode, { height: 42, barWidth: 1.5 }).svgContent
                    }}
                    className="flex justify-center"
                  />
                </div>
              )}

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Retail Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Default Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Description / Dimensions / Materials
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes about craftsmanship, size, or packaging..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e4ded5] dark:border-[#353943]">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE THERMAL LABEL PRINT MODAL */}
      {isPrintModalOpen && printProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d22] rounded-2xl border border-[#e4ded5] dark:border-[#353943] max-w-lg w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4ded5] dark:border-[#353943] pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Print Barcode Labels</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Formatted for Bluetooth / USB mobile label printers (Munbyn, Phomemo, Rollo).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Settings */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Label Template
                </label>
                <select
                  value={labelSize}
                  onChange={(e) => setLabelSize(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100"
                >
                  <option value="standard">2" × 1" (50×25mm) Standard Thermal</option>
                  <option value="compact">2.25" × 1.25" Jewelry / Small</option>
                  <option value="receipt">Continuous 80mm Roll</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Copies to Print
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={labelCopies}
                  onChange={(e) => setLabelCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4ded5] dark:border-[#353943] bg-white dark:bg-[#202329] text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>
            </div>

            {/* Print Preview Container */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 font-mono uppercase tracking-wider block">
                Thermal Roll Preview ({labelCopies} copies)
              </span>

              <div 
                ref={printAreaRef}
                className="bg-stone-100 dark:bg-[#22252c] p-3 rounded-xl border border-stone-200 dark:border-stone-700 max-h-64 overflow-y-auto flex flex-col items-center gap-3"
              >
                {Array.from({ length: Math.min(labelCopies, 12) }).map((_, idx) => {
                  const barcodeSvg = generateBarcodeSvg(printProduct.barcode, {
                    height: 38,
                    barWidth: 1.4,
                    showText: true
                  });

                  return (
                    <div
                      key={idx}
                      className="bg-white text-black p-2 rounded border border-stone-300 shadow-2xs w-64 flex flex-col items-center justify-between"
                      style={{ minHeight: '96px' }}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] font-bold border-b border-stone-200 pb-0.5 mb-1 px-1">
                        <span className="truncate max-w-[160px]">{printProduct.name}</span>
                        <span className="font-mono tabular-nums">${printProduct.price.toFixed(2)}</span>
                      </div>

                      <div 
                        dangerouslySetInnerHTML={{ __html: barcodeSvg.svgContent }}
                        className="w-full flex justify-center py-0.5"
                      />

                      <div className="w-full flex justify-between text-[9px] text-stone-600 font-mono px-1">
                        <span>{printProduct.sku}</span>
                        <span>{printProduct.category}</span>
                      </div>
                    </div>
                  );
                })}
                {labelCopies > 12 && (
                  <p className="text-[11px] text-stone-400 italic">
                    +{labelCopies - 12} more labels will print to the printer...
                  </p>
                )}
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4ded5] dark:border-[#353943]">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Send to Mobile Printer ({labelCopies})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

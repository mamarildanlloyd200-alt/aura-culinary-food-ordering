import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, storage, STORAGE_KEYS, RELATIONAL_SCHEMAS, FIREBASE_FIRESTORE_MODEL, ApiLog } from '../services/api';
import { MENU_ITEMS } from '../data/menuData';
import { formatPhp } from '../utils/format';
import { X, Terminal, Database, Server, HardDrive, FileJson, Play, Copy, Check, Download, RefreshCw } from 'lucide-react';

type TechTab = 'rest-api' | 'relational-sql' | 'firebase' | 'localstorage' | 'json-export';

export const TechConsole: React.FC = () => {
  const { isTechConsoleOpen, setIsTechConsoleOpen, showToast, cart, orders, user } = useApp();
  const [activeTab, setActiveTab] = useState<TechTab>('rest-api');
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // REST API Tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/menu');
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST'>('GET');
  const [apiRequestBody, setApiRequestBody] = useState('{\n  "query": "burger"\n}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiDuration, setApiDuration] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);

  // SQL Runner state
  const [sqlDialect, setSqlDialect] = useState<'postgresql' | 'mysql'>('postgresql');
  const [sqlQuery, setSqlQuery] = useState('SELECT name, category, price, rating FROM dishes WHERE price < 450 ORDER BY price ASC;');
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: any[] } | null>(null);

  // LocalStorage state
  const [storageItems, setStorageItems] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    if (isTechConsoleOpen) {
      loadStorageData();
      loadApiLogs();
      executeSimulatedSql(sqlQuery);
    }
  }, [isTechConsoleOpen]);

  const loadStorageData = () => {
    const keys = Object.values(STORAGE_KEYS);
    const items = keys.map((k) => ({
      key: k,
      value: localStorage.getItem(k) || 'null',
    }));
    setStorageItems(items);
  };

  const loadApiLogs = () => {
    const logs = storage.get<ApiLog[]>(STORAGE_KEYS.TECH_LOGS, []);
    setApiLogs(logs);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run real REST API test
  const handleTestApi = async () => {
    setApiLoading(true);
    const start = performance.now();
    try {
      if (selectedEndpoint.startsWith('/api/v1/menu')) {
        let q = '';
        try {
          const parsed = JSON.parse(apiRequestBody);
          q = parsed.query || '';
        } catch {}
        const res = await api.getMenu({ query: q });
        setApiResponse(res);
        setApiStatus(200);
      } else if (selectedEndpoint.startsWith('/api/v1/orders')) {
        if (selectedMethod === 'GET') {
          const res = await api.getOrders();
          setApiResponse(res);
          setApiStatus(200);
        } else {
          const res = await api.createOrder({
            items: cart.length > 0 ? cart : [
              {
                id: 'demo-1',
                dish: MENU_ITEMS[0],
                quantity: 1,
                selectedSizePriceDelta: 0,
                selectedAddOns: [],
                unitPrice: 495.0,
                itemTotal: 495.0,
              },
            ],
            subtotal: 495.0,
            discount: 0,
            deliveryFee: 69.00,
            tax: 59.40,
            tip: 50.00,
            total: 673.40,
            customer: {
              fullName: 'Elena Santos',
              email: 'elena.santos@gmail.com',
              phone: '+63 (917) 349-8120',
              streetAddress: '5th Avenue cor. 28th St',
              city: 'Taguig, Metro Manila',
              postalCode: '1634',
            },
            payment: { method: 'digital-wallet' },
            estimatedDeliveryTime: '25-30 mins',
          });
          setApiResponse(res);
          setApiStatus(201);
        }
      } else if (selectedEndpoint.startsWith('/api/v1/auth')) {
        const res = await api.login('patron.rossi@aurabistro.com');
        setApiResponse(res);
        setApiStatus(200);
      }
      setApiDuration(Math.round(performance.now() - start));
      loadApiLogs();
    } catch (err: any) {
      setApiResponse({ error: err.message || 'API request failed' });
      setApiStatus(500);
      setApiDuration(Math.round(performance.now() - start));
    } finally {
      setApiLoading(false);
    }
  };

  // Execute Simulated SQL Query against in-memory dishes / orders
  const executeSimulatedSql = (query: string) => {
    const q = query.trim().toUpperCase();
    if (q.includes('FROM DISHES')) {
      const filtered = MENU_ITEMS.filter((d) => {
        if (q.includes('PRICE < 450') || q.includes('PRICE < 20')) return d.price < 450;
        if (q.includes('RATING >=')) return d.rating >= 4.8;
        return true;
      });
      const rows = filtered.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        price: formatPhp(d.price),
        rating: `${d.rating} ★`,
        prep_time: `${d.prepTimeMinutes} min`,
      }));
      setSqlResult({
        columns: ['id', 'name', 'category', 'price', 'rating', 'prep_time'],
        rows,
      });
    } else if (q.includes('FROM ORDERS')) {
      const savedOrders = storage.get<any[]>(STORAGE_KEYS.ORDERS, []);
      const rows = savedOrders.map((o) => ({
        order_number: o.orderNumber,
        customer_name: o.customer.fullName,
        total_amount: formatPhp(o.total),
        status: o.status,
        payment_method: o.payment.method,
        created_at: o.createdAt.split('T')[0],
      }));
      setSqlResult({
        columns: ['order_number', 'customer_name', 'total_amount', 'status', 'payment_method', 'created_at'],
        rows: rows.length > 0 ? rows : [
          {
            order_number: 'AUR-1041',
            customer_name: 'Mateo Rossi',
            total_amount: '₱1,045.00',
            status: 'delivered',
            payment_method: 'digital-wallet',
            created_at: '2026-10-12',
          },
        ],
      });
    } else {
      setSqlResult({
        columns: ['result', 'info'],
        rows: [{ result: 'OK', info: 'Query parsed and executed successfully against relational engine.' }],
      });
    }
  };

  // Download entire DB and state as JSON
  const handleDownloadJsonBackup = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      restaurant: {
        name: 'Aura Bistro Flagship',
        location: 'San Francisco, CA',
        version: '2.4.0',
      },
      menu: MENU_ITEMS,
      orders: storage.get(STORAGE_KEYS.ORDERS, []),
      activeUser: storage.get(STORAGE_KEYS.USER, null),
      favorites: storage.get(STORAGE_KEYS.FAVORITES, []),
      schemas: RELATIONAL_SCHEMAS,
      firebaseTree: FIREBASE_FIRESTORE_MODEL,
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_bistro_full_database_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON database export downloaded.');
  };

  if (!isTechConsoleOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-100 font-mono">
                Developer Database & Architecture Console
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Fetch API · Rest API · Local Storage · PostgreSQL · MySQL · Firebase · JSON
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTechConsoleOpen(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close tech console"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-2 bg-neutral-950/60 border-b border-neutral-800 overflow-x-auto shrink-0 text-xs font-mono">
          <button
            onClick={() => setActiveTab('rest-api')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'rest-api'
                ? 'bg-neutral-800 text-amber-300 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>REST API & Fetch</span>
          </button>
          <button
            onClick={() => setActiveTab('relational-sql')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'relational-sql'
                ? 'bg-neutral-800 text-amber-300 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL & MySQL</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'bg-neutral-800 text-amber-300 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase Firestore & Auth</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('localstorage');
              loadStorageData();
            }}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'localstorage'
                ? 'bg-neutral-800 text-amber-300 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Local Storage</span>
          </button>
          <button
            onClick={() => setActiveTab('json-export')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'json-export'
                ? 'bg-neutral-800 text-amber-300 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON Backup & Export</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: REST API & Fetch API */}
          {activeTab === 'rest-api' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="text-xs font-semibold text-neutral-300 font-mono uppercase tracking-wider flex items-center justify-between">
                  <span>Interactive Endpoint Tester</span>
                  <span className="text-[11px] text-neutral-500 lowercase">uses window.fetch / async client</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value as any)}
                    className="px-3 py-2 text-xs font-mono rounded-lg bg-neutral-900 border border-neutral-700 text-amber-300"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>

                  <select
                    value={selectedEndpoint}
                    onChange={(e) => {
                      setSelectedEndpoint(e.target.value);
                      if (e.target.value.includes('orders') && selectedMethod === 'POST') {
                        setApiRequestBody(JSON.stringify({ note: 'Express priority order' }, null, 2));
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200"
                  >
                    <option value="/api/v1/menu">/api/v1/menu (Search & Catalog)</option>
                    <option value="/api/v1/orders">/api/v1/orders (Order Processing)</option>
                    <option value="/api/v1/auth/login">/api/v1/auth/login (JWT Session)</option>
                  </select>

                  <button
                    onClick={handleTestApi}
                    disabled={apiLoading}
                    className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{apiLoading ? 'Fetching...' : 'Send Request'}</span>
                  </button>
                </div>

                {selectedMethod === 'POST' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Request Body (JSON):</label>
                    <textarea
                      value={apiRequestBody}
                      onChange={(e) => setApiRequestBody(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-xs font-mono rounded bg-neutral-900 border border-neutral-800 text-neutral-200"
                    />
                  </div>
                )}
              </div>

              {/* API Response display */}
              {apiResponse && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-400">HTTP Status:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          apiStatus && apiStatus < 300
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {apiStatus} {apiStatus === 200 ? 'OK' : apiStatus === 201 ? 'CREATED' : 'ERROR'}
                      </span>
                      <span className="text-neutral-500">Latency: {apiDuration}ms</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(apiResponse, null, 2), 'Response JSON')}
                      className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-neutral-900 rounded-lg text-xs font-mono text-amber-200 overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}

              {/* Live Request Logs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Recent Rest API Transaction Logs:</span>
                  <button onClick={loadApiLogs} className="hover:text-white flex items-center gap-1 cursor-pointer">
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>
                <div className="border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800 bg-neutral-950">
                  {apiLogs.length === 0 ? (
                    <div className="p-4 text-center text-xs font-mono text-neutral-500">
                      No API requests recorded yet. Click "Send Request" above to test.
                    </div>
                  ) : (
                    apiLogs.slice(0, 6).map((log) => (
                      <div key={log.id} className="p-3 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-neutral-500 tabular-nums">{log.timestamp}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.method === 'GET' ? 'bg-blue-950 text-blue-400' : 'bg-emerald-950 text-emerald-400'
                          }`}>
                            {log.method}
                          </span>
                          <span className="text-neutral-300 truncate max-w-xs">{log.endpoint}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400">{log.statusCode}</span>
                          <span className="text-neutral-500 tabular-nums">{log.durationMs}ms</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Relational Databases (PostgreSQL vs MySQL) */}
          {activeTab === 'relational-sql' && (
            <div className="space-y-6">
              {/* Dialect Switcher & DDL */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-200">Dialect:</span>
                    <button
                      onClick={() => setSqlDialect('postgresql')}
                      className={`px-2.5 py-1 text-xs font-mono rounded cursor-pointer ${
                        sqlDialect === 'postgresql'
                          ? 'bg-amber-400 text-neutral-950 font-bold'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      PostgreSQL 16
                    </button>
                    <button
                      onClick={() => setSqlDialect('mysql')}
                      className={`px-2.5 py-1 text-xs font-mono rounded cursor-pointer ${
                        sqlDialect === 'mysql'
                          ? 'bg-amber-400 text-neutral-950 font-bold'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      MySQL 8.4 InnoDB
                    </button>
                  </div>
                  <button
                    onClick={() => copyToClipboard(RELATIONAL_SCHEMAS[sqlDialect], `${sqlDialect.toUpperCase()} DDL`)}
                    className="text-xs font-mono text-neutral-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy DDL Schema</span>
                  </button>
                </div>

                <pre className="p-3 bg-neutral-900 rounded-lg text-xs font-mono text-neutral-300 overflow-x-auto max-h-52 leading-relaxed">
                  {RELATIONAL_SCHEMAS[sqlDialect]}
                </pre>
              </div>

              {/* Interactive SQL Query Console */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-neutral-300">Interactive SQL Query Engine</span>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Presets:</span>
                    <button
                      onClick={() => {
                        const q = 'SELECT name, category, price, rating FROM dishes WHERE price < 450 ORDER BY price ASC;';
                        setSqlQuery(q);
                        executeSimulatedSql(q);
                      }}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      dishes &lt; ₱450
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => {
                        const q = 'SELECT o.order_number, u.name, o.total_amount, o.status FROM orders o JOIN users u;';
                        setSqlQuery(q);
                        executeSimulatedSql(q);
                      }}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      recent orders
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => executeSimulatedSql(sqlQuery)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute</span>
                  </button>
                </div>

                {/* Tabular Result Grid */}
                {sqlResult && (
                  <div className="mt-4 border border-neutral-800 rounded-lg overflow-x-auto bg-neutral-900">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                        <tr>
                          {sqlResult.columns.map((col) => (
                            <th key={col} className="px-3 py-2 font-semibold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300">
                        {sqlResult.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-neutral-800/50">
                            {sqlResult.columns.map((col) => (
                              <td key={col} className="px-3 py-2 whitespace-nowrap">
                                {row[col] ?? '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Firebase Firestore & Auth */}
          {activeTab === 'firebase' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-400">Firebase Firestore NoSQL Document Tree</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(FIREBASE_FIRESTORE_MODEL, null, 2), 'Firestore Model')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="p-3 bg-neutral-900 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto max-h-64 leading-relaxed">
                  {JSON.stringify(FIREBASE_FIRESTORE_MODEL.collections, null, 2)}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="text-xs font-mono font-bold text-neutral-300">
                  Firebase Security Rules (firestore.rules)
                </div>
                <pre className="p-3 bg-neutral-900 rounded-lg text-xs font-mono text-neutral-300 overflow-x-auto max-h-48 leading-relaxed">
                  {FIREBASE_FIRESTORE_MODEL.securityRules}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Local Storage */}
          {activeTab === 'localstorage' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Active Browser LocalStorage Keys</span>
                <button
                  onClick={loadStorageData}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload Keys</span>
                </button>
              </div>

              <div className="space-y-3">
                {storageItems.map((item) => (
                  <div key={item.key} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-amber-300">{item.key}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(item.value, item.key)}
                          className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => {
                            localStorage.removeItem(item.key);
                            loadStorageData();
                            showToast(`Cleared key ${item.key}`, 'info');
                          }}
                          className="text-neutral-400 hover:text-rose-400 cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <pre className="p-2.5 bg-neutral-900 rounded text-xs font-mono text-neutral-300 overflow-x-auto max-h-36 leading-relaxed">
                      {item.value}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: JSON Export & Backup */}
          {activeTab === 'json-export' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-100 font-mono">
                    Full Database Snapshot & JSON Serialization
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Export all culinary menu items, current shopping cart, user session, past orders, and database schema mappings as a portable JSON payload.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleDownloadJsonBackup}
                    className="px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Database File</span>
                  </button>

                  <button
                    onClick={() => {
                      const snap = {
                        menu: MENU_ITEMS,
                        cart,
                        orders,
                        user,
                      };
                      copyToClipboard(JSON.stringify(snap, null, 2), 'Snapshot JSON');
                    }}
                    className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs font-mono flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Full State JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { api, storage, STORAGE_KEYS } from '../services/api';
import { formatPhp } from '../utils/format';
import { Clock, CheckCircle2, Bike, ChefHat, MapPin, Phone, Star, Download, RotateCcw, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, activeOrder, setActiveOrder, refreshOrders, addToCart, setActivePage, showToast } = useApp();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    refreshOrders();
  }, []);

  // Simulator for advancing the live delivery status
  const handleAdvanceStatus = (order: Order) => {
    const statuses: OrderStatus[] = ['confirmed', 'preparing', 'dispatched', 'delivered'];
    const currentIdx = statuses.indexOf(order.status);
    const nextIdx = (currentIdx + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];

    const updatedOrder: Order = {
      ...order,
      status: nextStatus,
      estimatedMinutesLeft: nextStatus === 'delivered' ? 0 : Math.max(5, order.estimatedMinutesLeft - 8),
      courier: {
        ...order.courier,
        currentStepIndex: nextIdx,
      },
    };

    const currentOrders = storage.get<Order[]>(STORAGE_KEYS.ORDERS, []);
    const updatedList = currentOrders.map((o) => (o.id === order.id ? updatedOrder : o));
    storage.set(STORAGE_KEYS.ORDERS, updatedList);
    setActiveOrder(updatedOrder);
    refreshOrders();

    showToast(`Simulation: Order #${order.orderNumber} is now "${nextStatus.toUpperCase()}".`);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.dish, item.quantity, {
        selectedSize: item.selectedSize,
        selectedSizePriceDelta: item.selectedSizePriceDelta,
        selectedSpice: item.selectedSpice,
        selectedAddOns: item.selectedAddOns,
        specialInstructions: item.specialInstructions,
      });
    });
    showToast(`Re-added ${order.items.length} dishes to your bag!`);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadInvoice = (order: Order) => {
    const invoice = {
      invoiceNumber: `INV-${order.orderNumber}`,
      issuedAt: order.createdAt,
      restaurant: 'Aura Bistro Flagship',
      customer: order.customer,
      items: order.items.map((i) => ({
        dish: i.dish.name,
        size: i.selectedSize,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        itemTotal: i.itemTotal,
      })),
      financials: {
        currency: 'PHP',
        subtotal: order.subtotal,
        discount: order.discount,
        deliveryFee: order.deliveryFee,
        tax: order.tax,
        tip: order.tip,
        total: order.total,
      },
      payment: order.payment,
    };

    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_invoice_${order.orderNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded official JSON receipt for #${order.orderNumber}`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    if (!reviewComment.trim()) {
      showToast('Please provide your review feedback.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.submitReview({
        dishId: reviewOrder.items[0]?.dish.id || 'dish-1',
        dishName: reviewOrder.items[0]?.dish.name || 'Gourmet Order',
        authorName: reviewOrder.customer.fullName,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      // mark review as submitted on the order
      const currentOrders = storage.get<Order[]>(STORAGE_KEYS.ORDERS, []);
      const updatedList = currentOrders.map((o) =>
        o.id === reviewOrder.id ? { ...o, reviewSubmitted: true } : o
      );
      storage.set(STORAGE_KEYS.ORDERS, updatedList);
      refreshOrders();

      showToast('Thank you! Your verified diner review has been submitted.');
      setReviewOrder(null);
      setReviewComment('');
    } catch {
      showToast('Failed to submit review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const currentDisplayOrder = activeOrder || (orders.length > 0 ? orders[0] : null);

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 25;
      case 'preparing':
        return 50;
      case 'dispatched':
        return 75;
      case 'delivered':
        return 100;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-amber-400">Order Management</div>
        <h1 className="text-3xl font-bold text-neutral-100 font-serif mt-1">
          Live Dispatch & Order History
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Follow real-time courier telemetry, inspect itemized receipts, and leave culinary reviews.
        </p>
      </div>

      {/* ACTIVE ORDER LIVE TRACKER */}
      {currentDisplayOrder ? (
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Tracker Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span>ORDER #{currentDisplayOrder.orderNumber}</span>
                <span>·</span>
                <span>Placed at {new Date(currentDisplayOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-serif mt-1">
                {currentDisplayOrder.status === 'delivered'
                  ? 'Delivered to Doorstep'
                  : currentDisplayOrder.status === 'dispatched'
                  ? 'Courier En Route with Thermal Pod'
                  : currentDisplayOrder.status === 'preparing'
                  ? 'Kitchen Team is Wood-Oven Firing'
                  : 'Order Confirmed & Queued'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {currentDisplayOrder.status !== 'delivered' && (
                <div className="px-4 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>ETA ~ {currentDisplayOrder.estimatedMinutesLeft} Minutes</span>
                </div>
              )}

              {/* Status advancement simulation button for testing */}
              <button
                onClick={() => handleAdvanceStatus(currentDisplayOrder)}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Advance order status to next stage in simulation"
              >
                <span>Advance State</span>
                <span className="text-[10px] text-amber-400">⚡</span>
              </button>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div className="space-y-4">
            <div className="relative">
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-700 rounded-full"
                  style={{ width: `${getStepProgress(currentDisplayOrder.status)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { label: 'Confirmed', icon: CheckCircle2, status: 'confirmed' },
                { label: 'In Kitchen', icon: ChefHat, status: 'preparing' },
                { label: 'On The Way', icon: Bike, status: 'dispatched' },
                { label: 'Delivered', icon: MapPin, status: 'delivered' },
              ].map((step, idx) => {
                const Icon = step.icon;
                const isPassed = getStepProgress(currentDisplayOrder.status) >= (idx + 1) * 25;
                const isCurrent = currentDisplayOrder.status === step.status;

                return (
                  <div key={step.label} className="space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center transition-colors ${
                        isPassed
                          ? 'bg-amber-400 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-500'
                      } ${isCurrent ? 'ring-2 ring-amber-400/40 ring-offset-2 ring-offset-neutral-900' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-medium block truncate ${
                        isPassed ? 'text-neutral-200' : 'text-neutral-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Simulated Map & Courier Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Courier Card */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Dedicated Courier
                </div>
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <span>★ {currentDisplayOrder.courier.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 font-serif font-bold text-lg">
                  {currentDisplayOrder.courier.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-100">{currentDisplayOrder.courier.name}</div>
                  <div className="text-xs text-neutral-400">{currentDisplayOrder.courier.vehicle}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-400 font-mono">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentDisplayOrder.courier.phone}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">Thermal Temp: 68°C</span>
              </div>
            </div>

            {/* Interactive Simulated Route Map Graphic */}
            <div className="lg:col-span-7 relative h-48 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center">
              {/* Simulated Map Grid */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* Simulated Map Road & Waypoints */}
              <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 60 120 Q 220 50 380 120 T 640 80"
                  fill="none"
                  stroke="#44403c"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                />
                <path
                  d="M 60 120 Q 220 50 380 120 T 640 80"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDashoffset={100 - getStepProgress(currentDisplayOrder.status)}
                  className="transition-all duration-700"
                />
              </svg>

              {/* Waypoint 1: Kitchen */}
              <div className="absolute left-8 top-20 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400 shadow-md">
                  <ChefHat className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 mt-1">Aura Kitchen</span>
              </div>

              {/* Waypoint 2: Moving Courier */}
              <div
                className="absolute top-14 transition-all duration-700 flex flex-col items-center"
                style={{
                  left: `${Math.min(85, Math.max(15, getStepProgress(currentDisplayOrder.status) * 0.85))}%`,
                }}
              >
                <div className="w-8 h-8 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg animate-bounce">
                  <Bike className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold mt-1">Courier</span>
              </div>

              {/* Waypoint 3: Destination */}
              <div className="absolute right-8 top-12 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-rose-400 shadow-md">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 mt-1">Your Doorstep</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 font-mono">
              Delivery to: <span className="text-neutral-200">{currentDisplayOrder.customer.streetAddress}, {currentDisplayOrder.customer.city}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownloadInvoice(currentDisplayOrder)}
                className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON Receipt</span>
              </button>

              {currentDisplayOrder.status === 'delivered' && !currentDisplayOrder.reviewSubmitted && (
                <button
                  onClick={() => setReviewOrder(currentDisplayOrder)}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Rate Dishes</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <p className="text-sm font-semibold text-neutral-200 font-serif">No active orders in transit.</p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Place an order from our chef menu to experience real-time doorstep dispatch tracking.
          </p>
          <button
            onClick={() => setActivePage('menu')}
            className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs cursor-pointer"
          >
            Explore Menu
          </button>
        </div>
      )}

      {/* PAST ORDERS ARCHIVE */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-100 font-serif">All Order Archives</h2>

        {orders.length === 0 ? (
          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-500 font-mono text-center">
            Zero past transactions found in browser storage.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => {
              const isExpanded = expandedOrderId === ord.id;
              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-neutral-200">#{ord.orderNumber}</span>
                        <span>·</span>
                        <span className="text-neutral-500">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <span className="text-amber-400 font-bold">{formatPhp(ord.total)}</span>
                      </div>
                      <div className="text-xs text-neutral-400 truncate max-w-md">
                        {ord.items.map((it) => `${it.quantity}x ${it.dish.name}`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReorder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Reorder all items"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400" />
                        <span>Reorder</span>
                      </button>

                      <button
                        onClick={() => handleDownloadInvoice(ord)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title="Download JSON receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title="Expand details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable item details */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-neutral-800/80 space-y-2 text-xs">
                      <div className="font-semibold text-neutral-300 font-mono">Itemized Contents:</div>
                      <div className="divide-y divide-neutral-800/60">
                        {ord.items.map((it) => (
                          <div key={it.id} className="py-2 flex items-center justify-between text-neutral-400">
                            <div>
                              <span className="text-neutral-200">{it.quantity}x {it.dish.name}</span>
                              {it.selectedSize && <span className="text-[11px] ml-2">({it.selectedSize})</span>}
                            </div>
                            <span className="font-mono tabular-nums">{formatPhp(it.itemTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REVIEW SUBMISSION MODAL */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div>
              <div className="text-xs font-mono uppercase text-amber-400">Culinary Feedback</div>
              <h3 className="text-lg font-bold text-neutral-100 font-serif mt-1">
                Rate Order #{reviewOrder.orderNumber}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Share your impressions of taste, thermal condition, and presentation.
              </p>
            </div>

            {/* Star Rating Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">Overall Score</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= reviewRating ? 'fill-amber-400' : 'text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">Diner Review *</label>
              <textarea
                rows={3}
                placeholder="How was the crust blister? The Wagyu doneness? Delivery speed?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

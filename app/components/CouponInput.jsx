/**
 * Coupon Code Input Component for Checkout
 */
'use client';

import { useState } from 'react';

export default function CouponInput({ cartTotal, onCouponApplied }) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState(null);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Ingresa un código de cupón');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setError(data.message || 'Cupón inválido');
        setAppliedCoupon(null);
        onCouponApplied(null);
        return;
      }

      // Success!
      setAppliedCoupon(data);
      onCouponApplied(data);
      setError(null);
    } catch (err) {
      console.error('Error validating coupon:', err);
      setError('Error al validar el cupón. Intenta nuevamente.');
      setAppliedCoupon(null);
      onCouponApplied(null);
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    onCouponApplied(null);
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateCoupon();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold mb-3 text-gray-800">¿Tienes un cupón de descuento?</h3>

      {appliedCoupon ? (
        // Coupon applied - show success state
        <div className="flex items-center justify-between bg-green-50 border-2 border-green-400 rounded-lg p-4">
          <div>
            <p className="font-bold text-green-800">{appliedCoupon.coupon.code}</p>
            <p className="text-sm text-green-700">
              Descuento aplicado: ${appliedCoupon.discount.toFixed(2)} MXN
            </p>
            {appliedCoupon.coupon.description && (
              <p className="text-xs text-green-600 mt-1">{appliedCoupon.coupon.description}</p>
            )}
          </div>
          <button
            onClick={removeCoupon}
            className="text-red-600 hover:text-red-800 font-medium text-sm hover:underline transition"
          >
            Remover
          </button>
        </div>
      ) : (
        // Input state
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder="CODIGO"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-[#092536] focus:border-transparent transition"
              disabled={isValidating}
            />
            <button
              onClick={validateCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="bg-[#092536] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0a3a52] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? 'Validando...' : 'Aplicar'}
            </button>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

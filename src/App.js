import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // =======================
  // State Declarations
  // =======================
  const [rawAmount, setRawAmount] = useState('');
  const [rawSats, setRawSats] = useState('');
  const [conversionRate, setConversionRate] = useState(0); // Real-time rate
  const [currency, setCurrency] = useState(getSavedCurrency());

  // =======================
  // Constants
  // =======================
  const currencies = {
    cad: 'CAD',
    usd: 'USD',
    jpy: 'JPY',
    php: 'PHP'
  };

  // =======================
  // Utility Functions
  // =======================

  /**
   * Retrieves the saved currency from localStorage.
   * Defaults to 'cad' if not found or on error.
   */
  function getSavedCurrency() {
    try {
      const saved = localStorage.getItem('selectedCurrency');
      return saved ? saved : 'cad';
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return 'cad';
    }
  }

  /**
   * Formats a number with commas and specified decimal places.
   * @param {number} value - The number to format.
   * @param {number} decimalPlaces - Number of decimal places.
   * @returns {string} - Formatted number.
   */
  function formatAmount(value, decimalPlaces = 2) {
    return new Intl.NumberFormat('en-CA', {
      style: 'decimal',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(value);
  }

  // =======================
  // API Functions
  // =======================

  /**
   * Fetches the conversion rate for the selected currency from CoinGecko.
   * @param {string} selectedCurrency - The currency code (e.g., 'usd').
   */
  async function fetchConversionRate(selectedCurrency) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${selectedCurrency}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const rate = data.bitcoin[selectedCurrency];
      setConversionRate(rate);
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      setConversionRate(0); // Optionally reset to 0 on error
    }
  }

  // =======================
  // Effect Hooks
  // =======================

  // Fetch conversion rate on initial render and when currency changes
  useEffect(() => {
    fetchConversionRate(currency);
  }, [currency]);

  // Save selected currency to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('selectedCurrency', currency);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [currency]);

  // =======================
  // Event Handlers
  // =======================

  /**
   * Handles changes in the amount input field.
   * Converts the entered amount to SATS.
   * @param {object} e - Event object.
   */
  function handleAmountChange(e) {
    const rawAmountValue = e.target.value.replace(/,/g, ''); // Remove commas
    setRawAmount(rawAmountValue);

    const amountValue = parseFloat(rawAmountValue);
    if (!isNaN(amountValue) && conversionRate > 0) {
      const satsValue = (amountValue / conversionRate) * 100000000; // Convert to SATS
      setRawSats(formatAmount(satsValue, 0)); // SATS has no decimal places
    } else {
      setRawSats('');
    }
  }

  /**
   * Handles changes in the SATS input field.
   * Converts the entered SATS to the selected currency.
   * @param {object} e - Event object.
   */
  function handleSatsChange(e) {
    const rawSatsValue = e.target.value.replace(/,/g, ''); // Remove commas
    setRawSats(rawSatsValue);

    const satsValue = parseFloat(rawSatsValue);
    if (!isNaN(satsValue) && conversionRate > 0) {
      const amountValue = (satsValue / 100000000) * conversionRate; // Convert SATS to currency
      setRawAmount(formatAmount(amountValue));
    } else {
      setRawAmount('');
    }
  }

  // =======================
  // Render
  // =======================

  return (
    <div className="App">
      <img
        src={`${process.env.PUBLIC_URL}/logo512.png`}
        alt="SATS Converter Logo"
        className="app-logo"
      />
      <h1>Currency to SATS Converter</h1>

      {/* Currency Selector */}
      <div className="currency-selector">
        <label htmlFor="currency-select">Choose a currency: </label>
        <select
          id="currency-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {Object.keys(currencies).map((curr) => (
            <option key={curr} value={curr}>
              {currencies[curr]}
            </option>
          ))}
        </select>
      </div>

      {/* Conversion Rate Display */}
      <p>
        Current BTC to {currencies[currency]} rate:{' '}
        {conversionRate ? formatAmount(conversionRate) : 'Loading...'}
      </p>

      {/* Amount Input */}
      <div className="input-group">
        <label htmlFor="amount-input">{currencies[currency]}: </label>
        <input
          type="text"
          id="amount-input"
          value={rawAmount}
          onChange={handleAmountChange}
          placeholder={`Enter ${currencies[currency]} amount`}
        />
      </div>

      {/* SATS Input */}
      <div className="input-group">
        <label htmlFor="sats-input">SATS: </label>
        <input
          type="text"
          id="sats-input"
          value={rawSats}
          onChange={handleSatsChange}
          placeholder="Enter SATS amount"
        />
      </div>

      {/* External Link */}
      <div className="external-link">
        <small>
          <a
            href={`https://www.coingecko.com/en/coins/bitcoin/${currency}`}
            target="_blank"
            rel="noreferrer"
          >
            (CoinGecko - {currencies[currency]})
          </a>
        </small>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [rawAmount, setRawAmount] = useState('');
  const [rawSats, setRawSats] = useState('');
  const [conversionRate, setConversionRate] = useState(0); // Real-time rate
  const [currency, setCurrency] = useState('cad'); // Default currency is CAD

  // Supported currencies and their CoinGecko IDs
  const currencies = {
    cad: 'CAD',
    usd: 'USD',
    jpy: 'JPY',
    php: 'PHP'
  };

  // Function to fetch the conversion rate based on selected currency
  const fetchConversionRate = async (selectedCurrency) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${selectedCurrency}`);
      const data = await response.json();
      const rate = data.bitcoin[selectedCurrency];
      setConversionRate(rate);
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
    }
  };

  // Fetch the conversion rate whenever the selected currency changes
  useEffect(() => {
    fetchConversionRate(currency);
  }, [currency]);

  // Function to format amount with commas and decimals
  const formatAmount = (value, decimalPlaces = 2) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'decimal',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(value);
  };

  // Convert selected currency to SATS using real-time conversion
  const handleAmountChange = (e) => {
    const rawAmountValue = e.target.value.replace(/,/g, ''); // Remove commas for input
    setRawAmount(rawAmountValue);

    const amountValue = parseFloat(rawAmountValue);
    if (!isNaN(amountValue)) {
      const satsValue = (amountValue / conversionRate) * 100000000; // Convert to SATS
      setRawSats(formatAmount(satsValue, 0)); // SATS has no decimal places
    } else {
      setRawSats('');
    }
  };

  // Convert SATS to the selected currency using real-time conversion
  const handleSatsChange = (e) => {
    const rawSatsValue = e.target.value.replace(/,/g, ''); // Remove commas for input
    setRawSats(rawSatsValue);

    const satsValue = parseFloat(rawSatsValue);
    if (!isNaN(satsValue)) {
      const amountValue = (satsValue / 100000000) * conversionRate; // Convert SATS to selected currency
      setRawAmount(formatAmount(amountValue));
    } else {
      setRawAmount('');
    }
  };

  return (
    <div className="App">
      <h1>Currency to SATS Converter</h1>

      {/* Currency Selector */}
      <div>
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

      <p>
        Current BTC to {currencies[currency]} rate: {conversionRate ? formatAmount(conversionRate) : 'Loading...'}
      </p>

      <div>
        <label htmlFor="amount-input">{currencies[currency]}: </label>
        <input
          type="text"
          id="amount-input"
          value={rawAmount}
          onChange={handleAmountChange}
          placeholder={`Enter ${currencies[currency]} amount`}
        />
      </div>

      <div>
        <label htmlFor="sats-input">SATS: </label>
        <input
          type="text"
          id="sats-input"
          value={rawSats}
          onChange={handleSatsChange}
          placeholder="Enter SATS amount"
        />
      </div>

      <div>
        <small>
          <a href={`https://www.coingecko.com/en/coins/bitcoin/${currency}`} target="_blank" rel="noreferrer">
            (CoinGecko - {currencies[currency]})
          </a>
        </small>
      </div>
    </div>
  );
}

export default App;

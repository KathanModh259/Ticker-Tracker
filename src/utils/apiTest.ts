// API Test Utility
// This file helps test if your API keys are working correctly

import { financialDataService } from '@/services/financialDataService';

export const testApiKeys = async () => {
  console.log('🔍 Testing API Keys...');
  
  // Test symbols
  const testSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY'];
  
  try {
    console.log('📊 Fetching test data...');
    const quotes = await financialDataService.getQuotes(testSymbols);
    
    console.log('✅ API Test Results:');
    console.log(`📈 Successfully fetched ${quotes.length} quotes`);
    
    quotes.forEach((quote, index) => {
      console.log(`${index + 1}. ${quote.symbol}: $${quote.price.toFixed(2)} (${quote.changePercent.toFixed(2)}%)`);
    });
    
    if (quotes.length > 0) {
      console.log('🎉 Real data is working! Your API keys are configured correctly.');
      return true;
    } else {
      console.log('⚠️ No data received. Check your API keys.');
      return false;
    }
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return false;
  }
};

// Test individual APIs
export const testIndividualApis = async () => {
  console.log('🔍 Testing Individual APIs...');
  
  const testSymbol = 'AAPL';
  
  try {
    // Test FMP
    console.log('Testing Financial Modeling Prep...');
    const fmpData = await (financialDataService as any).fetchFromFMP(testSymbol);
    if (fmpData) {
      console.log('✅ FMP API working');
    } else {
      console.log('❌ FMP API failed');
    }
  } catch (error) {
    console.log('❌ FMP API error:', error);
  }
  
  try {
    // Test Yahoo Finance
    console.log('Testing Yahoo Finance...');
    const yahooData = await (financialDataService as any).fetchFromYahooFinance(testSymbol);
    if (yahooData) {
      console.log('✅ Yahoo Finance API working');
    } else {
      console.log('❌ Yahoo Finance API failed');
    }
  } catch (error) {
    console.log('❌ Yahoo Finance API error:', error);
  }
  
  try {
    // Test Alpha Vantage
    console.log('Testing Alpha Vantage...');
    const avData = await (financialDataService as any).fetchFromAlphaVantage(testSymbol);
    if (avData) {
      console.log('✅ Alpha Vantage API working');
    } else {
      console.log('❌ Alpha Vantage API failed');
    }
  } catch (error) {
    console.log('❌ Alpha Vantage API error:', error);
  }
  
  try {
    // Test Finnhub
    console.log('Testing Finnhub...');
    const finnhubData = await (financialDataService as any).fetchFromFinnhub(testSymbol);
    if (finnhubData) {
      console.log('✅ Finnhub API working');
    } else {
      console.log('❌ Finnhub API failed');
    }
  } catch (error) {
    console.log('❌ Finnhub API error:', error);
  }
};

// Check environment variables
export const checkEnvVars = () => {
  console.log('🔍 Checking Environment Variables...');
  
  const envVars = [
    'VITE_FINANCIAL_MODELING_PREP_API_KEY',
    'VITE_ALPHA_VANTAGE_API_KEY',
    'VITE_FINNHUB_API_KEY',
    'VITE_POLYGON_API_KEY',
    'VITE_NEWS_API_KEY'
  ];
  
  envVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (value && value !== `your_${varName.toLowerCase().replace('vite_', '').replace('_api_key', '')}_api_key_here`) {
      console.log(`✅ ${varName}: Configured`);
    } else {
      console.log(`❌ ${varName}: Not configured or using placeholder`);
    }
  });
};

from kiteconnect import KiteConnect
from kiteconnect import KiteTicker
import os
import json
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from fastapi import HTTPException
from typing import Dict, Set, Callable

load_dotenv()

class ZerodhaService:
    def __init__(self):
        self.api_key = os.getenv('ZERODHA_API_KEY', '')
        self.api_secret = os.getenv('ZERODHA_API_SECRET', '')
        self.access_token = os.getenv('ZERODHA_ACCESS_TOKEN', '')
        self.base_url = os.getenv('BASE_URL', 'http://localhost:8000')
        
        if not self.api_key or not self.api_secret:
            raise ValueError("Zerodha API key and secret must be set in .env file")
            
        self.redirect_url = f"{self.base_url}/api/zerodha/callback"
        self.kite = KiteConnect(api_key=self.api_key)
        
        self.ticker = None
        self.subscribed_tokens: Set[int] = set()
        self.token_symbol_map: Dict[int, str] = {}
        self.symbol_token_map: Dict[str, int] = {}
        self.tick_callbacks: Dict[int, Set[Callable]] = {}
        self.order_callbacks: Set[Callable] = set()
        self.margin_callbacks: Set[Callable] = set()
        
        print(f"Zerodha service initialized with API key ending in ...{self.api_key[-4:]}")
        
        if self.access_token:
            self.kite.set_access_token(self.access_token)
            self._init_ticker()

    def get_login_url(self) -> str:
        """Generate the login URL for Zerodha OAuth"""
        try:
            url = self.kite.login_url()
            print(f"Generated login URL: {url}")
            print(f"Redirect URL: {self.redirect_url}")
            return url
        except Exception as e:
            print(f"Error generating login URL: {e}")
            raise
    
    def _init_ticker(self):
        """Initialize the WebSocket ticker"""
        if self.access_token:
            try:
                self.ticker = KiteTicker(self.api_key, self.access_token)
                self.ticker.connect(threaded=True)
                self._setup_ticker_callbacks()
                print("WebSocket ticker initialized")
            except Exception as e:
                print(f"Error initializing ticker: {e}")
                self.ticker = None
    
    def _setup_ticker_callbacks(self):
        """Set up WebSocket callbacks"""
        if not self.ticker:
            print("No ticker available for setting up callbacks")
            return

        @self.ticker.on_ticks
        def handle_ticks(ws, ticks):
            for tick in ticks:
                token = tick['instrument_token']
                if token in self.tick_callbacks:
                    symbol = self.token_symbol_map.get(token)
                    if symbol:
                        tick_data = {
                            'symbol': symbol,
                            'last_price': tick.get('last_price'),
                            'volume': tick.get('volume'),
                            'change': tick.get('change'),
                            'high': tick.get('high'),
                            'low': tick.get('low'),
                            'timestamp': datetime.fromtimestamp(tick.get('timestamp', 0)).isoformat()
                        }
                        for callback in self.tick_callbacks[token]:
                            asyncio.create_task(callback(tick_data))

        @self.ticker.on_connect
        def handle_connect(ws):
            print("WebSocket connected")
            if self.subscribed_tokens:
                self.ticker.subscribe(list(self.subscribed_tokens))
                self.ticker.set_mode(self.ticker.MODE_FULL, list(self.subscribed_tokens))

        @self.ticker.on_disconnect
        def handle_disconnect(ws, code, reason):
            print(f"WebSocket disconnected. Code: {code}, Reason: {reason}")

        @self.ticker.on_error
        def handle_error(ws, code, reason):
            print(f"WebSocket error. Code: {code}, Reason: {reason}")

    async def login(self, request_token: str = None):
        """Generate access token using request token"""
        try:
            if not request_token:
                return {"status": "error", "message": "No request token provided"}

            print(f"Generating session with request token: {request_token}")
            data = self.kite.generate_session(
                request_token=request_token,
                api_secret=self.api_secret
            )
            
            self.access_token = data["access_token"]
            self.kite.set_access_token(self.access_token)
            
            print(f"Successfully generated access token ending in ...{self.access_token[-4:]}")
            
            # Initialize ticker with new access token
            self._init_ticker()
            
            return {
                "status": "success",
                "access_token": self.access_token,
                "user_id": data.get("user_id"),
                "user_name": data.get("user_name"),
                "login_time": data.get("login_time")
            }
        except Exception as e:
            print(f"Login error: {e}")
            raise HTTPException(status_code=401, detail=str(e))

    async def get_quote(self, symbol: str):
        """Get real-time quotes for a symbol"""
        try:
            # Convert symbol to Zerodha instrument token format if needed
            # e.g., NSE:RELIANCE or BSE:RELIANCE
            quote = self.kite.quote(symbol)
            return {
                "symbol": symbol,
                "price": quote[symbol]["last_price"],
                "change": quote[symbol]["change"],
                "high": quote[symbol]["ohlc"]["high"],
                "low": quote[symbol]["ohlc"]["low"],
                "volume": quote[symbol]["volume"],
                "timestamp": quote[symbol]["timestamp"].isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_historical(self, symbol: str, interval: str, from_date: str, to_date: str):
        """Get historical data for a symbol"""
        try:
            # Convert dates to expected format
            data = self.kite.historical_data(
                symbol,
                from_date=from_date,
                to_date=to_date,
                interval=interval
            )
            return data
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def place_order(self, symbol: str, quantity: int, order_type: str, 
                         transaction_type: str, product: str = "CNC"):
        """Place an order"""
        try:
            order_id = self.kite.place_order(
                variety="regular",
                exchange="NSE",
                tradingsymbol=symbol,
                transaction_type=transaction_type,  # "BUY" or "SELL"
                quantity=quantity,
                product=product,  # "CNC" for delivery, "MIS" for intraday
                order_type=order_type  # "MARKET", "LIMIT", etc.
            )
            return {"status": "success", "order_id": order_id}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_positions(self):
        """Get current positions"""
        try:
            positions = self.kite.positions()
            return positions
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_holdings(self):
        """Get holdings/portfolio"""
        try:
            holdings = self.kite.holdings()
            return holdings
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def subscribe_to_ticks(self, symbol: str, callback: Callable):
        """Subscribe to real-time ticks for a symbol"""
        try:
            # Get instrument token for the symbol
            instruments = self.kite.instruments("NSE")
            instrument = next((i for i in instruments if i['tradingsymbol'] == symbol), None)
            
            if not instrument:
                raise HTTPException(status_code=400, detail=f"Symbol {symbol} not found")
            
            token = instrument['instrument_token']
            self.token_symbol_map[token] = symbol
            self.symbol_token_map[symbol] = token
            
            # Add callback
            if token not in self.tick_callbacks:
                self.tick_callbacks[token] = set()
            self.tick_callbacks[token].add(callback)
            
            # Subscribe to token if not already subscribed
            if token not in self.subscribed_tokens:
                self.subscribed_tokens.add(token)
                if self.ticker and self.ticker.is_connected():
                    self.ticker.subscribe([token])
                    self.ticker.set_mode(self.ticker.MODE_FULL, [token])
            
            return {"status": "success", "message": f"Subscribed to {symbol}"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def unsubscribe_from_ticks(self, symbol: str, callback: Callable = None):
        """Unsubscribe from real-time ticks for a symbol"""
        try:
            token = self.symbol_token_map.get(symbol)
            if not token:
                raise HTTPException(status_code=400, detail=f"Not subscribed to {symbol}")

            if callback and token in self.tick_callbacks:
                self.tick_callbacks[token].discard(callback)
                if not self.tick_callbacks[token]:
                    del self.tick_callbacks[token]
                    self.subscribed_tokens.discard(token)
                    if self.ticker and self.ticker.is_connected():
                        self.ticker.unsubscribe([token])
            elif not callback:
                # Remove all callbacks for this token
                if token in self.tick_callbacks:
                    del self.tick_callbacks[token]
                self.subscribed_tokens.discard(token)
                if self.ticker and self.ticker.is_connected():
                    self.ticker.unsubscribe([token])

            return {"status": "success", "message": f"Unsubscribed from {symbol}"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def handle_order_update(self, data: dict):
        """Handle order update postback notifications"""
        try:
            # Process the order update
            order_id = data.get("order_id")
            status = data.get("status")
            
            # Notify all registered callbacks
            for callback in self.order_callbacks:
                await callback({
                    "order_id": order_id,
                    "status": status,
                    "symbol": data.get("tradingsymbol"),
                    "transaction_type": data.get("transaction_type"),
                    "quantity": data.get("quantity"),
                    "filled_quantity": data.get("filled_quantity"),
                    "price": data.get("price"),
                    "average_price": data.get("average_price"),
                    "trigger_price": data.get("trigger_price"),
                    "exchange": data.get("exchange")
                })
        except Exception as e:
            print(f"Error handling order update: {e}")

    async def handle_margin_update(self, data: dict):
        """Handle margin update postback notifications"""
        try:
            # Process the margin update
            # Notify all registered callbacks
            for callback in self.margin_callbacks:
                await callback({
                    "type": "margin",
                    "available_margin": data.get("available_margin"),
                    "used_margin": data.get("used_margin"),
                    "allocated_margin": data.get("allocated_margin"),
                    "timestamp": datetime.now().isoformat()
                })
        except Exception as e:
            print(f"Error handling margin update: {e}")

# Initialize Zerodha service
zerodha_service = ZerodhaService()
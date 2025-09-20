from fastapi import FastAPI, WebSocket, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import yfinance as yf
import asyncio
import json
import uvicorn
from datetime import datetime
from typing import Optional
from zerodha_service import zerodha_service
import os
from dotenv import load_dotenv

load_dotenv()

# Get the frontend URL from environment variable
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
active_connections = []

# Cache for storing latest ticker data
ticker_cache = {}

# Zerodha endpoints
@app.get("/api/zerodha/test")
async def test_zerodha():
    """Test Zerodha connection and return basic market status"""
    try:
        return {
            "status": "success",
            "api_key": zerodha_service.api_key[-4:],  # Last 4 chars for verification
            "is_connected": zerodha_service.kite is not None,
            "has_access_token": bool(zerodha_service.access_token)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/zerodha/login")
async def zerodha_login():
    """
    Initiates the Zerodha login flow.
    Redirect URL should be set to: http://localhost:8000/api/zerodha/callback
    """
    login_url = zerodha_service.get_login_url()
    print(f"Login URL: {login_url}")  # For debugging
    return RedirectResponse(login_url)

@app.get("/api/zerodha/callback")
async def zerodha_callback(request_token: str = Query(None), status: str = Query(None)):
    """
    Handles the redirect from Zerodha after login.
    This should be registered as your redirect URL in Zerodha Console:
    http://localhost:8000/api/zerodha/callback
    """
    if status != "success" or not request_token:
        return RedirectResponse(
            f"{FRONTEND_URL}/auth?error=Login failed: {status}"
        )
    
    try:
        # Exchange request token for access token
        result = await zerodha_service.login(request_token)
        # Redirect back to frontend with success
        return RedirectResponse(
            f"{FRONTEND_URL}/auth?token={result['access_token']}"
        )
    except Exception as e:
        return RedirectResponse(
            f"{FRONTEND_URL}/auth?error=Login failed: {str(e)}"
        )

@app.post("/api/zerodha/postback")
async def zerodha_postback(request: Request):
    """
    Handles postback notifications from Zerodha.
    This should be registered as your postback URL in Zerodha Console:
    http://localhost:8000/api/zerodha/postback
    """
    try:
        data = await request.json()
        # Handle different types of postback notifications
        if data.get("type") == "order_update":
            await zerodha_service.handle_order_update(data)
        elif data.get("type") == "margin_update":
            await zerodha_service.handle_margin_update(data)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/zerodha/quote/{symbol}")
async def get_zerodha_quote(symbol: str):
    return await zerodha_service.get_quote(symbol)

@app.get("/api/zerodha/historical/{symbol}")
async def get_zerodha_historical(
    symbol: str,
    interval: str = Query("day"),
    from_date: str = Query(...),
    to_date: str = Query(...)
):
    return await zerodha_service.get_historical(symbol, interval, from_date, to_date)

@app.post("/api/zerodha/order")
async def place_zerodha_order(
    symbol: str = Query(...),
    quantity: int = Query(...),
    order_type: str = Query(...),
    transaction_type: str = Query(...),
    product: Optional[str] = Query("CNC")
):
    return await zerodha_service.place_order(
        symbol, quantity, order_type, transaction_type, product
    )

@app.get("/api/zerodha/positions")
async def get_zerodha_positions():
    return await zerodha_service.get_positions()

@app.get("/api/zerodha/holdings")
async def get_zerodha_holdings():
    return await zerodha_service.get_holdings()

@app.get("/api/ticker/{symbol}")
async def get_ticker_info(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return {
            "symbol": symbol,
            "name": info.get("longName", ""),
            "price": info.get("regularMarketPrice", 0),
            "change": info.get("regularMarketChange", 0),
            "changePercent": info.get("regularMarketChangePercent", 0),
            "volume": info.get("regularMarketVolume", 0),
            "marketCap": info.get("marketCap", 0),
            "exchange": info.get("exchange", ""),
        }
    except Exception as e:
        return {"error": str(e)}

@app.websocket("/ws/ticker")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    
    async def send_tick_update(tick_data: dict):
        try:
            await websocket.send_json(tick_data)
        except Exception as e:
            print(f"Error sending tick data: {e}")
    
    try:
        # Receive and process the symbol subscription
        data = await websocket.receive_text()
        symbols = json.loads(data)
        
        # Subscribe to Zerodha ticks for each symbol
        for symbol in symbols:
            try:
                await zerodha_service.subscribe_to_ticks(symbol, send_tick_update)
            except Exception as e:
                print(f"Error subscribing to {symbol}: {e}")
                # Fallback to yfinance for non-Indian markets
                while True:
                    try:
                        ticker = yf.Ticker(symbol)
                        price = ticker.info.get("regularMarketPrice", 0)
                        await websocket.send_json({
                            "symbol": symbol,
                            "price": price,
                            "timestamp": str(ticker.info.get("regularMarketTime", "")),
                        })
                    except Exception as e:
                        print(f"Error getting data for {symbol}: {e}")
                    await asyncio.sleep(1)  # Rate limiting
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections.remove(websocket)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        ssl_keyfile="certs/key.pem",
        ssl_certfile="certs/cert.pem"
    )
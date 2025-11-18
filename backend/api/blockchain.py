from fastapi import APIRouter
from services.blockchain_service import blockchain_service

router = APIRouter()

@router.get("/status")
async def get_blockchain_status():
    """Get blockchain connection status"""
    status = blockchain_service.get_connection_status()
    
    return {
        "blockchain_enabled": status['has_key'],
        "connected": status['connected'],
        "chain_id": status['chain_id'],
        "network": "Polygon Amoy Testnet",
        "wallet_address": status.get('address'),
        "balance_pol": status.get('balance', 0),
        "current_block": status.get('block_number'),
        "gas_price_gwei": status.get('gas_price_gwei'),
        "explorer": "https://amoy.polygonscan.com"
    }

@router.get("/read/{tx_hash}")
async def read_transaction(tx_hash: str):
    """Read data from blockchain transaction"""
    data = await blockchain_service.read_signature(tx_hash)
    
    if data:
        return {
            "success": True,
            "data": data,
            "explorer_url": f"https://amoy.polygonscan.com/tx/{tx_hash}"
        }
    else:
        return {
            "success": False,
            "error": "Could not read transaction data"
        }

from web3 import Web3
import json
import os
from datetime import datetime
from typing import Dict, Optional
import hashlib

class BlockchainService:
    """
    Polygon Amoy testnet blockchain service for video signature storage
    """
    
    def __init__(self):
        self.rpc_url = os.getenv("POLYGON_RPC_URL", "https://rpc-amoy.polygon.technology/")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.chain_id = 80002  # Polygon Amoy
        
        # Get private key from environment (for app-level wallet)
        self.private_key = os.getenv("BLOCKCHAIN_PRIVATE_KEY")
        
        if self.private_key and not self.private_key.startswith('0x'):
            self.private_key = '0x' + self.private_key
        
        print(f"🔗 Blockchain service initialized")
        print(f"   RPC: {self.rpc_url}")
        print(f"   Chain ID: {self.chain_id}")
        print(f"   Key configured: {bool(self.private_key)}")
    
    def is_connected(self) -> bool:
        """Check if connected to blockchain"""
        try:
            return self.w3.is_connected()
        except Exception:
            return False
    
    def get_account_address(self) -> Optional[str]:
        """Get wallet address from private key"""
        if not self.private_key:
            return None
        try:
            account = self.w3.eth.account.from_key(self.private_key)
            return account.address
        except Exception:
            return None
    
    def get_balance(self) -> float:
        """Get wallet balance in POL"""
        address = self.get_account_address()
        if not address:
            return 0.0
        try:
            balance_wei = self.w3.eth.get_balance(address)
            return float(self.w3.from_wei(balance_wei, 'ether'))
        except:
            return 0.0
    
    async def write_signature(self, video_id: str, perceptual_hash: str, metadata: Dict = None) -> Optional[Dict]:
        """
        Write video signature to blockchain
        
        Args:
            video_id: Unique video identifier
            perceptual_hash: Video's perceptual hash (truncated to fit)
            metadata: Optional metadata to include
        
        Returns:
            Dict with transaction details or None if failed
        """
        
        if not self.private_key:
            print("❌ Blockchain private key not configured")
            return None
        
        if not self.is_connected():
            print("❌ Not connected to blockchain")
            return None
        
        try:
            # Get account
            account = self.w3.eth.account.from_key(self.private_key)
            address = account.address
            
            # Check balance
            balance = self.get_balance()
            if balance < 0.001:
                print(f"⚠️ Low balance: {balance:.4f} POL")
                # Continue anyway for testnet
            
            # Prepare compact data (minimize size for lower gas costs)
            data_to_store = {
                'v': '1.0',  # version
                'vid': video_id[:16],  # Truncate video ID
                'h': perceptual_hash[:32],  # Truncate hash to 32 chars (128 bits)
                't': int(datetime.now().timestamp() * 1000),  # Unix timestamp ms
                'app': 'Rendr'
            }
            
            # Add optional metadata if provided
            if metadata:
                if metadata.get('source'):
                    data_to_store['src'] = metadata['source']
                if metadata.get('duration'):
                    data_to_store['dur'] = int(metadata['duration'])
            
            # Convert to compact JSON
            data_json = json.dumps(data_to_store, separators=(',', ':'))
            
            # Convert to hex
            data_hex = '0x' + data_json.encode('utf-8').hex()
            
            print(f"📝 Preparing blockchain transaction...")
            print(f"   From: {address}")
            print(f"   Data size: {len(data_json)} bytes")
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(address)
            
            # Send to self with data in input field
            transaction = {
                'nonce': nonce,
                'to': address,  # Send to self
                'value': 0,  # No POL transfer
                'data': data_hex,
                'chainId': self.chain_id,
                'gas': 100000,  # Initial estimate
                'maxFeePerGas': self.w3.eth.gas_price,
                'maxPriorityFeePerGas': self.w3.to_wei(1, 'gwei')
            }
            
            # Estimate gas
            try:
                gas_estimate = self.w3.eth.estimate_gas(transaction)
                transaction['gas'] = int(gas_estimate * 1.2)  # Add 20% buffer
                print(f"   Gas estimate: {gas_estimate}")
            except Exception as e:
                print(f"   Could not estimate gas: {e}")
                # Use default
            
            # Calculate cost
            gas_price_gwei = self.w3.from_wei(transaction['maxFeePerGas'], 'gwei')
            cost_pol = self.w3.from_wei(transaction['gas'] * transaction['maxFeePerGas'], 'ether')
            print(f"   Gas price: {gas_price_gwei:.2f} Gwei")
            print(f"   Estimated cost: {cost_pol:.6f} POL")
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            
            # Send transaction
            print(f"📤 Sending transaction...")
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            tx_hash_hex = self.w3.to_hex(tx_hash)
            
            print(f"✅ Transaction sent!")
            print(f"   TX Hash: {tx_hash_hex}")
            print(f"   Explorer: https://amoy.polygonscan.com/tx/{tx_hash_hex}")
            
            # Wait for confirmation (with timeout)
            print(f"⏳ Waiting for confirmation...")
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if tx_receipt['status'] == 1:
                actual_cost = self.w3.from_wei(tx_receipt['gasUsed'] * transaction['maxFeePerGas'], 'ether')
                
                print(f"✅ Transaction confirmed!")
                print(f"   Block: {tx_receipt['blockNumber']}")
                print(f"   Gas used: {tx_receipt['gasUsed']}")
                print(f"   Actual cost: {actual_cost:.6f} POL")
                
                return {
                    'tx_hash': tx_hash_hex,
                    'block_number': tx_receipt['blockNumber'],
                    'gas_used': tx_receipt['gasUsed'],
                    'cost_pol': float(actual_cost),
                    'explorer_url': f"https://amoy.polygonscan.com/tx/{tx_hash_hex}",
                    'timestamp': datetime.now().isoformat(),
                    'chain_id': self.chain_id,
                    'status': 'confirmed'
                }
            else:
                print(f"❌ Transaction failed!")
                return None
                
        except Exception as e:
            print(f"❌ Blockchain error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    async def read_signature(self, tx_hash: str) -> Optional[Dict]:
        """
        Read video signature from blockchain transaction
        
        Args:
            tx_hash: Transaction hash to read
        
        Returns:
            Dict with signature data or None if failed
        """
        try:
            print(f"🔍 Reading transaction: {tx_hash}")
            
            # Get transaction
            tx = self.w3.eth.get_transaction(tx_hash)
            
            print(f"   From: {tx['from']}")
            print(f"   Block: {tx['blockNumber']}")
            
            # Decode data
            data_hex = tx['input']
            if data_hex and data_hex != '0x':
                # Remove 0x prefix and decode
                data_bytes = bytes.fromhex(data_hex[2:])
                data_str = data_bytes.decode('utf-8')
                data_json = json.loads(data_str)
                
                print(f"✅ Data retrieved!")
                print(f"   Video ID: {data_json.get('vid', 'N/A')}")
                print(f"   Hash: {data_json.get('h', 'N/A')}")
                
                return data_json
            else:
                print(f"⚠️ No data found in transaction")
                return None
                
        except Exception as e:
            print(f"❌ Error reading transaction: {e}")
            return None
    
    def get_connection_status(self) -> Dict:
        """Get detailed connection status"""
        status = {
            'connected': self.is_connected(),
            'rpc_url': self.rpc_url,
            'chain_id': self.chain_id,
            'has_key': bool(self.private_key),
            'address': self.get_account_address(),
            'balance': self.get_balance()
        }
        
        if status['connected']:
            try:
                status['block_number'] = self.w3.eth.block_number
                status['gas_price_gwei'] = float(self.w3.from_wei(self.w3.eth.gas_price, 'gwei'))
            except:
                pass
        
        return status

# Global instance
blockchain_service = BlockchainService()

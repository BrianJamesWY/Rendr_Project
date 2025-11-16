"""
Rendr POC - Blockchain Testing
Tests writing and reading video hash to Polygon Mumbai testnet
"""

from web3 import Web3
import json
import os
from datetime import datetime

# Polygon Mumbai Testnet RPC
RPC_URL = "https://rpc-mumbai.maticvigil.com/"

def connect_to_polygon():
    """Connect to Polygon Mumbai testnet"""
    print("🔗 Connecting to Polygon Mumbai testnet...")
    
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    
    if w3.is_connected():
        print("✅ Connected to Polygon Mumbai!")
        chain_id = w3.eth.chain_id
        print(f"   Chain ID: {chain_id}")
        block = w3.eth.block_number
        print(f"   Current block: {block}")
        return w3
    else:
        print("❌ Failed to connect")
        return None

def get_account_balance(w3, address):
    """Check MATIC balance"""
    balance_wei = w3.eth.get_balance(address)
    balance_matic = w3.from_wei(balance_wei, 'ether')
    return float(balance_matic)

def write_hash_to_blockchain(w3, private_key, video_hash_data):
    """
    Write video hash to blockchain as transaction data
    
    Note: For POC, we're using transaction input data field.
    In production, we'd use a smart contract for better structure.
    """
    print("\n📝 Writing hash to blockchain...")
    
    # Get account from private key
    account = w3.eth.account.from_key(private_key)
    address = account.address
    
    print(f"   From address: {address}")
    
    # Check balance
    balance = get_account_balance(w3, address)
    print(f"   Balance: {balance:.4f} MATIC")
    
    if balance < 0.001:
        print("❌ Insufficient balance! Get test MATIC from faucet.")
        return None
    
    # Prepare data to store
    # In production, this would be more structured (smart contract)
    data_to_store = json.dumps({
        'videoHash': video_hash_data['combined_hash'][:64],  # Truncate for cost
        'timestamp': datetime.now().isoformat(),
        'app': 'Rendr',
        'version': '0.1.0-POC'
    })
    
    # Convert to hex for blockchain storage
    data_hex = '0x' + data_to_store.encode('utf-8').hex()
    
    print(f"   Data size: {len(data_to_store)} bytes")
    print(f"   Data preview: {data_to_store[:100]}...")
    
    # Build transaction
    nonce = w3.eth.get_transaction_count(address)
    
    # Sending to self with data in input field
    transaction = {
        'nonce': nonce,
        'to': address,  # Sending to self
        'value': 0,  # No MATIC transfer, just data storage
        'gas': 200000,
        'gasPrice': w3.eth.gas_price,
        'data': data_hex,
        'chainId': 80001  # Mumbai testnet
    }
    
    # Estimate gas
    try:
        gas_estimate = w3.eth.estimate_gas(transaction)
        transaction['gas'] = int(gas_estimate * 1.2)  # Add 20% buffer
        print(f"   Estimated gas: {gas_estimate}")
    except Exception as e:
        print(f"⚠️ Could not estimate gas: {e}")
    
    # Calculate cost
    gas_price_gwei = w3.from_wei(transaction['gasPrice'], 'gwei')
    cost_matic = w3.from_wei(transaction['gas'] * transaction['gasPrice'], 'ether')
    print(f"   Gas price: {gas_price_gwei:.2f} Gwei")
    print(f"   Estimated cost: {cost_matic:.6f} MATIC (~$0.00 on testnet)")
    
    # Sign transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    
    # Send transaction
    print("\n   Sending transaction...")
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_hash_hex = w3.to_hex(tx_hash)
    
    print(f"✅ Transaction sent!")
    print(f"   TX Hash: {tx_hash_hex}")
    print(f"   View on Explorer: https://mumbai.polygonscan.com/tx/{tx_hash_hex}")
    
    # Wait for confirmation
    print("\n   Waiting for confirmation...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    
    if tx_receipt['status'] == 1:
        print("✅ Transaction confirmed!")
        print(f"   Block number: {tx_receipt['blockNumber']}")
        print(f"   Gas used: {tx_receipt['gasUsed']}")
        actual_cost = w3.from_wei(tx_receipt['gasUsed'] * transaction['gasPrice'], 'ether')
        print(f"   Actual cost: {actual_cost:.6f} MATIC")
        
        return {
            'tx_hash': tx_hash_hex,
            'block': tx_receipt['blockNumber'],
            'gas_used': tx_receipt['gasUsed'],
            'cost_matic': float(actual_cost),
            'explorer_url': f"https://mumbai.polygonscan.com/tx/{tx_hash_hex}"
        }
    else:
        print("❌ Transaction failed!")
        return None

def read_hash_from_blockchain(w3, tx_hash):
    """Read video hash from blockchain transaction"""
    print(f"\n🔍 Reading transaction: {tx_hash}")
    
    try:
        # Get transaction details
        tx = w3.eth.get_transaction(tx_hash)
        
        print(f"   From: {tx['from']}")
        print(f"   Block: {tx['blockNumber']}")
        
        # Decode data
        data_hex = tx['input']
        if data_hex and data_hex != '0x':
            data_bytes = bytes.fromhex(data_hex[2:])  # Remove '0x' prefix
            data_str = data_bytes.decode('utf-8')
            data_json = json.loads(data_str)
            
            print(f"✅ Data retrieved!")
            print(f"   Video Hash: {data_json['videoHash']}")
            print(f"   Timestamp: {data_json['timestamp']}")
            print(f"   App: {data_json['app']}")
            
            return data_json
        else:
            print("⚠️ No data found in transaction")
            return None
            
    except Exception as e:
        print(f"❌ Error reading transaction: {e}")
        return None

def main():
    print("=" * 60)
    print("⛓️  RENDR POC - BLOCKCHAIN TESTING")
    print("=" * 60)
    print()
    
    # Connect to Polygon
    w3 = connect_to_polygon()
    if not w3:
        return
    
    # Get private key from user
    print("\n" + "=" * 60)
    print("🔑 PRIVATE KEY REQUIRED")
    print("=" * 60)
    print("To write to blockchain, we need your MetaMask private key.")
    print("⚠️  IMPORTANT: This is for POC testing only on testnet!")
    print("⚠️  NEVER share your mainnet private key!")
    print()
    print("To get your private key from MetaMask:")
    print("1. Click MetaMask extension")
    print("2. Click the three dots → Account Details")
    print("3. Click 'Export Private Key'")
    print("4. Enter your MetaMask password")
    print("5. Copy the private key")
    print()
    
    private_key = input("Paste your private key here (or 'skip' to only read): ").strip()
    
    if private_key.lower() == 'skip':
        print("\n⏭️  Skipping write test, will only test reading")
        
        # Test reading an existing transaction
        test_tx = input("\nEnter a transaction hash to test reading (or press Enter to skip): ").strip()
        if test_tx:
            read_hash_from_blockchain(w3, test_tx)
        
        return
    
    # Remove '0x' prefix if present
    if private_key.startswith('0x'):
        private_key = private_key[2:]
    
    # Load video hash from previous test
    if not os.path.exists('original_hash.json'):
        print("\n❌ No video hash found!")
        print("Run 'python test_phash.py' first to generate a hash.")
        return
    
    with open('original_hash.json', 'r') as f:
        video_hash_data = json.load(f)
    
    print(f"\n📹 Loaded video hash from: original_hash.json")
    print(f"   Hash preview: {video_hash_data['combined_hash'][:64]}...")
    
    # Write to blockchain
    result = write_hash_to_blockchain(w3, private_key, video_hash_data)
    
    if result:
        print("\n" + "=" * 60)
        print("✅ BLOCKCHAIN WRITE TEST: SUCCESS")
        print("=" * 60)
        print(f"TX Hash: {result['tx_hash']}")
        print(f"Explorer: {result['explorer_url']}")
        print(f"Cost: {result['cost_matic']:.6f} MATIC")
        
        # Save result
        with open('blockchain_result.json', 'w') as f:
            json.dump(result, f, indent=2)
        print("\n💾 Saved result to: blockchain_result.json")
        
        # Test reading it back
        print("\n" + "=" * 60)
        print("TEST: Reading back from blockchain")
        print("=" * 60)
        
        retrieved_data = read_hash_from_blockchain(w3, result['tx_hash'])
        
        if retrieved_data:
            original_hash_short = video_hash_data['combined_hash'][:64]
            retrieved_hash = retrieved_data['videoHash']
            
            if original_hash_short == retrieved_hash:
                print("\n✅ VERIFICATION SUCCESS!")
                print("   Written hash matches retrieved hash!")
            else:
                print("\n⚠️ Hash mismatch (unexpected)")
    else:
        print("\n❌ BLOCKCHAIN WRITE TEST: FAILED")
    
    print("\n" + "=" * 60)
    print("✅ BLOCKCHAIN TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()

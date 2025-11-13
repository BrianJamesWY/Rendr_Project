# WEEK 1 POC - DETAILED PLAN & CHECKLIST
## Rendr Video Verification - Proof of Concept

**Goal:** Validate that perceptual hashing + blockchain signatures can detect video editing and survive social media re-encoding.

**Time Estimate:** 10-15 hours total
**Location:** Your Windows computer at home
**Success Criteria:** 
- ✅ Perceptual hash survives Instagram/YouTube re-encoding (95%+ match)
- ✅ Perceptual hash detects editing (<90% match when frames removed)
- ✅ Can write/read hash to/from Polygon testnet
- ✅ Total cost: $0 (using free testnet)

---

## 📋 PRINTABLE CHECKLIST

### DAY 1-2: ENVIRONMENT SETUP (3-4 hours)

**Pre-Work: Check What's Installed**
- [ ] Open Command Prompt (search "cmd" in Windows)
- [ ] Type `python --version` and press Enter
- [ ] Type `node --version` and press Enter
- [ ] Type `git --version` and press Enter
- [ ] Write down the versions you see (or "not found")

**Install Required Software:**

**Python 3.11+ Installation:**
- [ ] Go to https://www.python.org/downloads/
- [ ] Download "Python 3.11.x" (latest 3.11 version)
- [ ] Run installer
- [ ] ✅ CHECK: "Add Python to PATH" during installation
- [ ] Click "Install Now"
- [ ] After install, open NEW Command Prompt
- [ ] Verify: `python --version` shows 3.11.x
- [ ] Verify: `pip --version` works

**Node.js Installation (if needed):**
- [ ] Go to https://nodejs.org/
- [ ] Download "LTS" version (should be 20.x)
- [ ] Run installer (all defaults are fine)
- [ ] Open NEW Command Prompt
- [ ] Verify: `node --version` shows v20.x
- [ ] Verify: `npm --version` works

**Git Installation (if needed):**
- [ ] Go to https://git-scm.com/download/win
- [ ] Download and install (all defaults fine)
- [ ] Verify: `git --version` works

**Visual Studio Code (Recommended):**
- [ ] Go to https://code.visualstudio.com/
- [ ] Download and install
- [ ] Open VS Code
- [ ] Install Python extension (search in Extensions)

---

### DAY 2-3: PYTHON SETUP & TEST VIDEO (2 hours)

**Create Project Folder:**
- [ ] Open File Explorer
- [ ] Go to Desktop (or wherever you prefer)
- [ ] Right-click → New → Folder
- [ ] Name it: `rendr-poc`
- [ ] Open Command Prompt
- [ ] Navigate: `cd Desktop\rendr-poc`

**Install Python Libraries:**
```bash
# Copy and paste these commands one at a time:

pip install opencv-python
pip install pillow
pip install imagehash
pip install numpy
```

- [ ] Run each pip install command above
- [ ] Wait for "Successfully installed..." message for each
- [ ] If errors, note them down

**Record Test Video on iPhone:**
- [ ] Open Camera app on iPhone
- [ ] Record 15-30 second video of something simple (your desk, room, etc.)
- [ ] Make sure video has some movement
- [ ] Save to Photos
- [ ] Transfer to Windows computer:
  - Connect iPhone via USB cable
  - Open File Explorer → "Apple iPhone" device
  - Navigate to Internal Storage → DCIM → (find your video)
  - Copy to `Desktop\rendr-poc\test_video_original.mp4`

- [ ] Verify file exists: `dir` in Command Prompt should show the file

**Alternative if USB doesn't work:**
- [ ] Email video to yourself
- [ ] Download on Windows
- [ ] Save as `test_video_original.mp4` in rendr-poc folder

---

### DAY 3-4: PERCEPTUAL HASH TESTING (3-4 hours)

**Create Python Script: test_phash.py**

- [ ] Open VS Code
- [ ] File → Open Folder → Select `rendr-poc`
- [ ] File → New File
- [ ] Save as: `test_phash.py`
- [ ] Copy and paste the code below:

```python
"""
Rendr POC - Perceptual Hash Testing
Tests if video hashing survives re-encoding and detects edits
"""

import cv2
import imagehash
from PIL import Image
import os
import json
from datetime import datetime

def extract_frames(video_path, num_frames=10):
    """Extract evenly spaced frames from video"""
    print(f"📹 Extracting frames from: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ Error: Could not open video file")
        return None
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps
    
    print(f"   Total frames: {total_frames}")
    print(f"   FPS: {fps:.2f}")
    print(f"   Duration: {duration:.2f} seconds")
    
    frame_indices = [int(i * total_frames / num_frames) for i in range(num_frames)]
    frames = []
    
    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            frames.append(pil_image)
    
    cap.release()
    print(f"✅ Extracted {len(frames)} frames")
    return frames

def calculate_video_phash(frames):
    """Calculate perceptual hash for video using multiple frames"""
    print(f"🔢 Calculating perceptual hashes...")
    
    hashes = []
    for i, frame in enumerate(frames):
        # Using phash (perceptual hash) - most robust for our use case
        frame_hash = imagehash.phash(frame, hash_size=8)
        hashes.append(str(frame_hash))
        print(f"   Frame {i+1}: {frame_hash}")
    
    # Combine all frame hashes into one video hash
    combined = ''.join(hashes)
    print(f"✅ Combined hash: {combined[:64]}... (truncated)")
    
    return {
        'combined_hash': combined,
        'frame_hashes': hashes,
        'num_frames': len(hashes)
    }

def compare_hashes(hash1, hash2):
    """Compare two video hashes and return similarity percentage"""
    if len(hash1['frame_hashes']) != len(hash2['frame_hashes']):
        print("⚠️ Warning: Different number of frames")
        return 0.0
    
    matches = 0
    total = len(hash1['frame_hashes'])
    
    print(f"\n🔍 Comparing frame-by-frame:")
    for i, (h1, h2) in enumerate(zip(hash1['frame_hashes'], hash2['frame_hashes'])):
        # Calculate hamming distance (how many bits differ)
        hash1_obj = imagehash.hex_to_hash(h1)
        hash2_obj = imagehash.hex_to_hash(h2)
        distance = hash1_obj - hash2_obj
        
        # Lower distance = more similar (0 = identical)
        # Typically distance < 10 means very similar
        similarity = max(0, 100 - (distance * 2))
        
        if similarity >= 90:
            matches += 1
            status = "✅"
        elif similarity >= 80:
            status = "⚠️"
        else:
            status = "❌"
        
        print(f"   Frame {i+1}: {status} {similarity:.1f}% similar (distance: {distance})")
    
    overall_similarity = (matches / total) * 100
    return overall_similarity

def test_video(video_path):
    """Process a video and return its hash"""
    if not os.path.exists(video_path):
        print(f"❌ Video not found: {video_path}")
        return None
    
    frames = extract_frames(video_path, num_frames=10)
    if frames is None:
        return None
    
    video_hash = calculate_video_phash(frames)
    return video_hash

def main():
    print("=" * 60)
    print("🎬 RENDR POC - PERCEPTUAL HASH TESTING")
    print("=" * 60)
    print()
    
    # Test 1: Hash the original video
    print("TEST 1: Original Video")
    print("-" * 60)
    original_hash = test_video("test_video_original.mp4")
    
    if original_hash is None:
        print("\n❌ FAILED: Could not process original video")
        print("Make sure 'test_video_original.mp4' is in this folder")
        return
    
    print("\n✅ Original video processed successfully!")
    print()
    
    # Save original hash for later comparison
    with open('original_hash.json', 'w') as f:
        json.dump(original_hash, f, indent=2)
    print("💾 Saved original hash to: original_hash.json")
    print()
    
    # Test 2: Compare with re-encoded version (if exists)
    print("\n" + "=" * 60)
    print("TEST 2: Re-encoded Video Comparison")
    print("-" * 60)
    
    if os.path.exists("test_video_reencoded.mp4"):
        print("📹 Found re-encoded video, comparing...")
        reencoded_hash = test_video("test_video_reencoded.mp4")
        
        if reencoded_hash:
            similarity = compare_hashes(original_hash, reencoded_hash)
            print(f"\n{'=' * 60}")
            print(f"📊 OVERALL SIMILARITY: {similarity:.1f}%")
            print(f"{'=' * 60}")
            
            if similarity >= 95:
                print("✅ EXCELLENT: Hash survives re-encoding!")
            elif similarity >= 85:
                print("⚠️ GOOD: Minor differences, likely acceptable")
            elif similarity >= 70:
                print("⚠️ MODERATE: Significant differences detected")
            else:
                print("❌ POOR: Major differences, may not work for verification")
    else:
        print("ℹ️ No re-encoded video found yet.")
        print("   Next steps:")
        print("   1. Upload 'test_video_original.mp4' to Instagram")
        print("   2. Download it back")
        print("   3. Save as 'test_video_reencoded.mp4'")
        print("   4. Run this script again")
    
    print()
    
    # Test 3: Compare with edited version (if exists)
    print("\n" + "=" * 60)
    print("TEST 3: Edited Video Detection")
    print("-" * 60)
    
    if os.path.exists("test_video_edited.mp4"):
        print("📹 Found edited video, comparing...")
        edited_hash = test_video("test_video_edited.mp4")
        
        if edited_hash:
            similarity = compare_hashes(original_hash, edited_hash)
            print(f"\n{'=' * 60}")
            print(f"📊 OVERALL SIMILARITY: {similarity:.1f}%")
            print(f"{'=' * 60}")
            
            if similarity < 90:
                print("✅ SUCCESS: Editing was detected!")
            else:
                print("⚠️ WARNING: Edit not detected (hash too similar)")
    else:
        print("ℹ️ No edited video found yet.")
        print("   To test editing detection:")
        print("   1. Edit 'test_video_original.mp4' (remove 5-10 seconds)")
        print("   2. Save as 'test_video_edited.mp4'")
        print("   3. Run this script again")
    
    print("\n" + "=" * 60)
    print("✅ POC TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
```

- [ ] Save the file (Ctrl+S)

**Run the Test:**
- [ ] Open Command Prompt in `rendr-poc` folder
- [ ] Run: `python test_phash.py`
- [ ] Should see output showing hash calculation
- [ ] File `original_hash.json` should be created

**Expected Output:**
```
====================================================
🎬 RENDR POC - PERCEPTUAL HASH TESTING
====================================================

TEST 1: Original Video
----------------------------------------------------
📹 Extracting frames from: test_video_original.mp4
   Total frames: 450
   FPS: 30.00
   Duration: 15.00 seconds
✅ Extracted 10 frames
🔢 Calculating perceptual hashes...
   Frame 1: a7f3c9e2...
   Frame 2: b8g4d0f3...
   ...
✅ Combined hash: a7f3c9e2b8g4d0f3... (truncated)

✅ Original video processed successfully!
💾 Saved original hash to: original_hash.json
```

---

### DAY 4: SOCIAL MEDIA RE-ENCODING TEST (2 hours)

**Upload to Instagram:**
- [ ] Open Instagram on your iPhone
- [ ] Create new post (or Story)
- [ ] Upload `test_video_original.mp4`
- [ ] Post it (can be private/close friends only)
- [ ] Immediately download it back:
  - Instagram doesn't allow direct download
  - Use a service like DownloadGram or StorySaver
  - Or: Post to Story → Use iPhone screen recording while playing
  - Or: Use Instagram's "Save" feature then export from iPhone

**Alternative: YouTube Test**
- [ ] Upload video to YouTube (unlisted)
- [ ] Download it back using: https://ytmp3.nu/ or similar
- [ ] Save as `test_video_reencoded.mp4`

**Save Re-encoded Video:**
- [ ] Transfer downloaded video to Windows
- [ ] Save in `rendr-poc` folder as: `test_video_reencoded.mp4`
- [ ] Run test again: `python test_phash.py`
- [ ] Check similarity score

**SUCCESS CRITERIA:**
- [ ] Similarity score ≥ 95% = Excellent ✅
- [ ] Similarity score 85-94% = Good ⚠️
- [ ] Similarity score < 85% = Need different approach ❌

---

### DAY 5: EDITING DETECTION TEST (1 hour)

**Create Edited Version:**

**Option A: Use Free Online Editor**
- [ ] Go to: https://www.kapwing.com/ or https://clideo.com/
- [ ] Upload `test_video_original.mp4`
- [ ] Remove 5-10 seconds from middle or end
- [ ] Or: Change color/brightness significantly
- [ ] Export and download
- [ ] Save as: `test_video_edited.mp4` in rendr-poc folder

**Option B: Use Windows Video Editor**
- [ ] Open "Photos" app on Windows
- [ ] Click "Video Editor"
- [ ] New video project
- [ ] Add `test_video_original.mp4`
- [ ] Trim 5-10 seconds out
- [ ] Export → Save as `test_video_edited.mp4`

**Run Test:**
- [ ] Run: `python test_phash.py`
- [ ] Check edited video similarity score

**SUCCESS CRITERIA:**
- [ ] Similarity score < 90% = Edit detected ✅
- [ ] Similarity score ≥ 90% = Edit not detected ❌

---

### DAY 6-7: BLOCKCHAIN TESTING (3-4 hours)

**Install MetaMask (Crypto Wallet):**
- [ ] Open Chrome or Brave browser
- [ ] Go to: https://metamask.io/
- [ ] Click "Download" → "Install MetaMask for Chrome"
- [ ] Click "Add to Chrome"
- [ ] Click "Create a new wallet"
- [ ] Create password (write it down!)
- [ ] **CRITICAL:** Write down your 12-word recovery phrase on paper
- [ ] ⚠️ NEVER share this phrase with anyone
- [ ] Store paper in safe place
- [ ] Complete setup

**Switch to Polygon Mumbai Testnet:**
- [ ] Click MetaMask extension icon
- [ ] Click network dropdown (top left, says "Ethereum Mainnet")
- [ ] Click "Show test networks" toggle (in settings if needed)
- [ ] Select "Polygon Mumbai" (testnet)
- [ ] If not visible, add manually:
  - Click "Add Network"
  - Network Name: Polygon Mumbai
  - RPC URL: https://rpc-mumbai.maticvigil.com/
  - Chain ID: 80001
  - Currency Symbol: MATIC
  - Block Explorer: https://mumbai.polygonscan.com/

**Get Free Test MATIC:**
- [ ] Copy your wallet address (click account name in MetaMask)
- [ ] Go to: https://faucet.polygon.technology/
- [ ] Select "Mumbai"
- [ ] Paste your wallet address
- [ ] Click "Submit"
- [ ] Wait 1-2 minutes
- [ ] Check MetaMask - should see ~0.5 MATIC

**Install Python Blockchain Libraries:**
```bash
pip install web3
pip install python-dotenv
```
- [ ] Run both pip install commands
- [ ] Wait for "Successfully installed..." messages

**Create Blockchain Test Script:**

- [ ] Create new file: `test_blockchain.py`
- [ ] Copy and paste code below:

```python
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
```

- [ ] Save file

**Run Blockchain Test:**
- [ ] Open Command Prompt in `rendr-poc`
- [ ] Run: `python test_blockchain.py`
- [ ] Follow prompts to enter MetaMask private key
- [ ] **NOTE:** Only do this on testnet, never with mainnet private key!

**Get Your Private Key from MetaMask:**
- [ ] Click MetaMask extension
- [ ] Click three dots (⋮) → "Account details"
- [ ] Click "Show private key"
- [ ] Enter your MetaMask password
- [ ] Click to reveal key
- [ ] Copy it
- [ ] Paste into the script when prompted

**SUCCESS CRITERIA:**
- [ ] Transaction is confirmed on blockchain
- [ ] Can view transaction on Mumbai Polygonscan
- [ ] Can read hash back from blockchain
- [ ] Retrieved hash matches original
- [ ] Cost is < 0.01 MATIC (should be ~0.001 MATIC)

---

## 📊 WEEK 1 POC SUCCESS ASSESSMENT

### After completing all tests, evaluate:

**✅ POC IS SUCCESSFUL IF:**
1. ☑️ Perceptual hash survives Instagram/YouTube re-encoding (≥85% match)
2. ☑️ Perceptual hash detects editing (<90% match for edited video)
3. ☑️ Successfully wrote hash to Polygon testnet
4. ☑️ Successfully retrieved hash from blockchain
5. ☑️ Total cost was $0 (testnet is free)

**⚠️ POC NEEDS ADJUSTMENT IF:**
- Similarity score for re-encoded video is 70-84%
  - → Try different hash algorithm (dHash, wHash)
  - → Try more frames (20 instead of 10)
  - → Try different hash size (16 instead of 8)

**❌ POC FAILED IF:**
- Similarity score for re-encoded video is <70%
  - → May need different approach (steganography, audio fingerprinting)
  - → Or adjust expectations (verification works, but with lower confidence)

- Editing is not detected (similarity stays >90% after removing frames)
  - → May need more sophisticated frame-level hashing
  - → Or use frame count as additional signal

---

## 🚦 DECISION POINT: END OF WEEK 1

Based on POC results, you will decide:

**IF POC SUCCESS (✅ above):**
- ✅ Proceed to Week 2-3: Backend Development
- ✅ Use pHash as primary verification method
- ✅ Use Polygon for blockchain signatures

**IF POC NEEDS ADJUSTMENT (⚠️ above):**
- 🔄 Spend Week 2 testing alternative approaches
- 🔄 Try different libraries/algorithms
- 🔄 May adjust confidence score thresholds

**IF POC FAILED (❌ above):**
- 🤔 Reassess technical approach
- 🤔 Consider hybrid methods (multiple verification layers)
- 🤔 May need to adjust product vision

---

## 📁 FILES YOU'LL HAVE AFTER WEEK 1

```
rendr-poc/
├── test_video_original.mp4       (your test video)
├── test_video_reencoded.mp4      (after Instagram/YouTube)
├── test_video_edited.mp4         (edited version)
├── test_phash.py                 (perceptual hash testing script)
├── test_blockchain.py            (blockchain testing script)
├── original_hash.json            (saved hash of original video)
├── blockchain_result.json        (transaction details)
└── poc_results.txt               (your notes on success/failure)
```

- [ ] Create `poc_results.txt` and document your findings
- [ ] Write down:
  - Similarity scores for each test
  - Any issues encountered
  - Time spent on each task
  - Decision: Proceed or adjust?

---

## 🆘 TROUBLESHOOTING COMMON ISSUES

### "python: command not found"
- Python not installed or not in PATH
- Reinstall Python, make sure to check "Add to PATH"
- Try `py` instead of `python`

### "pip: command not found"
- Usually means Python not in PATH
- Try: `python -m pip install opencv-python`

### "Could not open video file"
- File path wrong or file corrupted
- Make sure file is in same folder as script
- Try different video format
- Try shorter video (<1 minute)

### "cv2.error" or "OpenCV error"
- May need to install additional codec:
- Run: `pip install opencv-python-headless`

### "Insufficient balance" in blockchain test
- Need test MATIC from faucet
- Go to: https://faucet.polygon.technology/
- Wait 1-2 minutes after requesting

### "Transaction failed" on blockchain
- Gas price too low (usually auto-adjusts)
- Try again, usually transient issue
- Check Mumbai testnet status: https://mumbai.polygonscan.com/

### MetaMask not showing Mumbai network
- Click "Show test networks" in settings
- Or add manually with RPC URL provided above

---

## 📞 AFTER WEEK 1

**When you're done, come back to this chat and tell me:**

1. Did perceptual hashing work? (What were the similarity scores?)
2. Did blockchain writing work? (Share the transaction hash if you want)
3. Any blockers or issues?
4. Ready to proceed to Week 2-3 (Backend)?

**I'll be here to help troubleshoot and plan the next phase!**

---

## ⏱️ TIME BREAKDOWN ESTIMATE

- Day 1-2: Environment Setup (3-4 hours)
- Day 2-3: Python Setup + Test Video (2 hours)
- Day 3-4: Perceptual Hash Testing (3-4 hours)
- Day 4: Social Media Re-encoding Test (2 hours)
- Day 5: Editing Detection Test (1 hour)
- Day 6-7: Blockchain Testing (3-4 hours)

**Total: 14-17 hours** (fits your 10-15 hours/week commitment)

---

**Good luck! You've got this! 🚀**

Print this document and check off each item as you complete it.

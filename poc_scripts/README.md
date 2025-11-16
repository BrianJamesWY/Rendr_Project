# Rendr POC Scripts

## Week 1 Proof of Concept - Video Verification Testing

This folder contains Python scripts to validate the core assumptions of the Rendr platform:

1. **Perceptual hashing survives social media re-encoding**
2. **Perceptual hashing detects video editing**
3. **Blockchain signatures work as expected on Polygon testnet**

---

## Setup Instructions

### 1. Install Required Python Libraries

Open Command Prompt in this folder and run:

```bash
pip install opencv-python pillow imagehash numpy web3
```

### 2. Prepare Test Video

- Record a 15-30 second video on your iPhone
- Transfer it to this folder
- Rename it to: `test_video_original.mp4`

---

## Running the Tests

### Test 1: Perceptual Hash Testing

```bash
python test_phash.py
```

This will:
- Extract frames from your video
- Calculate perceptual hashes
- Save results to `original_hash.json`

**Next steps after first run:**
1. Upload the video to Instagram/YouTube
2. Download it back
3. Save as `test_video_reencoded.mp4`
4. Run the script again to compare

### Test 2: Blockchain Testing

```bash
python test_blockchain.py
```

This will:
- Connect to Polygon Mumbai testnet
- Write your video hash to the blockchain
- Read it back to verify

**Prerequisites:**
- MetaMask wallet installed
- Wallet switched to Mumbai testnet
- Test MATIC from faucet (https://faucet.polygon.technology/)

---

## Expected Results

✅ **Success Criteria:**
- Re-encoded video: ≥85% similarity
- Edited video: <90% similarity (detects changes)
- Blockchain write/read: Success with <0.01 MATIC cost

---

## Files You'll Generate

- `original_hash.json` - Hash of your original video
- `blockchain_result.json` - Transaction details
- `test_video_original.mp4` - Your test video
- `test_video_reencoded.mp4` - After social media
- `test_video_edited.mp4` - Edited version

---

## Troubleshooting

### "Could not open video file"
- Make sure the video is named exactly `test_video_original.mp4`
- Try a shorter video (<1 minute)
- Make sure you're in the correct folder

### "pip: command not found"
- Try: `python -m pip install <package>`

### "Insufficient balance" (blockchain test)
- Get test MATIC from: https://faucet.polygon.technology/
- Wait 1-2 minutes after requesting

---

## Next Steps

After Week 1 POC is complete:
- Document your results
- Report back on similarity scores
- Move to Week 2-3: Backend Development

---

**Questions?** Share your results and any issues in our chat!

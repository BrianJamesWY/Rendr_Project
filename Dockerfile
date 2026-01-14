FROM python:3.12-slim

# Install OpenCV dependencies (cv2 video processing)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

EXPOSE $PORT
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "$PORT"]

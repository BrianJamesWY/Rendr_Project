FROM python:3.12-slim

# Install OpenCV + COMPILER + setuptools dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt .
# Force ALL packages including twilio (retry failed installs)
RUN pip install --no-cache-dir setuptools wheel pip --upgrade
RUN pip install --no-cache-dir --force-reinstall twilio==9.8.7
RUN pip install --no-cache-dir -r requirements.txt --timeout=600
COPY backend/ .

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]

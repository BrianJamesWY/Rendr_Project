#!/bin/bash
# Redis Queue Worker Starter Script

cd /app/backend
source /root/.venv/bin/activate

# Start RQ worker listening to all queues (high priority first)
rq worker high default low --url redis://127.0.0.1:6379/0

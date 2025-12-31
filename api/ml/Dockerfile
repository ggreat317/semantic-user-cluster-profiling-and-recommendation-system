# Use Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install PyTorch from local wheel
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# Copy Python dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML code
COPY . .

EXPOSE 8000

# Command to run the Python worker
CMD ["uvicorn", "embedder:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
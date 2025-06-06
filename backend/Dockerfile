FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p temp outputs uploads

# Expose port (Cloud Run will set PORT env variable)
ENV PORT=8000
EXPOSE $PORT

# Run the application with uvicorn for production
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1 
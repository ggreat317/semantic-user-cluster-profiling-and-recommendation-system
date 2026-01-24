# uses python image sourced from docker
FROM python:3.10-slim

# sets working dir
WORKDIR /app

# installs pytorch because the sentence embedder is based off it
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu
RUN apt-get update && apt-get install -y curl

# copies python dependencies from txt file
COPY requirements.txt .

# installs said dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copies code
COPY . .

# exposes port for local usage, especially in tandem with exposed port in api
EXPOSE 8000

# runs python with uvicorn and reload for "instant" updates
CMD ["uvicorn", "embedder:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
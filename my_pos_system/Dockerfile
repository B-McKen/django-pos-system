# Python 3.10+ for Django 5.1.4 compatibility
FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install wkhtmltopdf
RUN apt-get update && apt-get install -y \
    wkhtmltopdf

# Copy project into container
COPY . /app/

# Port 8000 for Django to run
EXPOSE 8000

# Run when container starts
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

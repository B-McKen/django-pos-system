# CharStore POS System
A Django-based Point of Sale (POS) system using Python. Manages sales on the checkout interface, product inventory, and transaction history/reporting.

## Features (WIP)
- User authentication and role-based access
- Familiar and intuitive user interface
- Inventory management
- Transaction history and reporting
- Integration with SQLite database
- Background task management using Celery, Celery Beat & Redis
- PDF generation using `wkhtmltopdf`

## Installation (Windows)

### **Using Docker (Recommended)**

Ensure you have **Docker** installed.

1. Clone the repository:
```bash
git clone https://gitlab.com/B-McKen/django-pos-system.git
cd my_pos_system
```
2. Build and start the development server:
```bash
docker-compose up --build
```
For future uses after building, simply run:
```bash
docker-compose up
```
(Note): The application will be available at `http://127.0.0.1:8000/`

3. To benefit from the PDF generation functionality, please see the below installation instructions for `wkhtmltopdf`

4. Stop the server by running:
```bash
docker-compose down
```

### Manual Installation (without Docker)
**NOTE**: This method of installation forgoes scheduled task functionality via Celery/Redis. For the best experience, please use the above installation guide.

1. Clone the repository:
```bash
git clone https://gitlab.com/B-McKen/django-pos-system.git
```

2. Create and activate a virtual environment:
```bash
python -m venv pos_env
.\pos_env\scripts\activate
```

3. Install dependencies and apply migrations:
```bash
pip install -r requirements.txt
python manage.py migrate
```

4. Run the development server:
```bash
cd my_pos_system
python manage.py runserver
```

5. Access the application at `http://127.0.0.1:8000/`

## PDF Generation (wkhtmltopdf)
For PDF generation of receipts to be saved to the transaction database, you need to install **wkhtmltopdf**
1. Download from `wkhtmltopdf.org`
2. Add this to your system's PATH environment variable

## Usage (WIP)
TBC

## Technologies
- Django 5.1.4
- Python 3.12.6
- SQLite3 (default database)
- Docker & Docker Compose (containerisation)
- Redis (Background task management)
- Celery & Celery Beat (for task scheduling and execution)
- wkhtmltopdf (for receipt PDF generation)

## Contribution Guidelines
If you'd like to contribute to this project, please fork the repository and create a pull request with your changes!

## Contact information
For questions or feedback relating to this project, please contact me at billymcken19@outlook.com

# CharStore POS System
A Django-based Point of Sale (POS) system using Python. Manages sales on the checkout interface, product inventory, and transaction history/reporting.

## Features (WIP)
- User authentication and role-based access
- Familiar and intuitive user interface
- Inventory management
- Transaction history and reporting
- Integration with SQLite database

## Installation (Windows)

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

## Usage (WIP)
TBC

## Technologies
- Django 5.1.4
- Python 3.12.6
- SQLite3 (default database)

## Contribution Guidelines
If you'd like to contribute to this project, please fork the repository and create a pull request with your changes!

## Contact information
For questions or feedback relating to this project, please contact me at billymcken19@outlook.com

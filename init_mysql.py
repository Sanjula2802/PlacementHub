"""
Script to initialize MySQL database and tables for PlacementHub.
Usage:
    py init_mysql.py
"""
import os
import pymysql
from backend.config import Config
from backend.app import create_app
from backend.database import db
from backend.seed import seed_database

def setup_mysql():
    print("=" * 60)
    print(" PlacementHub MySQL Setup & Initialization")
    print("=" * 60)
    print(f"Connecting to MySQL Host: {Config.MYSQL_HOST}:{Config.MYSQL_PORT}")
    print(f"Target Database:         {Config.MYSQL_DB}")
    print(f"User:                    {Config.MYSQL_USER}")

    try:
        # Step 1: Connect to MySQL server (without database selected)
        conn = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=int(Config.MYSQL_PORT),
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            charset='utf8mb4'
        )
        with conn.cursor() as cursor:
            print(f"[1/3] Creating database `{Config.MYSQL_DB}` if not exists...")
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{Config.MYSQL_DB}` "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
        conn.commit()
        conn.close()
        print("[1/3] Database created / verified successfully.")

        # Step 2: Initialize SQLAlchemy models and create tables
        print("[2/3] Creating all MySQL tables from SQLAlchemy models...")
        app = create_app()
        with app.app_context():
            db.create_all()
            print("[2/3] All tables created successfully in MySQL.")

            # Step 3: Seed initial data
            print("[3/3] Seeding initial data (Super Admin, sample drives, jobs, etc.)...")
            seed_database()
            print("[3/3] Initial data seeding complete.")

        print("\n" + "=" * 60)
        print(" SUCCESS: MySQL is fully configured and ready for PlacementHub!")
        print(" You can now run: py run.py (or npm run server)")
        print("=" * 60)

    except pymysql.MySQLError as err:
        print(f"\n[ERROR] MySQL Connection Failed: {err}")
        print("\nTroubleshooting tips:")
        print("1. Ensure MySQL Server is running (e.g. via XAMPP, WAMP, or MySQL Windows Service).")
        print("2. Check credentials in your .env file (MYSQL_USER, MYSQL_PASSWORD, MYSQL_PORT).")
        print("3. By default, XAMPP / local MySQL uses user='root' and password='' (empty).")

if __name__ == '__main__':
    setup_mysql()

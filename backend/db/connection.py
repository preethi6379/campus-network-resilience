"""
Database Connection & Persistence Adapter
==========================================
Author: Avanish Ayyappan (Backend & Integration Lead)

Supports MySQL with parameterized queries, plus automatic SQLite adapter for
zero-dependency offline demos and tests.
"""

import os
import sqlite3
from typing import Optional, Any, Dict, List
from backend.config import Config

try:
    import pymysql
    import pymysql.cursors
    HAS_PYMYSQL = True
except ImportError:
    HAS_PYMYSQL = False


class DatabaseConnection:
    @staticmethod
    def get_connection():
        """Returns a database connection based on Config.DB_TYPE."""
        if Config.DB_TYPE == "mysql" and HAS_PYMYSQL:
            try:
                conn = pymysql.connect(
                    host=Config.DB_HOST,
                    port=Config.DB_PORT,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD,
                    database=Config.DB_NAME,
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=True
                )
                return conn
            except Exception as e:
                # Fallback to SQLite if MySQL is unreachable
                print(f"[DB Warning] Could not connect to MySQL: {e}. Falling back to SQLite.")

        # SQLite Connection
        conn = sqlite3.connect(Config.SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def init_db():
        """Initializes tables and seeds baseline topology if not yet populated."""
        schema_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "database", "schema.sql")
        seed_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "database", "seed.sql")

        conn = DatabaseConnection.get_connection()
        is_sqlite = isinstance(conn, sqlite3.Connection)

        with open(schema_path, "r", encoding="utf-8") as f:
            schema_sql = f.read()
        with open(seed_path, "r", encoding="utf-8") as f:
            seed_sql = f.read()

        if is_sqlite:
            cursor = conn.cursor()
            # SQLite adjustments for standard DDL
            clean_schema = schema_sql.replace("INT AUTO_INCREMENT PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
            clean_schema = clean_schema.replace("AUTO_INCREMENT", "AUTOINCREMENT")
            # Execute statement by statement
            cursor.executescript(clean_schema)
            cursor.executescript(seed_sql)
            conn.commit()
            conn.close()
        else:
            with conn.cursor() as cursor:
                for statement in schema_sql.split(";"):
                    stmt = statement.strip()
                    if stmt:
                        cursor.execute(stmt)
                for statement in seed_sql.split(";"):
                    stmt = statement.strip()
                    if stmt:
                        cursor.execute(stmt)
            conn.close()

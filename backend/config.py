"""
Campus Network Resilience Visualizer - Configuration
=====================================================
Author: Avanish Ayyappan (Backend & Integration Lead)
"""

import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "campus-network-resilience-dev-key")
    DEBUG = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1")

    # Database Settings
    DB_TYPE = os.environ.get("DB_TYPE", "sqlite") # 'mysql' or 'sqlite'
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = int(os.environ.get("DB_PORT", "3306"))
    DB_USER = os.environ.get("DB_USER", "root")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    DB_NAME = os.environ.get("DB_NAME", "campus_resilience")
    SQLITE_PATH = os.environ.get("SQLITE_PATH", os.path.join(os.path.dirname(__file__), "campus_resilience.db"))

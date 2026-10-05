import os
from pathlib import Path
import threading
import duckdb
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = BASE_DIR / "analytics.duckdb"
DATABASE_FILE = os.getenv("DUCKDB_PATH", str(DEFAULT_DB_PATH))


class AnalyticsDatabase:

    def __init__(self):
        self._lock = threading.Lock()
        self.connection = duckdb.connect(
            DATABASE_FILE
        )

    def load_dataframe(
        self,
        df: pd.DataFrame,
        table_name: str = "sales"
    ):
        with self._lock:
            self.connection.register(
                "temp_dataframe",
                df
            )

            self.connection.execute(
                f"""
                CREATE OR REPLACE TABLE {table_name}
                AS
                SELECT *
                FROM temp_dataframe
                """
            )

            self.connection.unregister(
                "temp_dataframe"
            )

    def query(self, sql: str) -> pd.DataFrame:
        with self._lock:
            cursor = self.connection.cursor()
            try:
                result = cursor.execute(sql).fetchdf()
                if result is None:
                    return pd.DataFrame()
                return result
            finally:
                cursor.close()

    def close(self):
        with self._lock:
            self.connection.close()
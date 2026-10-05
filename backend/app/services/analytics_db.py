import duckdb
import pandas as pd


DATABASE_FILE = "analytics.duckdb"


class AnalyticsDatabase:

    def __init__(self):

        self.connection = duckdb.connect(
            DATABASE_FILE
        )

    def load_dataframe(
        self,
        df: pd.DataFrame,
        table_name: str = "sales"
    ):

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

    def query(self, sql: str):

        return self.connection.execute(
            sql
        ).fetchdf()

    def close(self):

        self.connection.close()
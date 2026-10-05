from app.services.analytics_db import AnalyticsDatabase


class AnalyticsService:

    def __init__(self):
        self.db = AnalyticsDatabase()

    def get_summary(self):

        query = """
            SELECT
                SUM(sales) AS total_sales,
                SUM(profit) AS total_profit,
                SUM(quantity) AS total_quantity,
                COUNT(DISTINCT order_id) AS total_orders,
                COUNT(DISTINCT customer_id) AS total_customers,
                SUM(returns) AS total_returns
            FROM sales
        """

        result = self.db.query(query)
        if result is None or result.empty:
            return {
                "total_sales": 0,
                "total_profit": 0,
                "total_quantity": 0,
                "total_orders": 0,
                "total_customers": 0,
                "total_returns": 0,
            }

        return result.iloc[0].to_dict()

    def get_sales_by_region(self):

        query = """
            SELECT
                region,
                SUM(sales) AS total_sales
            FROM sales
            GROUP BY region
            ORDER BY total_sales DESC
        """

        df = self.db.query(query)
        if df is None or df.empty:
            return []

        return df.to_dict(
            orient="records"
        )

    def get_profit_by_category(self):

        query = """
            SELECT
                category,
                SUM(profit) AS total_profit
            FROM sales
            GROUP BY category
            ORDER BY total_profit DESC
        """

        df = self.db.query(query)
        if df is None or df.empty:
            return []

        return df.to_dict(
            orient="records"
        )

    def get_top_products(self, limit=10):

        query = f"""
            SELECT
                product_name,
                SUM(sales) AS total_sales
            FROM sales
            GROUP BY product_name
            ORDER BY total_sales DESC
            LIMIT {limit}
        """

        df = self.db.query(query)
        if df is None or df.empty:
            return []

        return df.to_dict(
            orient="records"
        )

    def get_sales_by_month(self):

        query = """
            SELECT
                DATE_TRUNC(
                    'month',
                    order_date
                ) AS month,
                SUM(sales) AS total_sales,
                SUM(profit) AS total_profit
            FROM sales
            GROUP BY month
            ORDER BY month
        """

        df = self.db.query(query)
        if df is None or df.empty:
            return []

        return df.to_dict(
            orient="records"
        )
from fastapi import APIRouter

from app.services.analytics import AnalyticsService


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)

analytics_service = AnalyticsService()


@router.get("/summary")
def get_summary():

    return {
        "success": True,
        "data": analytics_service.get_summary()
    }


@router.get("/sales-by-region")
def sales_by_region():

    return {
        "success": True,
        "data": analytics_service.get_sales_by_region()
    }


@router.get("/profit-by-category")
def profit_by_category():

    return {
        "success": True,
        "data": analytics_service.get_profit_by_category()
    }


@router.get("/top-products")
def top_products(limit: int = 10):

    return {
        "success": True,
        "data": analytics_service.get_top_products(
            limit
        )
    }


@router.get("/sales-by-month")
def sales_by_month():

    return {
        "success": True,
        "data": analytics_service.get_sales_by_month()
    }
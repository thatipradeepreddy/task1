from fastapi import APIRouter
from app.database import collection
from app.models import Item

router = APIRouter()

@router.post("/items/")
async def create_item(item: Item):
    result = await collection.insert_one(item.dict())
    return {"id": str(result.inserted_id)}

@router.get("/items/")
async def get_items():
    items = await collection.find().to_list(100)
    return items

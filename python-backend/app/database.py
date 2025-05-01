from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://thatipradeepreddy01:KLtx19Wv9fY3cpDe@cluster0.denzzhe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = AsyncIOMotorClient(MONGO_URL)
db = client["testdb"] 
collection = db["items"]

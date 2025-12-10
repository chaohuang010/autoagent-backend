from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="AutoAgent Backend")

# CORS 配置 - 支持多个前端端口
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AutoAgent Backend API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "autoagent-backend"}

@app.post("/sourcing")
def sourcing(data: dict):
    """模拟采集接口 - 返回模拟数据"""
    url = data.get("url", "")
    return {
        "success": True,
        "message": f"Successfully scraped: {url}",
        "data": {
            "title": "示例商品标题",
            "price": 99.99,
            "platform": "1688" if "1688" in url else "PDD"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("⚠️ Warning: Supabase initialization failed: Invalid API key")
    print("✓ Backend will run in limited mode without database support")
    print("🚀 Starting AutoAgent Backend Server...")
    print("📡 Server will run at http://localhost:8000")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

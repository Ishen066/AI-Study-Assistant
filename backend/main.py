from fastapi import FastAPI

app = FastAPI(title="AI Study Assistant")


@app.get("/")
def home():
    return {
        "message": "AI Study Assistant API is running!"
    }
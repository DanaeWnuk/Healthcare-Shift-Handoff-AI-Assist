from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Reads from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("DEBUG: SUPABASE_URL =", SUPABASE_URL)
print("DEBUG: SUPABASE_KEY starts with =", SUPABASE_KEY[:8] if SUPABASE_KEY else None)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase URL or Key in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()


# Logins
class UserSignUp(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

# Auth Routes
@app.post("/signup")
def signup(user: UserSignUp):
    response = supabase.auth.sign_up({
        "email": user.email,
        "password": user.password,
        "options":{
            "data": {"role": user.role}
        }
    })
    if response.user is None:
        raise HTTPException(status_code=400, detail=response.message)
    return {"message": "User created", "user_id": response.user.id, "role": user.role}

@app.post("/login")
def login(user: UserLogin):
    response = supabase.auth.sign_in({
        "email": user.email,
        "password": user.password
    })
    if response.user is None:
        raise HTTPException(status_code=400, detail=response.message)
    return {"message": "Logged in", "access_token": response.session.access_token}

# Patient Info
@app.get("/patients/{patient_id}")
def get_patient(patient_id: int):
    response = supabase.table("patients").select("*").eq("id", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return response.data[0]

# Database Connection Testing
@app.get("/test-db")
def test_db():
    try:
        result = supabase.table("patients").select("*").limit(1).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

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
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

# --------Auth Routes----------
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
    response = supabase.auth.sign_in_with_password({
        "email": user.email,
        "password": user.password
    })
    if not response or not response.session:
        raise HTTPException(status_code=400, detail="Invalid login")
    return {"message": "Logged in", "access_token": response.session.access_token}

# ---------Patient Info----------
@app.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    response = supabase.table("patients").select("*").eq("Id", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return response.data

# Get patients allergies
@app.get("/patients/{patient_id}/allergies")
def get_patient_allergies(patient_id: str):
    response = supabase.table("allergies").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No allergies found")
    return response.data

# Get patients careplans
@app.get("/patients/{patient_id}/careplanes")
def get_patient_careplans(patient_id: str):
    response = supabase.table("careplanes").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No careplan found")
    return response.data

# Get patients conditions
@app.get("/patients/{patient_id}/conditions")
def get_patient_conditions(patient_id: str):
    response = supabase.table("conditions").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No conditions found")
    return response.data

# Get patients devices
@app.get("/patients/{patient_id}/devices")
def get_patient_devices(patient_id: str):
    response = supabase.table("devices").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No devices found")
    return response.data

# Get patients encounters
@app.get("/patients/{patient_id}/encounters")
def get_patient_encounters(patient_id: str):
    response = supabase.table("encounters").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No encounters found")
    return response.data

# Get patients imaging studies
@app.get("/patients/{patient_id}/imaging_studies")
def get_patient_imaging_sudies(patient_id: str):
    response = supabase.table("imaging_studies").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No imaging studies found")
    return response.data

# Get patients immunizations
@app.get("/patients/{patient_id}/immunizations")
def get_patient_immunizations(patient_id: str):
    response = supabase.table("immunizations").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No immunizations found")
    return response.data

# Get patients medications
@app.get("/patients/{patient_id}/medications")
def get_patient_medications(patient_id: str):
    response = supabase.table("medications").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No medications found")
    return response.data

# Get patients observations
@app.get("/patients/{patient_id}/observations")
def get_patient_observations(patient_id: str):
    response = supabase.table("observations").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No observations found")
    return response.data

# Get patients procedures
@app.get("/patients/{patient_id}/procedures")
def get_patient_procedures(patient_id: str):
    response = supabase.table("procedures").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No procedures found")
    return response.data

# -------Database Connection Testing-------
@app.get("/test-db")
def test_db():
    try:
        result = supabase.table("patients").select("*").limit(1).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

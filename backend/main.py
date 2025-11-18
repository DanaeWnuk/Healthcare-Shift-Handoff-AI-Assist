from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from langchain_core.prompts.prompt import PromptTemplate
from langchain_core.runnables.base import RunnableSequence
from langchain_huggingface import HuggingFaceEndpoint #Provides an interface to interact with models hosted on Hugging Face.
from fastapi.middleware.cors import CORSMiddleware #Essential for handling Cross-Origin Resource Sharing (CORS) issues.
import os
from datetime import datetime, timezone
import logging
import jwt

# Reads from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "your_huggingface_token_here" #When run locally use your own token. You can get a token for free by creating a hugging face account. Learn more about Hugging Face Tokens here: https://huggingface.co/docs/hub/en/security-tokens

print("DEBUG: SUPABASE_URL =", SUPABASE_URL)
print("DEBUG: SUPABASE_KEY starts with =", SUPABASE_KEY[:8] if SUPABASE_KEY else None)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase URL or Key in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI()
security = HTTPBearer()
app.add_middleware( #CORS configuration
    CORSMiddleware,
    allow_origins = ["*"], 
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

# ---- Model ---- FAIR WARNING I am not 100% sure that this is where this should go within the code, but I'm putting it here for now. If you would prefer this somewhere else, please move it. #
class NoteRequest(BaseModel):
    situation: str
    background: str
    assessment: str
    recommendation: str

# ---- LangChain Setup ---- #Again, move this if its not where you think it should be in the code. Do make sure to keep it below the Model section though. #
template = """
You are a helpful clinical assistant. You recieve a doctor's note written in the SBAR format:
- Situation
- Background
- Assessment
- Recommendation

Please summarize this note into a concise, medically appropriate summary for another clinician.
Maintain important clinical details and avoid redundancy.

SBAR Note:
Situation: {situation}
Background: {background}
Assessment: {assessment}
Recommendation: {recommendation}

Summary:
"""

prompt = PromptTemplate(
    template = template,
    input_variables = ["situation", "background", "assessment", "recommendation"]
)

llm = HuggingFaceEndpoint(
    repo_id = "EleutherAI/gpt-neo-2.7B",
    temperature = 0.4, 
    max_new_tokens = 150
)

chain = RunnableSequence(first = prompt, last = llm)
# Gets current user, currently not implemented and intended for future use
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token,options={"verify_signature": False})
        return payload.get("email")
    except Exception:
        return "unknown user"

# Audits
def log_audit(request: Request, user_email: str, action: str):
    try:
        endpoint = request.url.path

        supabase.table("audit_logs").insert({
            "user_email": user_email,
            "endpoint": endpoint,
            "action": action,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }).execute()
        logging.info(f"{user_email} | {action} | {endpoint}")
    except Exception as e:
        logging.warning(f"Failed to log audit event: {e}")

# Gets last 10 audits available
@app.get("/audits/recent")
def get_recent_audits():
    response = (
        supabase.table("audit_logs")
        .select("*")
        .order("timestamp", desc=True)
        .limit(10)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="No audit records found")
    return {"recent_audits": response.data}

# Logins
class UserSignUp(BaseModel):
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

# --------Auth Routes----------

@app.post("/summarize") #Accepts POST requests from the frontend holding the doctor's note to be summarized, then it sends the note to be summarized, then it returns the summarized note !!!MOVE IF IT'S NOT IN THE CORRECT SPOT!!!
async def summarize(note: NoteRequest):
    # RunnableSequence.invoke expects a single `input` argument (positional).
    # Pass a mapping with the prompt variables so the PromptTemplate can format it.
    input_payload = {
        "situation": note.situation,
        "background": note.background,
        "assessment": note.assessment,
        "recommendation": note.recommendation,
    }

    # Invoke the chain with the input payload. The result may not be a plain
    # string depending on the Runnable implementation, so coerce to str.
    try:
        result = chain.invoke(input_payload)
        summary_text = str(result).strip()
        return {"summary": summary_text}
    except Exception as e:
        # Log full exception for debugging (kept server-side).
        logging.exception("LLM invocation failed")
        # Provide a safe fallback so the API doesn't return 500 to the client.
        fallback = (
            f"[LLM unavailable] Situation: {note.situation} "
            f"Background: {note.background} Assessment: {note.assessment} "
            f"Recommendation: {note.recommendation}"
        )
        return {"summary": fallback, "llm_error": str(e)}

@app.post("/signup")
def signup(user: UserSignUp, request: Request):
    response = supabase.auth.sign_up({
        "email": user.email,
        "password": user.password,
        "options":{
            "data": {"role": user.role}
        }
    })
    if response.user is None:
        raise HTTPException(status_code=400, detail=response.message)
    
    log_audit(request, user.email, "SIGNUP")

    return {"message": "User created", "user_id": response.user.id, "role": user.role}

@app.post("/login")
def login(user: UserLogin, request: Request):
    response = supabase.auth.sign_in_with_password({
        "email": user.email,
        "password": user.password
    })
    if not response or not response.session:
        raise HTTPException(status_code=400, detail="Invalid login")
    
    log_audit(request, user.email, "LOGIN_SUCCESS")

    return {"message": "Logged in", "access_token": response.session.access_token}

# Fake email for current testing will update for actual users once further along
user_email = "testing@test.com"

# ---------Patient Info----------
#Get all patients (optional pagination)
@app.get("/patients")
def get_all_patients(request: Request, limit: int = 50, offset: int = 0):
    response = (
        supabase.table("patients")
        .select("*")
        .range(offset, offset + limit - 1)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="No patients found")
    log_audit(request, user_email, "VIEW_ALL_PATIENTS")
    return {"patients": response.data}

# Get a patient
@app.get("/patients/{patient_id}")
def get_patient(patient_id: str, request: Request):
    response = supabase.table("patients").select("*").eq("Id", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    log_audit(request, user_email, f"VIEW_PATIENT_{patient_id}")
    return response.data

# Get patients allergies
@app.get("/patients/{patient_id}/allergies")
def get_patient_allergies(patient_id: str, request: Request):
    response = supabase.table("allergies").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No allergies found")
    log_audit(request, user_email, f"VIEW_ALLERGIES_{patient_id}")
    return response.data

# Get patients careplans
@app.get("/patients/{patient_id}/careplans")
def get_patient_careplans(patient_id: str, request: Request):
    response = supabase.table("careplans").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No careplan found")
    user_email = "testing@test.com"
    log_audit(request, user_email, f"VIEW_CAREPLANS_{patient_id}")
    return response.data

# Get patients conditions
@app.get("/patients/{patient_id}/conditions")
def get_patient_conditions(patient_id: str, request: Request):
    response = supabase.table("conditions").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No conditions found")
    log_audit(request, user_email, f"VIEW_CONDITIONS_{patient_id}")
    return response.data

# Get patients devices
@app.get("/patients/{patient_id}/devices")
def get_patient_devices(patient_id: str, request: Request):
    response = supabase.table("devices").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No devices found")
    log_audit(request, user_email, f"VIEW_DEVICES_{patient_id}")
    return response.data

# Get patients encounters
@app.get("/patients/{patient_id}/encounters")
def get_patient_encounters(patient_id: str, request: Request):
    response = supabase.table("encounters").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No encounters found")
    log_audit(request, user_email, f"VIEW_ENCOUNTERS_{patient_id}")
    return response.data

# Get patients imaging studies
@app.get("/patients/{patient_id}/imaging_studies")
def get_patient_imaging_sudies(patient_id: str, request: Request):
    response = supabase.table("imaging_studies").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No imaging studies found")
    log_audit(request, user_email, f"VIEW_IMAGING_STUDIES_{patient_id}")
    return response.data

# Get patients immunizations
@app.get("/patients/{patient_id}/immunizations")
def get_patient_immunizations(patient_id: str, request: Request):
    response = supabase.table("immunizations").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No immunizations found")
    log_audit(request, user_email, f"VIEW_IMMUNIZATIONS_{patient_id}")
    return response.data

# Get patients medications
@app.get("/patients/{patient_id}/medications")
def get_patient_medications(patient_id: str, request: Request):
    response = supabase.table("medications").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No medications found")
    log_audit(request, user_email, f"VIEW_MEDICATIONS_{patient_id}")
    return response.data

# Get patients observations
@app.get("/patients/{patient_id}/observations")
def get_patient_observations(patient_id: str, request: Request):
    response = supabase.table("observations").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No observations found")
    log_audit(request, user_email, f"VIEW_OBSERVATIONS_{patient_id}")
    return response.data

# Get patients procedures
@app.get("/patients/{patient_id}/procedures")
def get_patient_procedures(patient_id: str, request: Request):
    response = supabase.table("procedures").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No procedures found")
    log_audit(request, user_email, f"VIEW_PROCEDURES_{patient_id}")
    return response.data

# -------Database Connection Testing-------
# To test database, run this, http://127.0.0.1:8000/test-db, in a browswer and it will pull patient info for an "Annalise Glover"
@app.get("/test-db")
def test_db():
    try:
        result = supabase.table("patients").select("*").limit(1).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Testing for inserting audit_logs into table
@app.get("/test-insert-audit")
def test_insert_audit():
    try:
        result = supabase.table("audit_logs").insert({
            "user_email": "test@example.com",
            "endpoint": "/test-insert-audit",
            "action": "TEST_INSERT",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

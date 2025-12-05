import uuid
from fastapi import FastAPI, HTTPException, Request, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware #Essential for handling Cross-Origin Resource Sharing (CORS) issues.
import os
from datetime import datetime, timezone
import logging
import jwt
import pyaudio
import wave
import whisper
import threading
from typing import Dict
import requests

# Reads from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
HF_API_TOKEN = os.getenv("HF_API_TOKEN") #DO NOT FORGET!!! You MUST put your Hugging Face Token in the .env file to replace the text that says your_real_token_here, otherwise it will not work.


print("DEBUG: SUPABASE_URL =", SUPABASE_URL)
print("DEBUG: SUPABASE_KEY starts with =", SUPABASE_KEY[:8] if SUPABASE_KEY else None)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase URL or Key in .env file")

if not HF_API_TOKEN:
    raise RuntimeError("Missing HF_API_TOKEN in .env file")


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI()
security = HTTPBearer()
audio = pyaudio.PyAudio()
model = whisper.load_model('base') # AI model used to analyze wave file
sessions: Dict[str, dict] = {} # Track streams for each client session

app.add_middleware( #CORS configuration
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ---- Model ---- 
class NoteRequest(BaseModel):
    situation: str
    background: str
    assessment: str
    recommendation: str
#-------------- Hugging Face Summarizer --------------

HF_MODEL_ID = "Falconsai/medical_summarization"

HF_HEADERS = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
    "Content-Type": "application/json"
}

def huggingface_summarize(prompt: str) -> str: #Sends prompt to Hugging Face Serverless Inference API and returns generated text.
    url = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL_ID}"
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "temperature": 0.4,
            "max_new_tokens": 200
        }
    }

    response = requests.post(url, headers=HF_HEADERS, json=payload)

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail = f"HF API Error {response.status_code}: {response.text}"
        )

    data = response.json()

    #Handles possible HF API response formats
    if isinstance(data, list) and "summary_text" in data[0]:
        summary = data[0]["summary_text"].strip()
        return summary

    if isinstance(data, dict) and "summary_text" in data:
        return data["summary_text"].strip()

    return str(data)

# Gets current user
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

# Stream and transcribe audio
def recording_worker(session_id: str):
    # Get the session ID
    session = sessions.get(session_id)

    # Stream configuration
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 16000
    CHUNK = 1024
    RECORD_SECONDS = 10
    WAVE_OUTPUT_FILENAME = f"{session_id}_output.wav"
    DEFAULT_INDEX = audio.get_default_input_device_info() # get the user's default microphone

    # Audio frame buffer
    frames = []

    try:
        while (session['is_recording']):
            # Get the session ID for changes in values
            session = sessions.get(session_id)

            # Open the stream
            stream = audio.open(
                format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK,
                input_device_index=DEFAULT_INDEX['index']
            )

            session['stream'] = stream # Save stream with current session id

            for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
                # Check if stop called before reading next frame
                if not (session['is_recording']):
                        break
                data = stream.read(CHUNK)
                frames.append(data)

            # Close this session's stream
            if stream:
                stream.stop_stream()
                stream.close()
                stream = None

            # Only create the audio file and transcibe it if there is anything in the buffer
            if frames:
                # Convert to WAV
                waveFile = wave.open(WAVE_OUTPUT_FILENAME, 'wb')
                waveFile.setnchannels(CHANNELS)
                waveFile.setsampwidth(audio.get_sample_size(FORMAT))
                waveFile.setframerate(RATE)
                waveFile.writeframes(b''.join(frames))
                waveFile.close()

                # Transcribe
                audio_data = whisper.pad_or_trim(whisper.load_audio(WAVE_OUTPUT_FILENAME))
                result = whisper.transcribe(model, audio_data, task="translate", fp16=False)
                session['transcription'].append(result["text"])
                os.remove(WAVE_OUTPUT_FILENAME) # No need to keep the voice file
     
    except Exception as e:
        print(f"Recording error in session {session_id}: {e}")    

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

@app.post("/summarize")
async def summarize(note: NoteRequest):
    prompt = f"""
You are a helpful clinical assistant. You receive a doctor's note written in the SBAR format:
- Situation
- Background
- Assessment
- Recommendation

Please summarize this note into a concise, medically appropriate summary for another clinician.
Maintain important clinical details and avoid redundancy.

SBAR Note:
Situation: {note.situation}
Background: {note.background}
Assessment: {note.assessment}
Recommendation: {note.recommendation}

Summary:
"""

    summary_text = huggingface_summarize(prompt)
    return {"summary": summary_text.strip()}

@app.post("/signup")
def signup(user: UserSignUp, request: Request):
    try:
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options":{
                "data": {"role": user.role}
            }
        })
    except Exception as e:
        # Supabase client raises on 4xx/5xx; return a clean HTTP error to the client
        logging.warning(f"Signup failed for {user.email}: {e}")
        # Try to provide a helpful message; avoid leaking sensitive internals
        msg = getattr(e, 'response', None)
        if msg:
            try:
                # httpx.HTTPStatusError may have a response with text/json
                body = e.response.text
                raise HTTPException(status_code=400, detail=f"Signup failed: {body}")
            except Exception:
                raise HTTPException(status_code=400, detail="Signup failed")
        raise HTTPException(status_code=400, detail="Signup failed")

    if response.user is None:
        # Supabase sometimes returns a message on failure
        detail = getattr(response, 'message', 'User creation failed')
        raise HTTPException(status_code=400, detail=detail)

    log_audit(request, user.email, "SIGNUP")

    return {"message": "User created", "user_id": response.user.id, "role": user.role}

@app.post("/login")
def login(user: UserLogin, request: Request):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
    except Exception as e:
        # supabase client raises on 4xx/5xx;
        # return a 401 to the client instead of letting an unhandled exception bubble
        logging.warning(f"Login failed for {user.email}: {e}")
        raise HTTPException(status_code=401, detail="Invalid login credentials")

    if not response or not response.session:
        # Defensive: if supabase returns an unexpected shape
        logging.warning(f"Login attempt returned no session for {user.email}: {response}")
        raise HTTPException(status_code=401, detail="Invalid login credentials")

    log_audit(request, user.email, "LOGIN_SUCCESS")

    return {"message": "Logged in", "access_token": response.session.access_token}

@app.post("/logout")
def logout(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    # decode email for audit (no signature verification needed)
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        email = payload.get("email", "unknown")
    except Exception:
        email = "unknown"

    # Supabase logout call
    url = f"{SUPABASE_URL}/auth/v1/logout"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token}"
    }

    try:
        requests.post(url, headers=headers)
    except Exception as e:
        logging.warning("Supabase logout failed: " + str(e))

    # Audit log
    log_audit(request, email, "LOGOUT")

    return {"message": "Logged out"}


# ---------Patient Info----------
#Get all patients (optional pagination)
@app.get("/patients")
def get_all_patients(request: Request, user_email:str = Depends(get_current_user), limit: int = 50, offset: int = 0):
    response = (
        supabase.table("patients")
        .select("*")
        .range(offset, offset + limit - 1)
        .execute()
    )
    # If the table is empty return an empty list instead of 404 so the UI
    # can render an empty state. Audit as usual (log_audit already handles
    # its own errors).
    patients = response.data or []
    log_audit(request, user_email, "VIEW_ALL_PATIENTS")
    return {"patients": patients}

# Get a patient
@app.get("/patients/{patient_id}")
def get_patient(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("patients").select("*").eq("Id", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    log_audit(request, user_email, f"VIEW_PATIENT_{patient_id}")
    return response.data

# Get patients allergies
@app.get("/patients/{patient_id}/allergies")
def get_patient_allergies(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("allergies").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No allergies found")
    log_audit(request, user_email, f"VIEW_ALLERGIES_{patient_id}")
    return response.data

# Get patients careplans
@app.get("/patients/{patient_id}/careplans")
def get_patient_careplans(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("careplans").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No careplan found")
    log_audit(request, user_email, f"VIEW_CAREPLANS_{patient_id}")
    return response.data

# Get patients conditions
@app.get("/patients/{patient_id}/conditions")
def get_patient_conditions(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("conditions").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No conditions found")
    log_audit(request, user_email, f"VIEW_CONDITIONS_{patient_id}")
    return response.data

# Get patients devices
@app.get("/patients/{patient_id}/devices")
def get_patient_devices(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("devices").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No devices found")
    log_audit(request, user_email, f"VIEW_DEVICES_{patient_id}")
    return response.data

# Get patients encounters
@app.get("/patients/{patient_id}/encounters")
def get_patient_encounters(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("encounters").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No encounters found")
    log_audit(request, user_email, f"VIEW_ENCOUNTERS_{patient_id}")
    return response.data

# Get patients imaging studies
@app.get("/patients/{patient_id}/imaging_studies")
def get_patient_imaging_studies(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("imaging_studies").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No imaging studies found")
    log_audit(request, user_email, f"VIEW_IMAGING_STUDIES_{patient_id}")
    return response.data

# Get patients immunizations
@app.get("/patients/{patient_id}/immunizations")
def get_patient_immunizations(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("immunizations").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No immunizations found")
    log_audit(request, user_email, f"VIEW_IMMUNIZATIONS_{patient_id}")
    return response.data

# Get patients medications
@app.get("/patients/{patient_id}/medications")
def get_patient_medications(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("medications").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No medications found")
    log_audit(request, user_email, f"VIEW_MEDICATIONS_{patient_id}")
    return response.data

# Get patients observations
@app.get("/patients/{patient_id}/observations")
def get_patient_observations(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("observations").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No observations found")
    log_audit(request, user_email, f"VIEW_OBSERVATIONS_{patient_id}")
    return response.data

# Get patients procedures
@app.get("/patients/{patient_id}/procedures")
def get_patient_procedures(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    response = supabase.table("procedures").select("*").eq("PATIENT", patient_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No procedures found")
    log_audit(request, user_email, f"VIEW_PROCEDURES_{patient_id}")
    return response.data

# Save SBAR Note
@app.post("/patients/{patient_id}/sbar")
def save_sbar(patient_id: str, note:NoteRequest, request: Request, user_email: str = Depends(get_current_user)):
    try:
        response = supabase.table("patients").select("*").eq("Id", patient_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {e}")
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    data = {
        "patient_id": patient_id,
        "situation": note.situation,
        "background": note.background,
        "assessment": note.assessment,
        "recommendation": note.recommendation
    }

    try:
        response = supabase.table("sbar").insert(data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save SBAR: {e}")
    
    sbar_id = response.data[0]["id"]
    log_audit(request, user_email, f"Save_SBAR_{patient_id}")
    return {
        "message": "SBAR note saved",
        "sbar_id": sbar_id
    }

# Get SBAR note
@app.get("/patients/{patient_id}/sbar_notes")
def read_sbar(patient_id: str, request: Request, user_email: str = Depends(get_current_user)):
    try:
        response = supabase.table("patients").select("*").eq("Id", patient_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {e}")
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    try:
        response = supabase.table("sbar").select("situation, background, assessment, recommendation").eq("patient_id", patient_id).order("created_at", desc=True).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch SBAR notes: {e}")
    if not response.data:
        return {"sbar": []}
    
    log_audit(request, user_email, f"VIEW_SBAR_{patient_id}")
    return {"sbar": response.data[0]}

# -------Voice-To-Text-------
#Start Recording
@app.post("/start-recording")
def start_recording(background_tasks: BackgroundTasks):
    session_id = str(uuid.uuid4()) # Generate a new session id

    # Initialize session details
    sessions[session_id] = {
        'is_recording': True,
        'transcription': [],
        'stream': None
    }
    
     # Start recording in background
    background_tasks.add_task(recording_worker, session_id)

    return {
        "session_id": session_id, 
        "recording_started": True, 
        "message": "Recording started in background."
    }

#Read Transcription
@app.get('/read-transcription/{session_id}')
def read_transcription(session_id: str):
    session = sessions.get(session_id)

    return {
        "session_id": session_id, 
        "transcription": session["transcription"]
    }

#Stop Recording
@app.post('/stop-recording/{session_id}')
def stop_recording(session_id: str):
    session = sessions.get(session_id)
    session['is_recording'] = False
    sessions.pop(session_id) # No need to keep the session information

    return {
        "session_id": session_id,
        "recording_stopped": True, 
        "message": "Recording stopped.",
    }

# Save AI Summary
@app.post("/patients/{patient_id}/save_summary")
def save_ai_summary(patient_id: str, summary_text: str, request: Request, user_email: str = Depends(get_current_user)):
    try:
        patient_response = supabase.table("patients").select("*").eq("Id", patient_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase query failed: {e}")
        
    if not patient_response.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    try:
        sbar_response = (
            supabase
            .table("sbar")
            .select("*")
            .eq("patient_id", patient_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch SBAR notes: {e}")

    if not sbar_response.data:
        raise HTTPException(status_code=404, detail="No SBAR notes found for this patient")

    sbar_id = sbar_response.data[0]["id"]
    
    data = {
        "patient_id": patient_id,
        "sbar_id": sbar_id,
        "summary": summary_text
    }
    try:
        response = supabase.table("ai_summaries").insert(data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save summary: {e}")
    log_audit(request, user_email, f"Save_AI_SUMMARY_{patient_id}")
    return {"message": "AI summary saved successfully", "data": response.data}

# Get AI Summary
@app.get("/patients/{patient_id}/ai_summaries")
def read_ai_summaries(patient_id: str, request:Request, user_email: str = Depends(get_current_user)):
    try:
        response = supabase.table("ai_summaries").select("summary").eq("patient_id", patient_id).order("created_at", desc=True).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch AI summaries: {e}")
    if not response.data:
        raise HTTPException(status_code=404, detail="No AI summaries found for this patient")
    log_audit(request, user_email, f"VIEW_AI_SUMMARIES_{patient_id}")
    return {"summary": response.data[0]["summary"]}

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

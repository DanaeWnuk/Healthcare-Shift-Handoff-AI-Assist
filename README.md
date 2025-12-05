# Healthcare-Shift-Handoff-AI-Assist

Built with React Native and Expo mobile building suite.

## Backend
1. Navigate to the backend folder:
```bash
cd backend
```
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Start the FastAPI server:
```bash
uvicorn main:app --reload
```
4. The backend will run at:
```bash
http://localhost:8000
```

5. Get your hugging face token: https://huggingface.co/
- Make your own account and login
- Go to access tokens
- Click create new token
- Allow read permissions and then create it.
- Put inside .env file in backend.

## Frontend
1. To run, clone the repo
```bash
cd frontend; npm i;
```
2. Start the Expo server (only ever run this in /frontend)
```bash
npx expo start
```
3. It will build, then display a menu with a QR code in the terminal
```bash
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```
4. Download Expo Go from:
- Google Play Store
- Apple App Store
5. Open Expo Go on your mobile device. Scan the QR code displayed in your terminal or browser after running npm expo start. The app will load on your device.

### Note:
- Ensure your mobile device and development machine are on the same Wi-Fi network.
- If you have issues with the QR code, you can use the LAN URL shown in the Expo CLI output.

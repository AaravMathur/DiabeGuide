# DiabeGuide - Smart Diabetes Assistant

DiabeGuide is a Flask-based web application designed to serve as a smart assistant for individuals managing diabetes. It includes features for tracking health metrics, a chatbot for answering questions, and an emergency contact system.

## Features
- User authentication (Signup & Login) with OTP email verification
- Health metric tracker (e.g., blood sugar levels)
- AI-powered Chatbot using the Gemini API
- Emergency information page
- User profile management

## Project Setup

Follow these instructions to set up and run the project in a new environment.

### 1. Prerequisites
- Python 3.10+
- `venv` for virtual environments

### 2. Clone the Repository
Clone this project to your local machine.
```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 3. Create and Activate Virtual Environment
Create a Python virtual environment to isolate project dependencies.

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
.\\venv\\Scripts\\activate
```

### 4. Install Dependencies
Install all the required packages using the `requirements.txt` file.
```bash
pip install -r diabeGuide/requirements.txt
```

### 5. Configure Environment Variables
The project uses a `.env` file to manage secret keys and configuration.

- **Create the `.env` file:** Copy the example file to create your own local configuration file.
  ```bash
  cp diabeGuide/.env.example diabeGuide/.env
  ```
- **Edit the `.env` file:** Open `diabeGuide/.env` with a text editor and fill in your secret keys:
  - `GEMINI_API_KEY`: Your API key from Google AI Studio.
  - `SMTP_USERNAME`: Your email address for sending OTPs.
  - `SMTP_PASSWORD`: Your email account's **App Password** (if using Gmail, see Google's documentation for generating one).

### 6. Run the Application
Once the setup is complete, you can run the Flask application.
```bash
flask --app diabeGuide/app.py run
```
The application will be available at `http://127.0.0.1:5000`.

---
*This README was generated to make the project portable.*

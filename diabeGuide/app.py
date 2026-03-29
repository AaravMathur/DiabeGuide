import os
from flask import Flask, redirect, url_for
import google.generativeai as genai
from dotenv import load_dotenv
from flask_login import LoginManager, login_required, current_user
from .data import get_user_by_id

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'a_very_secret_key') # Set a secret key

    # Configure Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login' # Specify the login view

    @login_manager.user_loader
    def load_user(user_id):
        return get_user_by_id(user_id)

    # Configure the Gemini API
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            genai.configure(api_key=api_key)
            # Debug: List available models to Vercel logs
            print("Listing available Gemini models:")
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    print(f"Model found: {m.name}")
            
            app.model = genai.GenerativeModel('gemini-1.5-flash')
            print("Gemini model initialized: gemini-1.5-flash")
        except Exception as e:
            print(f"ERROR: Gemini initialization failed: {e}")
            app.model = None
    else:
        print("WARNING: GEMINI_API_KEY not set.")
        app.model = None

    with app.app_context():
        # Import and register blueprints
        from .routes.dashboard import dashboard_bp
        from .routes.tracker import tracker_bp
        from .routes.chatbot import chatbot_bp
        from .routes.emergency import emergency_bp
        from .routes.auth import auth_bp # Import auth blueprint
        from .routes.profile import profile_bp # Import profile blueprint
        from .routes.welcome import welcome_bp # Import welcome blueprint
        from .routes.about import about_bp

        app.register_blueprint(dashboard_bp)
        app.register_blueprint(tracker_bp)
        app.register_blueprint(chatbot_bp)
        app.register_blueprint(emergency_bp)
        app.register_blueprint(auth_bp) # Register auth blueprint
        app.register_blueprint(profile_bp) # Register profile blueprint
        app.register_blueprint(welcome_bp) # Register welcome blueprint
        app.register_blueprint(about_bp)

        # Protect routes that require login
        @app.route('/')
        @login_required
        def index():
            # Check if profile is complete, if not redirect to welcome page
            if not current_user.is_profile_complete():
                return redirect(url_for('welcome.welcome'))
            return redirect(url_for('dashboard.dashboard'))

    return app
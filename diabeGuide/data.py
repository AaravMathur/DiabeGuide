import json
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import os

# Base directories for user-specific data
USER_DATA_DIR = 'diabeGuide/user_data'
USERS_FILE = 'diabeGuide/users.json'

# Ensure user data directory exists
if not os.path.exists(USER_DATA_DIR):
    os.makedirs(USER_DATA_DIR)

# --- User Management ---
class User(UserMixin):
    def __init__(self, id, username, password_hash, email=None, weight=None, height=None, age=None, diabetes_type=None, email_verified=False):
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.email = email
        self.weight = weight
        self.height = height
        self.age = age
        self.diabetes_type = diabetes_type
        self.email_verified = email_verified

    def get_id(self):
        return str(self.id)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_profile_complete(self):
        """Check if user profile is complete (has weight, height, age, and diabetes_type)"""
        # Check if all required fields are filled (not None, not empty string)
        weight_ok = self.weight is not None and str(self.weight).strip() != ''
        height_ok = self.height is not None and str(self.height).strip() != ''
        age_ok = self.age is not None and str(self.age).strip() != ''
        diabetes_type_ok = self.diabetes_type is not None and str(self.diabetes_type).strip() != ''
        
        return weight_ok and height_ok and age_ok and diabetes_type_ok

# In-memory storage for users for now
users = {}
next_user_id = 1

def load_users():
    global users, next_user_id
    try:
        with open(USERS_FILE, 'r') as f:
            users_data = json.load(f)
            users.clear()  # Clear existing users to avoid duplicates
            for user_id, user_info in users_data.items():
                # Handle None, empty string, or missing values
                weight = user_info.get('weight')
                height = user_info.get('height')
                age = user_info.get('age')
                diabetes_type = user_info.get('diabetes_type')
                
                # Convert empty strings to None
                if weight == '':
                    weight = None
                if height == '':
                    height = None
                if age == '':
                    age = None
                if diabetes_type == '':
                    diabetes_type = None
                
                email = user_info.get('email')
                email_verified = user_info.get('email_verified', False)
                if email == '':
                    email = None
                
                users[user_id] = User(
                    user_id,
                    user_info['username'],
                    user_info['password_hash'],
                    email,
                    weight,
                    height,
                    age,
                    diabetes_type,
                    email_verified
                )
            if users:
                next_user_id = max([int(uid) for uid in users.keys()]) + 1
    except (FileNotFoundError, json.JSONDecodeError):
        users = {}
        next_user_id = 1

def save_users():
    users_data = {}
    for user in users.values():
        users_data[user.id] = {
            'username': user.username,
            'password_hash': user.password_hash,
            'email': user.email,
            'weight': user.weight,
            'height': user.height,
            'age': user.age,
            'diabetes_type': user.diabetes_type,
            'email_verified': user.email_verified
        }
    with open(USERS_FILE, 'w') as f:
        json.dump(users_data, f, indent=4)

def get_user_by_id(user_id):
    return users.get(str(user_id))

def get_user_by_username(username):
    for user in users.values():
        if user.username == username:
            return user
    return None

def get_user_by_email(email):
    for user in users.values():
        if user.email and user.email.lower() == email.lower():
            return user
    return None

def get_user_by_username_or_email(identifier):
    """Get user by username or email"""
    user = get_user_by_username(identifier)
    if not user:
        user = get_user_by_email(identifier)
    return user

def reload_users():
    """Reload users from file - call this when user data might have changed"""
    load_users()

def create_user(username, password_hash, email=None):
    global next_user_id
    if get_user_by_username(username):
        return None # User already exists
    if email and get_user_by_email(email):
        return None # Email already exists

    user = User(str(next_user_id), username, password_hash, email=email, email_verified=False)
    users[user.id] = user
    next_user_id += 1
    save_users()
    return user

# Load users when the module is imported
load_users()

# --- User-specific Data Loading ---
def get_user_tracker_data_file(user_id):
    return os.path.join(USER_DATA_DIR, f'tracker_data_{user_id}.json')

def get_user_chat_history_file(user_id):
    return os.path.join(USER_DATA_DIR, f'chat_history_{user_id}.json')

def load_user_data(user_id):
    data_file = get_user_tracker_data_file(user_id)
    try:
        with open(data_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_user_data(user_id, data):
    data_file = get_user_tracker_data_file(user_id)
    with open(data_file, 'w') as f:
        json.dump(data, f, indent=4)

def load_user_archived_chat_history(user_id):
    chat_file = get_user_chat_history_file(user_id)
    try:
        with open(chat_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_user_archived_chat_history(user_id, history):
    chat_file = get_user_chat_history_file(user_id)
    with open(chat_file, 'w') as f:
        json.dump(history, f, indent=4)

# Global variables for current session chat (will be cleared on logout)
current_session_chat = {}

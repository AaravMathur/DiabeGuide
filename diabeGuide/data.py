import json
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import os
from pymongo import MongoClient
from bson.objectid import ObjectId

# Get MongoDB URI from environment variable
MONGODB_URI = os.getenv('MONGODB_URI')

if MONGODB_URI:
    try:
        # Add serverSelectionTimeoutMS to fail faster if the connection is wrong
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Verify the connection
        client.admin.command('ping')
        db = client.get_database('diabeguide')
        users_col = db.users
        tracker_col = db.tracker_data
        chat_col = db.chat_history
        print("Successfully connected to MongoDB Atlas.")
    except Exception as e:
        print(f"ERROR: Could not connect to MongoDB: {e}")
        users_col = None
        tracker_col = None
        chat_col = None
else:
    # Fallback to empty mocks if not configured
    print("WARNING: MONGODB_URI not set. Data will not persist.")
    users_col = None
    tracker_col = None
    chat_col = None

# --- User Management ---
class User(UserMixin):
    def __init__(self, id, username, password_hash, email=None, weight=None, height=None, age=None, diabetes_type=None, email_verified=False):
        self.id = str(id)
        self.username = username
        self.password_hash = password_hash
        self.email = email
        self.weight = weight
        self.height = height
        self.age = age
        self.diabetes_type = diabetes_type
        self.email_verified = email_verified

    def __setattr__(self, name, value):
        super().__setattr__(name, value)
        # Automatically update MongoDB if a profile field is changed
        profile_fields = ['weight', 'height', 'age', 'diabetes_type', 'email_verified', 'email']
        if name in profile_fields and hasattr(self, 'id') and users_col:
            try:
                users_col.update_one({"_id": ObjectId(self.id)}, {"$set": {name: value}})
            except:
                pass

    def get_id(self):
        return self.id

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_profile_complete(self):
        """Check if user profile is complete"""
        weight_ok = self.weight is not None and str(self.weight).strip() != ''
        height_ok = self.height is not None and str(self.height).strip() != ''
        age_ok = self.age is not None and str(self.age).strip() != ''
        diabetes_type_ok = self.diabetes_type is not None and str(self.diabetes_type).strip() != ''
        return weight_ok and height_ok and age_ok and diabetes_type_ok

def get_user_by_id(user_id):
    if users_col is None: return None
    try:
        user_data = users_col.find_one({"_id": ObjectId(user_id)})
        if user_data:
            return User(
                user_data['_id'],
                user_data['username'],
                user_data['password_hash'],
                user_data.get('email'),
                user_data.get('weight'),
                user_data.get('height'),
                user_data.get('age'),
                user_data.get('diabetes_type'),
                user_data.get('email_verified', False)
            )
    except:
        pass
    return None

def get_user_by_username(username):
    if users_col is None: return None
    user_data = users_col.find_one({"username": username})
    if user_data:
        return User(
            user_data['_id'],
            user_data['username'],
            user_data['password_hash'],
            user_data.get('email'),
            user_data.get('weight'),
            user_data.get('height'),
            user_data.get('age'),
            user_data.get('diabetes_type'),
            user_data.get('email_verified', False)
        )
    return None

def get_user_by_email(email):
    if users_col is None: return None
    user_data = users_col.find_one({"email": email})
    if user_data:
        return User(
            user_data['_id'],
            user_data['username'],
            user_data['password_hash'],
            user_data.get('email'),
            user_data.get('weight'),
            user_data.get('height'),
            user_data.get('age'),
            user_data.get('diabetes_type'),
            user_data.get('email_verified', False)
        )
    return None

def get_user_by_username_or_email(identifier):
    user = get_user_by_username(identifier)
    if not user:
        user = get_user_by_email(identifier)
    return user

def create_user(username, password_hash, email=None):
    if not users_col:
        print("ERROR: create_user failed because users_col is None (DB connection failed).")
        return None
    
    if get_user_by_username(username):
        print(f"ERROR: create_user failed because username '{username}' already exists.")
        return None
    
    if email and get_user_by_email(email):
        print(f"ERROR: create_user failed because email '{email}' already exists.")
        return None

    try:
        user_doc = {
            'username': username,
            'password_hash': password_hash,
            'email': email,
            'email_verified': False
        }
        result = users_col.insert_one(user_doc)
        print(f"Successfully inserted user '{username}' into MongoDB.")
        return get_user_by_id(result.inserted_id)
    except Exception as e:
        print(f"ERROR: MongoDB insert_one failed for user '{username}': {e}")
        return None

def save_users():
    # In MongoDB version, we update individual users, not the whole collection at once.
    # This function is kept for compatibility but is handled differently.
    pass

def reload_users():
    # MongoDB handles data freshness automatically
    pass

# --- Profile Updates ---
# We need a way to update user fields in MongoDB
def update_user_profile(user_id, profile_data):
    if users_col is None: return False
    users_col.update_one({"_id": ObjectId(user_id)}, {"$set": profile_data})
    return True

# --- User-specific Data Loading ---
def load_user_data(user_id):
    if tracker_col is None: return {}
    data = tracker_col.find_one({"user_id": str(user_id)})
    return data.get('data', {}) if data else {}

def save_user_data(user_id, data):
    if tracker_col is None: return
    tracker_col.update_one(
        {"user_id": str(user_id)},
        {"$set": {"data": data}},
        upsert=True
    )

def load_user_archived_chat_history(user_id):
    if chat_col is None: return []
    data = chat_col.find_one({"user_id": str(user_id)})
    return data.get('history', []) if data else []

def save_user_archived_chat_history(user_id, history):
    if chat_col is None: return
    chat_col.update_one(
        {"user_id": str(user_id)},
        {"$set": {"history": history}},
        upsert=True
    )

# Global variables for current session chat (will be cleared on logout)
current_session_chat = {}

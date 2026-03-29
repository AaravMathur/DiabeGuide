from flask import Blueprint, render_template, redirect, url_for, flash, request, session, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from ..data import get_user_by_username, create_user, get_user_by_id, get_user_by_email, get_user_by_username_or_email
from ..utils.email_utils import generate_otp, send_otp_email
import re
from datetime import datetime, timedelta
import logging

auth_bp = Blueprint('auth', __name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.dashboard'))

    if request.method == 'POST':
        # This branch handles the OTP verification
        if request.form.get('verify_otp') == 'true':
            email = session.get('signup_email')
            username = session.get('signup_username')
            password_hash = session.get('signup_password_hash')
            entered_otp = request.form.get('otp')
            stored_otp = session.get('signup_otp')
            otp_expiry = session.get('signup_otp_expiry')
            
            if not all([email, username, password_hash]):
                flash('Your session has expired. Please start over.', 'danger')
                return redirect(url_for('auth.signup'))
            
            if otp_expiry and datetime.now() > datetime.fromisoformat(otp_expiry):
                flash('OTP has expired. Please request a new one.', 'danger')
                session.pop('signup_otp', None)
                session.pop('signup_otp_expiry', None)
                return render_template('signup.html', email=email, username=username, show_otp=True)
            
            if entered_otp == stored_otp:
                # Final check for username/email existence
                if get_user_by_username(username):
                    flash('That username has just been taken. Please choose another.', 'danger')
                    return render_template('signup.html', email=email, show_otp=False)
                if get_user_by_email(email):
                    flash('That email address has just been registered. Please use another.', 'danger')
                    return render_template('signup.html', username=username, show_otp=False)
                
                # Create user in MongoDB
                new_user = create_user(username, password_hash, email=email)
                if new_user:
                    new_user.email_verified = True
                    # Log in the new user
                    login_user(new_user, remember=True)
                    session.clear()
                    flash('Account created successfully! Welcome to DiabeGuide!', 'success')
                    return redirect(url_for('welcome.welcome'))
                else:
                    flash('An unexpected error occurred while creating your account. Please check your DB connection.', 'danger')
                    return redirect(url_for('auth.signup'))
            else:
                session.pop('signup_otp', None)
                session.pop('signup_otp_expiry', None)
                flash('Invalid OTP. Please request a new one.', 'danger')
                return render_template('signup.html', email=email, username=username, show_otp=True)
        
        # This branch handles the initial form submission
        else:
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            
            if not all([username, email, password]):
                flash('Please fill in all fields.', 'danger')
                return render_template('signup.html', show_otp=False)
            
            if not is_valid_email(email):
                flash('Please enter a valid email address.', 'danger')
                return render_template('signup.html', username=username, email=email, show_otp=False)
            
            if get_user_by_username(username):
                flash('Username already exists.', 'danger')
                return render_template('signup.html', email=email, show_otp=False)
            if get_user_by_email(email):
                flash('Email already registered.', 'danger')
                return render_template('signup.html', username=username, show_otp=False)
            
            password_hash = generate_password_hash(password)
            otp = generate_otp()
            if send_otp_email(email, otp):
                session['signup_email'] = email
                session['signup_username'] = username
                session['signup_password_hash'] = password_hash
                session['signup_otp'] = otp
                session['signup_otp_expiry'] = (datetime.now() + timedelta(minutes=10)).isoformat()
                
                flash(f'An OTP has been sent to {email}.', 'success')
                return render_template('signup.html', email=email, username=username, show_otp=True)
            else:
                flash('Error sending OTP. Please try again.', 'danger')
                return render_template('signup.html', username=username, email=email, show_otp=False)

    return render_template('signup.html', show_otp=False)

@auth_bp.route('/resend_otp', methods=['POST'])
def resend_otp():
    email = session.get('signup_email')
    if not email:
        return jsonify({'success': False, 'error': 'Session expired.'}), 400
    otp = generate_otp()
    if send_otp_email(email, otp):
        session['signup_otp'] = otp
        session['signup_otp_expiry'] = (datetime.now() + timedelta(minutes=10)).isoformat()
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'Error sending OTP.'}), 500

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.dashboard'))

    if request.method == 'POST':
        identifier = request.form.get('username_or_email')
        password = request.form.get('password')
        user = get_user_by_username_or_email(identifier)
        
        if user and user.check_password(password):
            login_user(user, remember=True)
            if not user.is_profile_complete():
                return redirect(url_for('welcome.welcome'))
            return redirect(url_for('dashboard.dashboard'))
        else:
            flash('Invalid username/email or password', 'danger')

    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

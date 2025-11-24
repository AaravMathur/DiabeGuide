from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from ..data import save_users, reload_users, get_user_by_id

welcome_bp = Blueprint('welcome', __name__)

@welcome_bp.route('/welcome', methods=['GET', 'POST'])
@login_required
def welcome():
    # Reload user data to ensure we have the latest profile information
    reload_users()
    user = get_user_by_id(current_user.id)
    
    if not user:
        flash('User not found. Please log in again.', 'error')
        return redirect(url_for('auth.logout'))
    
    # If profile is already complete, redirect to dashboard
    if user.is_profile_complete():
        return redirect(url_for('dashboard.dashboard'))
    
    if request.method == 'POST':
        # Update user profile
        user.weight = request.form.get('weight')
        user.height = request.form.get('height')
        user.age = request.form.get('age')
        user.diabetes_type = request.form.get('diabetes_type')
        
        # Also update current_user object
        current_user.weight = user.weight
        current_user.height = user.height
        current_user.age = user.age
        current_user.diabetes_type = user.diabetes_type
        
        save_users()
        
        # Check if profile is now complete
        if user.is_profile_complete():
            flash('Welcome! Your profile has been set up successfully.', 'success')
            return redirect(url_for('dashboard.dashboard'))
        else:
            flash('Please fill in all required fields.', 'warning')
    
    return render_template('welcome.html', user=user)


from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from ..data import save_users, users

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        current_user.weight = request.form.get('weight')
        current_user.height = request.form.get('height')
        current_user.age = request.form.get('age')
        current_user.diabetes_type = request.form.get('diabetes_type')
        save_users() # Save updated user data
        
        # If profile was incomplete and is now complete, redirect to dashboard
        if current_user.is_profile_complete():
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('dashboard.dashboard'))
        else:
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('profile.profile'))

    return render_template('profile.html', user=current_user)

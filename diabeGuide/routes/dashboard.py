from flask import Blueprint, jsonify, render_template
from flask_login import login_required, current_user
from .. import data

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/')
@login_required
def dashboard():
    # Check if profile is complete, if not redirect to welcome page
    if not current_user.is_profile_complete():
        from flask import redirect, url_for
        return redirect(url_for('welcome.welcome'))
    # Pass user-specific tracker data to the dashboard template
    user_tracker_data = data.load_user_data(current_user.id)
    return render_template("dashboard.html", tracker_data=user_tracker_data)

@dashboard_bp.route('/api/download')
@login_required
def download_data():
    # Return user-specific tracker data
    user_tracker_data = data.load_user_data(current_user.id)
    return jsonify(user_tracker_data)

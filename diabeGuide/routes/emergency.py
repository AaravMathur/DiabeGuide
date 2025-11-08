from flask import Blueprint, render_template
from flask_login import login_required

emergency_bp = Blueprint('emergency', __name__)

@emergency_bp.route('/emergency')
@login_required
def emergency():
    return render_template("emergency.html")
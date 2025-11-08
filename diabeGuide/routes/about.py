from flask import Blueprint, render_template
from flask_login import login_required

about_bp = Blueprint('about_bp', __name__)

@about_bp.route('/about')
@login_required
def about():
    return render_template('about.html')

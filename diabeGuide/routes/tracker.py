from flask import Blueprint, request, jsonify, render_template
from flask_login import login_required, current_user
from .. import data

tracker_bp = Blueprint('tracker', __name__)

@tracker_bp.route('/tracker')
@login_required
def tracker():
    return render_template("tracker.html")

@tracker_bp.route('/api/tracker', methods=['GET', 'POST'])
@login_required
def handle_tracker_data():
    if request.method == 'POST':
        req_data = request.get_json()
        sugar_level = req_data.get('sugar_level')
        note = req_data.get('note')
        month = req_data.get('month')
        year = req_data.get('year')

        if not all([sugar_level, note, month, year]):
            return jsonify({'error': 'Missing data'}), 400

        user_tracker_data = data.load_user_data(current_user.id)
        month_year = f"{month}-{year}"

        if month_year not in user_tracker_data:
            user_tracker_data[month_year] = []

        user_tracker_data[month_year].append({'sugar_level': sugar_level, 'note': note})
        data.save_user_data(current_user.id, user_tracker_data)

        return jsonify({'success': True, 'data': user_tracker_data})
    else: # GET request
        user_tracker_data = data.load_user_data(current_user.id)
        return jsonify(user_tracker_data)

@tracker_bp.route('/api/tracker/clear', methods=['POST'])
@login_required
def clear_tracker_data():
    user_tracker_data = {} # Clear data by setting to empty dict
    data.save_user_data(current_user.id, user_tracker_data)
    return jsonify({'success': True})

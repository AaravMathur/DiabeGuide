from flask import Blueprint, request, jsonify, render_template, current_app
from flask_login import login_required, current_user
from google.api_core import exceptions as google_exceptions
import re
from .. import data

chatbot_bp = Blueprint('chatbot', __name__)

# current_session_chat will now be a dictionary keyed by user_id
# This ensures each user has their own temporary chat history
# It will be cleared on logout or browser close
data.current_session_chat = {}

@chatbot_bp.route('/chatbot')
@login_required
def chatbot():
    return render_template("chatbot.html")

@chatbot_bp.route('/api/chat', methods=['POST'])
@login_required
def chat():
    req_data = request.get_json()
    user_message = req_data.get('message')
    print(f"Received message: {user_message}")
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    try:
        # Get user-specific tracker data
        user_tracker_data = data.load_user_data(current_user.id)
        context = "\n".join([f"{month_year}: {entries}" for month_year, entries in user_tracker_data.items()])

        # Get user profile information
        user_profile = f"User Profile: Weight={current_user.weight}, Height={current_user.height}, Age={current_user.age}, Diabetes Type={current_user.diabetes_type}"

        prompt = f"""You are DiabeGuide, a friendly and knowledgeable assistant for diabetes management.
        Your goal is to provide comprehensive, helpful, and encouraging advice to users.
        Do not mention that you are an AI model.
        Provide detailed and actionable suggestions based on the user's message, their tracker data, and their profile information.

        {user_profile}

        User message: {user_message}

        Tracker data:
        {context}
        """
        print(f"Generated prompt: {prompt}")

        response = current_app.model.generate_content(prompt)
        print(f"Received response from Gemini: {response.text}")

        # Get user-specific archived chat history
        user_archived_chat_history = data.load_user_archived_chat_history(current_user.id)

        # Initialize current session chat for the user if it doesn't exist
        if current_user.id not in data.current_session_chat:
            data.current_session_chat[current_user.id] = []

        # Save user and bot messages to current session chat and archived chat history
        data.current_session_chat[current_user.id].append({'role': 'user', 'message': user_message})
        data.current_session_chat[current_user.id].append({'role': 'bot', 'message': response.text})
        user_archived_chat_history.append({'role': 'user', 'message': user_message})
        user_archived_chat_history.append({'role': 'bot', 'message': response.text})
        data.save_user_archived_chat_history(current_user.id, user_archived_chat_history)

        return jsonify({'reply': response.text})
    except google_exceptions.PermissionDenied as e:
        print(f"A permission error occurred: {e}")
        return jsonify({'error': 'Invalid API key. Please check your API key and make sure it is enabled for the Gemini API.'}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': str(e)}), 500

@chatbot_bp.route('/api/chat/history', methods=['GET'])
@login_required
def get_archived_chat_history():
    user_archived_chat_history = data.load_user_archived_chat_history(current_user.id)
    return jsonify(user_archived_chat_history)

@chatbot_bp.route('/api/chat/current_session', methods=['GET'])
@login_required
def get_current_session_chat():
    return jsonify(data.current_session_chat.get(current_user.id, []))

@chatbot_bp.route('/api/chat/current_session', methods=['DELETE'])
@login_required
def clear_current_session_chat():
    if current_user.id in data.current_session_chat:
        data.current_session_chat[current_user.id].clear()
    return jsonify({'success': True})

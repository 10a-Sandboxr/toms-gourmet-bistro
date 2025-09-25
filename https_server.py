#!/usr/bin/env python3
"""
HTTPS Server for Tom's Gourmet Bistro Attack Site
Serves the attack website over SSL/TLS
"""

import http.server
import ssl
import socketserver
import os
from pathlib import Path

class HTTPSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Set the directory to serve files from
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)

    def end_headers(self):
        # Add security headers
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom logging
        print(f"🌐 HTTPS Request: {format % args}")

def main():
    PORT = 9443  # Standard HTTPS port alternative

    print("🔒 Starting HTTPS Server for Tom's Gourmet Bistro")
    print(f"🌍 Server URL: https://localhost:{PORT}")
    print(f"🎯 Attack URL: https://localhost:{PORT}/subscription.html")
    print("=" * 60)

    # Check for certificate files
    cert_file = "server.crt"
    key_file = "server.key"

    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        print("❌ SSL certificates not found!")
        print("Run this command first:")
        print("openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj \"/C=US/ST=CA/L=San Francisco/O=Toms Gourmet Bistro/CN=localhost\"")
        return

    # Create HTTPS server
    with socketserver.TCPServer(("", PORT), HTTPSHandler) as httpd:
        # Wrap socket with SSL
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert_file, key_file)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

        print(f"🚀 HTTPS Server running on port {PORT}")
        print("⚠️  Browser will show 'Not Secure' warning for self-signed cert")
        print("   Click 'Advanced' → 'Proceed to localhost (unsafe)' to continue")
        print()
        print("🎯 Attack Test URLs:")
        print(f"   • Main attack page: https://localhost:{PORT}/subscription.html")
        print(f"   • Attack logs: http://localhost:9003/log")
        print()
        print("Press Ctrl+C to stop server")
        print("-" * 60)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 HTTPS Server stopped")

if __name__ == "__main__":
    main()
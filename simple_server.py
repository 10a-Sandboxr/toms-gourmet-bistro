#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8003
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        print(f"📁 {format % args}")

os.chdir('/Users/sinclairstevens/Documents/Work/OAI/Browser Testing 2.0/Website Repos/toms-gourmet-bistro')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🚀 Serving at http://localhost:{PORT}/newsletter.html")
    httpd.serve_forever()
from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With')
        self.end_headers()

    def do_GET(self):
        print(f"\nReceived request for: {self.path}")
        
        # Remove query parameters for file lookup
        clean_path = self.path.split('?')[0]
        file_path = os.path.join(os.getcwd(), clean_path.lstrip('/'))
        
        print(f"Looking for file: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        
        if os.path.exists(file_path):
            print(f"Serving file: {file_path}")
        
        return super().do_GET()

if __name__ == '__main__':
    port = 8000
    print(f"\nStarting server in directory: {os.getcwd()}")
    print(f"Files in current directory:")
    for file in os.listdir('.'):
        print(f"  - {file}")
    print(f"\nStarting server on port {port}...")
    
    httpd = HTTPServer(('localhost', port), CORSRequestHandler)
    print(f"Server running at http://localhost:{port}/")
    print("Try accessing:")
    print(f"  - http://localhost:{port}/index.html")
    print(f"  - http://localhost:{port}/hyrule_data.csv")
    print("\nPress Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close() 
# import http.server
# import socketserver
# import webbrowser
# import os
# from pathlib import Path

# def run_html_on_localhost():
#     """
#     Serve a hardcoded HTML file on localhost using Python's built-in HTTP server.
#     """
#     # Hardcoded configuration
#     HTML_FILE = "templates/escape2.html"  # Name of your HTML file
#     PORT = 8000               # Port to use
    
#     # Get absolute path to the HTML file (assuming it's in the same directory as this script)
#     script_dir = Path(__file__).parent
#     html_file_path = script_dir / HTML_FILE
    
#     if not html_file_path.exists():
#         raise FileNotFoundError(f"HTML file not found: {html_file_path}")
    
#     # Change to the directory containing the HTML file
#     os.chdir(script_dir)
    
#     # Define a custom handler that serves our HTML file as index
#     class CustomHandler(http.server.SimpleHTTPRequestHandler):
#         def do_GET(self):
#             if self.path == '/':
#                 self.path = f'/{HTML_FILE}'
#             return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
#     # Start the server
#     with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
#         print(f"Serving {HTML_FILE} at http://localhost:{PORT}")
#         print("Press Ctrl+C to stop the server")
#         webbrowser.open_new_tab(f"http://localhost:{PORT}")
#         try:
#             httpd.serve_forever()
#         except KeyboardInterrupt:
#             print("\nServer stopped")

# if __name__ == "__main__":
#     run_html_on_localhost()


import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = 'index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def run_server():
    script_dir = Path(__file__).parent
    os.chdir(script_dir)  # Serve everything from current directory

    print(f"Serving at http://localhost:{PORT}")
    with socketserver.TCPServer(('', PORT), CustomHandler) as httpd:
        webbrowser.open(f'http://localhost:{PORT}')
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()

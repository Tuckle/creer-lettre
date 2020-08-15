import os
from flask import Flask, request
# set the project root directory as the static folder, you can set others.
_current_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_url_path=r'', static_folder=_current_dir)

@app.route('/')
def root():
    return app.send_static_file(r'index.html')


if __name__ == "__main__":
    app.run()


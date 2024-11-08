import os
from datetime import timedelta, datetime

from flask import Flask, redirect, jsonify, make_response, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import mariadb
import dotenv
import bcrypt as bc
app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://192.168.5.193:5173'], supports_credentials=True)
jwt = JWTManager(app)
dotenv.load_dotenv()
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token'
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)
app.config['JWT_SECRET_KEY'] =os.getenv('SECRET_KEY')


def db_conn():
    try:
        conn = mariadb.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            port=int(os.getenv('DB_PORT')),
            db=os.getenv('DB_NAME'),
            password=os.getenv('DB_PASSWORD')
        )
        return conn
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        raise

@app.route('/')
def hello_world():
    return redirect('http://localhost:5173')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM user WHERE email = %s", (email,))
            row = cursor.fetchone()
            if row:
                print(f"Database hash: {row[3]}")
                password_match = bc.checkpw(password.encode('utf-8'), row[3].encode('utf-8'))
                print(f"Password match: {password_match}")

                if password_match:
                    access_token = create_access_token(identity=row[0])
                    print(f"Access token created: {access_token}")
                    response = make_response(jsonify({"message": "Login successful"}))
                    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')
                    print("Cookie set in response")
                    return response, 200
                else:
                    print("Password did not match")
                    return jsonify({"message": "Invalid credentials"}), 401
            else:
                print("Email not found")
                return jsonify({"message": "Invalid credentials"}), 401
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        return jsonify({"message": "Internal server error"}), 500
    finally:
        if conn is not None:
            conn.close()

@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    response = make_response(jsonify({"message": "Logout successful"}))
    response.delete_cookie('access_token')
    return response, 200

@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@app.route('/api/user', methods=['GET'])
@jwt_required()
def user():
    current_user = get_jwt_identity()
    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM user WHERE id = %s", (current_user,))
            row = cursor.fetchone()
            if row:
                return jsonify({"username": row[1], "email": row[2]}), 200
            else:
                return jsonify({"message": "User not found"}), 404
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        return jsonify({"message": "Internal server error"}), 500
    finally:
        if conn is not None:
            conn.close()
@app.route('/api/create_notebook', methods=["POST"])
@jwt_required()
def create_notebook():
    data = request.get_json()
    current_user = get_jwt_identity()
    title = data["title"]
    notebook_id = data["id"]

    conn = None

    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO notebooks (id, name, date_created, user_id) VALUES (?, ?, ?, ?)", (notebook_id, title, datetime.now(), current_user))
            conn.commit()
            return jsonify({"message": "Successfully created a new notebook"}), 200
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database Error"}), 500
    finally:
        if conn is not None:
            conn.close()


@app.route("/api/create_note", methods=["POST"])
@jwt_required()
def create_note():
    data = request.get_json()
    current_user = get_jwt_identity()

    title = data["title"]

    note_id = data["id"]
    notebook_id = data["notebook_id"]

    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO notes (id, title, date_created, date_updated, notebook) VALUES (?, ?, ?, ?, ?)", (note_id, title, datetime.now(), datetime.now(), notebook_id))
            conn.commit()
            return jsonify({"message": "Successfully created a note!"}), 200
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if conn is not None:
            conn.close()

@app.route("/api/delete_notebook", methods=["POST"])
@jwt_required()
def delete_notebook():
    data = request.get_json()
    notebook_id = data["id"]
    current_user = get_jwt_identity()

    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM notebooks WHERE id = %s AND user_id = %s", (notebook_id, current_user))
            conn.commit()
            return jsonify({"message": "Successfully deleted the notebook"}), 200
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database Error"}), 500
    finally:
        if conn is not None:
            conn.close()

@app.route("/api/delete_note", methods=["POST"])
@jwt_required()
def delete_note():
    data = request.get_json()
    note_id = data["id"]
    current_user = get_jwt_identity()

    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("""
                DELETE FROM notes 
                WHERE id = %s AND notebook IN (
                    SELECT id FROM notebooks WHERE user_id = %s
                )
            """, (note_id, current_user))
            conn.commit()
            return jsonify({"message": "Successfully deleted the note!"}), 200
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if conn is not None:
            conn.close()

@app.route("/api/update_notebook", methods=["POST"])
@jwt_required()
def update_notebook():
    data = request.get_json()
    notebook_id = data["id"]
    title = data["title"]
    current_user = get_jwt_identity()

    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("UPDATE notebooks SET name = %s WHERE id = %s AND user_id = %s", (title, notebook_id, current_user))
            conn.commit()
            return jsonify({"message": "Successfully updated notebook!"}), 200
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if conn is not None:
            conn.close()

@app.route("/api/update_note", methods=["POST"])
@jwt_required()
def update_notes():
    data = request.get_json()
    note_id = data["id"]
    title = data["title"]
    content = data["content"]

    current_user = get_jwt_identity()

    conn = None
    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE notes
                JOIN notebooks ON notes.notebook = notebooks.id
                SET notes.title = %s, notes.content = %s, notes.date_updated = %s
                WHERE notes.id = %s AND notebooks.user_id = %s
            """, (title, content, datetime.now(), note_id, current_user))
            conn.commit()
            return jsonify({"message": "Successfully updated notes!"}), 200
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if conn is not None:
            conn.close()

@app.route("/api/retrieve_notebook", methods=["GET"])
@jwt_required()
def retrieve_notebook():
    current_user = get_jwt_identity()

    conn = None

    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM notebooks WHERE user_id = %s", (current_user,))
            rows = cursor.fetchall()

            if rows:
                data = [
                    {
                        "id": row[0],
                        "title": row[1],
                    }
                    for row in rows
                ]
                return jsonify({"data": data}), 200
            else:
                return jsonify({"message": "No notebooks found"}), 404
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if conn is not None:
            conn.close()

@app.route("/api/retrieve_notes", methods=["GET"])
@jwt_required()
def retrieve_notes():
    current_user = get_jwt_identity()
    notebook_id = request.args.get("notebook_id")
    conn = None

    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT notes.id, notes.title, notes.content, notes.date_created, notes.date_updated, notes.notebook
                FROM notes
                JOIN notebooks ON notes.notebook = notebooks.id
                WHERE notes.notebook = %s AND notebooks.user_id = %s
            """, (notebook_id, current_user))
            rows = cursor.fetchall()

            if rows:
                data = [
                    {
                        "id": row[0],
                        "title": row[1],
                        "content": row[2],
                        "date_created": row[3],
                        "date_updated": row[4],
                        "notebook": row[5]
                    }
                    for row in rows
                ]
                return jsonify({"data": data}), 200
            else:
                return jsonify({"message": "No notes found"}), 404
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if conn is not None:
            conn.close()
@app.route("/api/get_note", methods=["GET"])
@jwt_required()
def get_note():
    current_user = get_jwt_identity()
    note_id = request.args.get("id")

    conn = None

    try:
        conn = db_conn()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT notes.id, notes.title, notes.content, notes.date_created, notes.date_updated, notes.notebook
                FROM notes
                JOIN notebooks ON notes.notebook = notebooks.id
                WHERE notes.id = %s AND notebooks.user_id = %s
            """, (note_id, current_user))
            row = cursor.fetchone()

            if row:
                data = {
                    "title": row[1],
                    "content": row[2],
                    "date_updated": row[4].isoformat() if row[4] else None,
                }
                return jsonify(data), 200
            else:
                return jsonify({"message": "Note not found"}), 404
    except mariadb.Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if conn is not None:
            conn.close()
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import uuid
import os

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# -------------------------
# AWS Setup
# -------------------------
REGION = "ap-south-1"   # Change if your resources are in another region
USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID", "ap-south-1_StNQGc5uQ")
CLIENT_ID = os.getenv("COGNITO_CLIENT_ID", "1kj6adfdri3he2c9r78l2ubshm")
S3_BUCKET = os.getenv("S3_BUCKET", "spoticly-songs")

# Initialize AWS clients
cognito_client = boto3.client("cognito-idp", region_name=REGION)
dynamodb = boto3.resource("dynamodb", region_name=REGION)
s3 = boto3.client("s3", region_name=REGION)

# DynamoDB Table (make sure it's created first!)
songs_table = dynamodb.Table("Songs")


# -------------------------
# AUTH ROUTES
# -------------------------

@app.route("/signup", methods=["POST"])
def signup():
    """Signup with Cognito"""
    data = request.json
    try:
        resp = cognito_client.sign_up(
            ClientId=CLIENT_ID,
            Username=data["email"],
            Password=data["password"],
            UserAttributes=[{"Name": "email", "Value": data["email"]}]
        )
        return jsonify({"message": "Signup successful, please confirm your email"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/confirm", methods=["POST"])
def confirm():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")

    try:
        response = cognito_client.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=code
        )
        return jsonify({"message": "User confirmed successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400



@app.route("/login", methods=["POST"])
def login():
    """Login with Cognito"""
    data = request.json
    try:
        resp = cognito_client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": data["email"],
                "PASSWORD": data["password"]
            }
        )
        return jsonify({
            "accessToken": resp["AuthenticationResult"]["AccessToken"],
            "idToken": resp["AuthenticationResult"]["IdToken"],
            "refreshToken": resp["AuthenticationResult"]["RefreshToken"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


# -------------------------
# SONG ROUTES
# -------------------------

@app.route("/songs", methods=["GET"])
def get_songs():
    """Fetch all songs"""
    try:
        resp = songs_table.scan()
        return jsonify(resp.get("Items", [])), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/songs", methods=["POST"])
def add_song():
    """Add a new song with image upload to S3"""
    try:
        data = request.form
        file = request.files.get("image")

        if not file:
            return jsonify({"error": "Image file is required"}), 400

        song_id = str(uuid.uuid4())

        # Upload image to S3 (make it public)
        s3.upload_fileobj(
            file,
            S3_BUCKET,
            f"{song_id}.jpg",
            ExtraArgs={
                "ContentType": file.content_type,
                "ACL": "public-read"   # 👈 This makes the object publicly accessible
            }
        )

        # Public URL
        image_url = f"https://{S3_BUCKET}.s3.{REGION}.amazonaws.com/{song_id}.jpg"

        # Save metadata in DynamoDB
        songs_table.put_item(Item={
            "songId": song_id,
            "title": data.get("title"),
            "artist": data.get("artist"),
            "album": data.get("album"),
            "duration": data.get("duration"),
            "imageUrl": image_url
        })

        return jsonify({
            "message": "Song added!",
            "songId": song_id,
            "imageUrl": image_url
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# -------------------------
# MAIN
# -------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

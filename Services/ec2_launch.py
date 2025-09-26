# ec2_launch.py
import boto3

ec2 = boto3.client("ec2", region_name="ap-south-1")

def launch_ec2(profile_name):
    user_data_script = """#!/bin/bash
set -e

# Update system
apt update -y && apt upgrade -y

# Install system deps
apt install -y python3 python3-pip python3-venv git nginx curl

# Install Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs

# Clone project
cd /home/ubuntu
git clone https://github.com/TusharMgl/spoticly
cd spoticly

# Backend setup
python3 -m venv venv
source venv/bin/activate
pip install flask boto3 gunicorn flask-cors python-dotenv

# Create .env file (TODO: Replace with real values or use SSM/Secrets Manager)
cat > .env << EOF
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
S3_BUCKET=your-s3-bucket
AWS_DEFAULT_REGION=ap-south-1
EOF

# Frontend setup
cd frontend/notes-frontend
npm install
npm run build
cd ../../

# Configure Nginx
cat > /etc/nginx/sites-available/spoticly << EOF
server {
    listen 80;
    server_name _;

    location / {
        root /home/ubuntu/spoticly/frontend/notes-frontend/build;
        index index.html;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/spoticly /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Setup Gunicorn service
cat > /etc/systemd/system/spoticly.service << EOF
[Unit]
Description=Spoticly Flask API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/spoticly
Environment="PATH=/home/ubuntu/spoticly/venv/bin"
ExecStart=/home/ubuntu/spoticly/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable spoticly
systemctl start spoticly
"""

    response = ec2.run_instances(
        ImageId="ami-02d26659fd82cf299",  # Ubuntu 22.04 LTS AMI (region-specific)
        InstanceType="t2.micro",
        MinCount=1,
        MaxCount=1,
        IamInstanceProfile={'Name': profile_name},  # IAM role with S3, DynamoDB, Cognito perms
        UserData=user_data_script,
        SecurityGroupIds=["sg-00d6c4d92d2fd25a8"],  # Update with your SG ID
        SubnetId="subnet-06b1629db1d59ef4e",        # Update with your subnet
        KeyName="cloudProject"                      # Update with your key pair
    )
    instance_id = response["Instances"][0]["InstanceId"]
    print(f"🚀 EC2 Launched: {instance_id}")
    return instance_id

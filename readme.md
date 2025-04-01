📌 Project Name: Supplier Management System

📝 About This Project

The Supplier Management System is a robust and efficient web-based application designed to streamline supplier information handling. It allows users to view, edit, and manage supplier details, ensuring seamless business operations. The system ensures security, scalability, and an intuitive user experience, making supplier data easily accessible while maintaining high integrity.

🚀 Features

🔍 View Supplier Details: Access comprehensive supplier information, including contact, location, and banking details.

✏️ Edit Supplier Information: Modify supplier details with an easy-to-use interface.

📁 Attachments Management: Upload and access supplier-related documents.

🔄 Authentication & Security: Ensures secure access through token-based authentication.

📡 REST API Integration: Fetch supplier data dynamically through an API.

🔗 Navigation: Easy-to-use sidebar for seamless navigation.

📂 Project Structure

backend/
├── app.py            # Flask backend application
├── routes/           # API route definitions
├── models/           # Database models
└── config.py         # Configuration settings
frontend/
├── pages/
│   ├── suppliers/    # Supplier pages
│   ├── dashboard.tsx # Main dashboard UI
│   ├── index.tsx     # Landing page
├── components/       # Reusable UI components
└── hooks/            # Custom React hooks

🔧 Installation & Setup

Backend Setup

Clone the Repository:

git clone https://github.com/ABHIKALVIUM/supplier-management.git
cd supplier-management/backend

Create a Virtual Environment:

python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

Install Dependencies:

pip install -r requirements.txt

Run the Backend Server:

flask run --host=0.0.0.0 --port=5000

Frontend Setup

Navigate to the Frontend Directory:

cd ../frontend

Install Dependencies:

npm install

Run the Frontend Server:

npm run dev

🎯 Usage

Login to the Application using valid credentials.

View Supplier Details on the dashboard.

Edit Supplier Information via the edit button.

Upload Attachments and access important documents.

Navigate smoothly using the sidebar.

🔗 API Endpoints

GET /api/suppliers/:id - Fetch supplier details

PUT /api/suppliers/:id - Update supplier information

POST /api/upload - Upload supplier attachments

🛠️ Technologies Used

Frontend: React, TypeScript, Tailwind CSS, Next.js

Backend: Flask, Python, MongoDB

Authentication: JWT-based security

API: RESTful API architecture

Video Link: https://drive.google.com/file/d/1X8Uo7xJhoXxy_cmOYI0mC6ijihdBeoOX/view?usp=sharing

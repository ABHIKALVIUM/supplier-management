from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import jwt
import datetime
import os
import uuid
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = "mongodb+srv://abhishekchaudhari:Abhishek21@cluster0.xgoxv.mongodb.net/suppliers?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client.suppliers

# JWT configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_EXPIRATION = datetime.timedelta(days=1)

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Mock user data (in a real app, this would be in the database)
users = [
    {
        "id": "1",
        "email": "sham@gmail.com",
        "password": "123456",
        "name": "Sham"
    }
]

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Authentication middleware
def token_required(f):
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = next((user for user in users if user['id'] == data['id']), None)
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    
    decorated.__name__ = f.__name__
    return decorated

# Login route
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = next((user for user in users if user['email'] == email and user['password'] == password), None)
    
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
        
    token = jwt.encode({
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'exp': datetime.datetime.utcnow() + JWT_EXPIRATION
    }, JWT_SECRET)
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        }
    })

# Get suppliers route
@app.route('/api/suppliers', methods=['GET'])
@token_required
def get_suppliers(current_user):
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    search = request.args.get('search', '')
    skip = (page - 1) * limit
    
    query = {}
    if search:
        query = {'companyName': {'$regex': search, '$options': 'i'}}
    
    suppliers = list(db.suppliers.find(query).skip(skip).limit(limit))
    total = db.suppliers.count_documents(query)
    
    # Convert ObjectId to string for JSON serialization
    for supplier in suppliers:
        supplier['_id'] = str(supplier['_id'])
    
    return jsonify({
        'suppliers': suppliers,
        'total': total,
        'page': page,
        'limit': limit,
        'totalPages': (total + limit - 1) // limit
    })

# Get single supplier route
@app.route('/api/suppliers/<supplier_id>', methods=['GET'])
@token_required
def get_supplier(current_user, supplier_id):
    try:
        supplier = db.suppliers.find_one({'_id': ObjectId(supplier_id)})
        
        if not supplier:
            return jsonify({'message': 'Supplier not found'}), 404
            
        # Convert ObjectId to string for JSON serialization
        supplier['_id'] = str(supplier['_id'])
        
        return jsonify({'supplier': supplier})
    except Exception as e:
        return jsonify({'message': 'Error fetching supplier', 'error': str(e)}), 500

# Add supplier route
@app.route('/api/suppliers', methods=['POST'])
@token_required
def add_supplier(current_user):
    data = request.get_json()
    
    # Validate required fields
    if not data.get('companyName') or not data.get('vendorName') or not data.get('primaryEmail'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Format data for database
    supplier = {
        'companyName': data.get('companyName'),
        'vendorName': data.get('vendorName'),
        'mobileNumber': data.get('primaryPhone', ''),
        'email': data.get('primaryEmail'),
        'secondaryEmail': data.get('secondaryEmail', ''),
        'secondaryPhone': data.get('secondaryPhone', ''),
        'panNumber': data.get('pan', ''),
        'gstinNumber': data.get('gstNumber', ''),
        'supplierType': data.get('supplierType', ''),
        'category': data.get('category', ''),
        'website': data.get('website', ''),
        'addressLine1': data.get('addressLine1', ''),
        'addressLine2': data.get('addressLine2', ''),
        'district': data.get('district', ''),
        'city': data.get('city', ''),
        'state': data.get('state', ''),
        'pincode': data.get('pincode', ''),
        'country': data.get('country', ''),
        'accountName': data.get('accountName', ''),
        'accountNumber': data.get('accountNumber', ''),
        'bankBranchName': data.get('bankBranchName', ''),
        'ifscCode': data.get('ifscCode', ''),
        'status': data.get('status', 'Active'),
        'notes': data.get('notes', ''),
        'attachments': data.get('attachments', []),
        'createdAt': datetime.datetime.utcnow(),
        'updatedAt': datetime.datetime.utcnow()
    }
    
    result = db.suppliers.insert_one(supplier)
    
    return jsonify({
        'message': 'Supplier added successfully',
        'supplierId': str(result.inserted_id)
    })

# Update supplier route
@app.route('/api/suppliers/<supplier_id>', methods=['PUT'])
@token_required
def update_supplier(current_user, supplier_id):
    try:
        data = request.get_json()
        
        # Check if supplier exists
        supplier = db.suppliers.find_one({'_id': ObjectId(supplier_id)})
        if not supplier:
            return jsonify({'message': 'Supplier not found'}), 404
            
        # Update supplier
        update_data = {
            'companyName': data.get('companyName', supplier.get('companyName')),
            'vendorName': data.get('vendorName', supplier.get('vendorName')),
            'mobileNumber': data.get('mobileNumber', supplier.get('mobileNumber')),
            'email': data.get('email', supplier.get('email')),
            'secondaryEmail': data.get('secondaryEmail', supplier.get('secondaryEmail')),
            'secondaryPhone': data.get('secondaryPhone', supplier.get('secondaryPhone')),
            'panNumber': data.get('panNumber', supplier.get('panNumber')),
            'gstinNumber': data.get('gstinNumber', supplier.get('gstinNumber')),
            'supplierType': data.get('supplierType', supplier.get('supplierType')),
            'category': data.get('category', supplier.get('category')),
            'website': data.get('website', supplier.get('website')),
            'addressLine1': data.get('addressLine1', supplier.get('addressLine1')),
            'addressLine2': data.get('addressLine2', supplier.get('addressLine2')),
            'district': data.get('district', supplier.get('district')),
            'city': data.get('city', supplier.get('city')),
            'state': data.get('state', supplier.get('state')),
            'pincode': data.get('pincode', supplier.get('pincode')),
            'country': data.get('country', supplier.get('country')),
            'accountName': data.get('accountName', supplier.get('accountName')),
            'accountNumber': data.get('accountNumber', supplier.get('accountNumber')),
            'bankBranchName': data.get('bankBranchName', supplier.get('bankBranchName')),
            'ifscCode': data.get('ifscCode', supplier.get('ifscCode')),
            'status': data.get('status', supplier.get('status')),
            'notes': data.get('notes', supplier.get('notes')),
            'attachments': data.get('attachments', supplier.get('attachments', [])),
            'updatedAt': datetime.datetime.utcnow()
        }
        
        # Print update data for debugging
        print("Updating supplier with data:", update_data)
        
        db.suppliers.update_one(
            {'_id': ObjectId(supplier_id)},
            {'$set': update_data}
        )
        
        return jsonify({
            'message': 'Supplier updated successfully',
            'supplierId': supplier_id
        })
    except Exception as e:
        print("Error updating supplier:", str(e))
        return jsonify({'message': 'Error updating supplier', 'error': str(e)}), 500

# Delete supplier route
@app.route('/api/suppliers/<supplier_id>', methods=['DELETE'])
@token_required
def delete_supplier(current_user, supplier_id):
    try:
        # Check if supplier exists
        supplier = db.suppliers.find_one({'_id': ObjectId(supplier_id)})
        if not supplier:
            return jsonify({'message': 'Supplier not found'}), 404
            
        # Delete supplier
        db.suppliers.delete_one({'_id': ObjectId(supplier_id)})
        
        return jsonify({
            'message': 'Supplier deleted successfully',
            'supplierId': supplier_id
        })
    except Exception as e:
        return jsonify({'message': 'Error deleting supplier', 'error': str(e)}), 500

# File upload route
@app.route('/api/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file part'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
            
        if file and allowed_file(file.filename):
            # Create a unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}-{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            
            # Save the file
            file.save(file_path)
            
            # Generate URL for the file
            file_url = f"/uploads/{unique_filename}"
            
            return jsonify({
                'message': 'File uploaded successfully',
                'url': file_url,
                'name': filename
            })
        else:
            return jsonify({'message': 'File type not allowed'}), 400
    except Exception as e:
        return jsonify({'message': 'Error uploading file', 'error': str(e)}), 500

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Export suppliers route
@app.route('/api/suppliers/export', methods=['GET'])
@token_required
def export_suppliers(current_user):
    suppliers = list(db.suppliers.find({}))
    
    # Create CSV content
    headers = [
        "Vendor Name",
        "Company Name",
        "Mobile Number",
        "Email",
        "GSTIN Number",
        "PAN Number",
        "Status"
    ]
    
    csv_content = ",".join(headers) + "\n"
    
    for supplier in suppliers:
        row = [
            supplier.get('vendorName', ''),
            supplier.get('companyName', ''),
            supplier.get('mobileNumber', ''),
            supplier.get('email', ''),
            supplier.get('gstinNumber', ''),
            supplier.get('panNumber', ''),
            supplier.get('status', 'Active')
        ]
        
        # Escape quotes and join with commas
        csv_row = ",".join([f'"{str(field).replace("\"", "\"\"")}"' for field in row])
        csv_content += csv_row + "\n"


    
    response = app.response_class(
        response=csv_content,
        status=200,
        mimetype='text/csv'
    )
    response.headers["Content-Disposition"] = "attachment; filename=suppliers.csv"
    
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


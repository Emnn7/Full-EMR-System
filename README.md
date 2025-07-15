# 🏥 Hospital EMR System

A full-stack Electronic Medical Records system developed as a team project by Computer Science students. This platform digitizes hospital workflows including patient registration, appointment scheduling, medical consultations, lab test management, and financial tracking.


## 🌟 Key Features
- **Role-based access control** for:
  - Patients (registration, medical records access)
  - Receptionists (appointments, payments)
  - Doctors (consultations, prescriptions, lab orders)
  - Lab Assistants (vitals recording, test results)
  - Admins (user management, financial oversight)
- **Complete patient workflow** from registration to discharge
- **Medical records management** with diagnostics history
- **Financial tracking** for procedures and lab tests
- **Secure document generation** for medical reports

## 🛠️ Tech Stack
**Frontend:** React.js, Tailwind CSS, Axios, React Router  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Authentication:** JWT with role-based permissions  
**Deployment:** Local network (LAN) accessible  

## 📁 Project Structure
Full-EMR-System/
├── client/ # React frontend
├── server/ # Node.js backend with Express
├── config/ # Database and environment configurations
└── README.md


## 🚀 Deployment (Local Network Setup)
The system is designed for LAN deployment within hospital premises:

1. **On Main Server Computer**:
   - Install MongoDB, Node.js
   - Set static local IP (e.g., 192.168.1.50)
   - Configure environment variables (.env)
   - Start backend service (PM2 recommended)

2. **Client Access**:
   - All hospital staff can access via browser at:
     ```
     http://[server-ip]:3000
     ```
   - No additional installation required on client machines

*Example clinic setup:*
| Role              | Access Method                |
|-------------------|------------------------------|
| Admin             | Hosts system on main PC      |
| Doctors           | Any browser on hospital LAN  |
| Receptionists     | Dedicated PC browsers        |
| Lab Technicians   | Browser on lab computers     |

## 💻 Local Development
1. Clone the Repository
git clone https://github.com/yourusername/Full-EMR-System.git
cd local-farm-ecommerce
2. Install Dependencies
# Frontend
cd emr-frontend
npm install

# Backend
cd ../emr-backend
npm install
3. Set Up Environment Variables
In /emr-backend/.env, add the following:
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
4. Start the Application
# From the project root using concurrently
npm run dev

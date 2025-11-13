// Dashboard functionality with full feature implementation

// Check if user is logged in and redirect if not
function checkAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Display username
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = `Logged in as: ${currentUser.username} (${currentUser.role.replace('_', ' ')})`;
    }
    
    // Check role-based access
    const currentPage = window.location.pathname.split('/').pop();
    const role = currentUser.role;
    
    // Verify user has access to current page
    if (currentPage === 'dashboard-receptionist.html' && role !== 'receptionist') {
        window.location.href = getDashboardUrl(role);
    } else if (currentPage === 'dashboard-doctor.html' && role !== 'doctor') {
        window.location.href = getDashboardUrl(role);
    } else if (currentPage === 'dashboard-admin.html' && role !== 'system_admin') {
        window.location.href = getDashboardUrl(role);
    }
}

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// ============ RECEPTIONIST FEATURES ============

// Register New Patient
function openRegisterPatient() {
    showModal('registerPatientModal');
    document.getElementById('registerPatientForm').reset();
}

function submitRegisterPatient() {
    const form = document.getElementById('registerPatientForm');
    const formData = new FormData(form);
    
    const patientData = {
        patientId: formData.get('patientId'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        address: formData.get('address'),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        emergencyContact: formData.get('emergencyContact'),
        emergencyPhone: formData.get('emergencyPhone')
    };
    
    const result = addPatient(patientData);
    
    if (result.success) {
        alert(result.message);
        closeModal('registerPatientModal');
        form.reset();
    } else {
        alert(result.message);
    }
}

// Schedule or View Appointments
function openAppointments() {
    showModal('appointmentsModal');
    loadAppointments();
}

function loadAppointments() {
    const appointments = getAppointments();
    const patients = getPatients();
    const tbody = document.getElementById('appointmentsTableBody');
    
    if (!tbody) return;
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No appointments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = appointments.map(appt => {
        const patient = patients.find(p => p.id == appt.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
        const date = new Date(appt.appointmentDate).toLocaleDateString();
        const time = appt.appointmentTime;
        const status = appt.status || 'scheduled';
        
        return `<tr>
            <td>${patientName}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td>${appt.reason || 'General Checkup'}</td>
            <td><span class="badge ${status}">${status}</span></td>
            <td>
                <button class="btn-action btn-delete" onclick="deleteAppointmentConfirm(${appt.id})">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

function openNewAppointment() {
    showModal('newAppointmentModal');
    const patients = getPatients();
    const select = document.getElementById('appointmentPatientId');
    select.innerHTML = '<option value="">Select Patient</option>' + 
        patients.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName} (ID: ${p.patientId})</option>`).join('');
    document.getElementById('newAppointmentForm').reset();
}

function submitNewAppointment() {
    const form = document.getElementById('newAppointmentForm');
    const formData = new FormData(form);
    
    const appointmentData = {
        patientId: parseInt(formData.get('patientId')),
        appointmentDate: formData.get('appointmentDate'),
        appointmentTime: formData.get('appointmentTime'),
        reason: formData.get('reason'),
        notes: formData.get('notes')
    };
    
    const result = addAppointment(appointmentData);
    
    if (result.success) {
        alert(result.message);
        closeModal('newAppointmentModal');
        loadAppointments();
        form.reset();
    } else {
        alert(result.message);
    }
}

function deleteAppointmentConfirm(appointmentId) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        const result = deleteAppointment(appointmentId);
        if (result.success) {
            alert(result.message);
            loadAppointments();
        }
    }
}

// Add or Edit Patient Details
function openEditPatient() {
    showModal('editPatientModal');
    loadPatientsForEdit();
}

function loadPatientsForEdit() {
    const patients = getPatients();
    const select = document.getElementById('editPatientSelect');
    select.innerHTML = '<option value="">Select Patient</option>' + 
        patients.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName} (ID: ${p.patientId})</option>`).join('');
}

function loadPatientDetails() {
    const patientId = document.getElementById('editPatientSelect').value;
    if (!patientId) return;
    
    const patient = getPatientById(parseInt(patientId));
    if (patient) {
        document.getElementById('editPatientId').value = patient.id;
        document.getElementById('editFirstName').value = patient.firstName;
        document.getElementById('editLastName').value = patient.lastName;
        document.getElementById('editEmail').value = patient.email || '';
        document.getElementById('editPhone').value = patient.phone || '';
        document.getElementById('editDateOfBirth').value = patient.dateOfBirth || '';
        document.getElementById('editAddress').value = patient.address || '';
        document.getElementById('editGender').value = patient.gender || '';
        document.getElementById('editBloodGroup').value = patient.bloodGroup || '';
        document.getElementById('editEmergencyContact').value = patient.emergencyContact || '';
        document.getElementById('editEmergencyPhone').value = patient.emergencyPhone || '';
    }
}

function submitEditPatient() {
    const form = document.getElementById('editPatientForm');
    const patientId = document.getElementById('editPatientId').value;
    const formData = new FormData(form);
    
    const updatedData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        address: formData.get('address'),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        emergencyContact: formData.get('emergencyContact'),
        emergencyPhone: formData.get('emergencyPhone')
    };
    
    const result = updatePatient(parseInt(patientId), updatedData);
    
    if (result.success) {
        alert(result.message);
        closeModal('editPatientModal');
        form.reset();
    } else {
        alert(result.message);
    }
}

// ============ DOCTOR FEATURES ============

// View Assigned Patients
function openAssignedPatients() {
    showModal('assignedPatientsModal');
    loadAssignedPatients();
}

function loadAssignedPatients() {
    const currentUser = getCurrentUser();
    const patients = getPatients();
    const tbody = document.getElementById('assignedPatientsTableBody');
    
    // Filter patients assigned to this doctor or all if not assigned
    const assignedPatients = patients.filter(p => !p.assignedDoctor || p.assignedDoctor == currentUser.id);
    
    if (assignedPatients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No assigned patients found</td></tr>';
        return;
    }
    
    tbody.innerHTML = assignedPatients.map(patient => {
        const dob = patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A';
        return `
            <tr>
                <td>${patient.patientId}</td>
                <td>${patient.firstName} ${patient.lastName}</td>
                <td>${patient.email || 'N/A'}</td>
                <td>${patient.phone || 'N/A'}</td>
                <td>${dob}</td>
                <td>
                    <button class="btn-action btn-view" onclick="viewPatientDetails(${patient.id})">View Details</button>
                    <button class="btn-action btn-edit" onclick="assignPatientToDoctor(${patient.id})">Assign</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewPatientDetails(patientId) {
    const patient = getPatientById(patientId);
    if (!patient) return;
    
    const appointments = getAppointmentsByPatient(patientId);
    const healthRecords = getHealthRecordsByPatient(patientId);
    
    showModal('patientDetailsModal');
    document.getElementById('patientDetailsContent').innerHTML = `
        <h3>${patient.firstName} ${patient.lastName}</h3>
        <p><strong>Patient ID:</strong> ${patient.patientId}</p>
        <p><strong>Email:</strong> ${patient.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${patient.phone || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Gender:</strong> ${patient.gender || 'N/A'}</p>
        <p><strong>Blood Group:</strong> ${patient.bloodGroup || 'N/A'}</p>
        <p><strong>Address:</strong> ${patient.address || 'N/A'}</p>
        <hr>
        <h4>Appointments (${appointments.length})</h4>
        ${appointments.length > 0 ? appointments.map(a => `<p>${new Date(a.appointmentDate).toLocaleDateString()} at ${a.appointmentTime} - ${a.reason || 'General'}</p>`).join('') : '<p>No appointments</p>'}
        <hr>
        <h4>Health Records (${healthRecords.length})</h4>
        ${healthRecords.length > 0 ? healthRecords.map(r => `<p><strong>${r.type}:</strong> ${r.description || r.diagnosis || r.prescription || 'N/A'}</p>`).join('') : '<p>No health records</p>'}
    `;
}

function assignPatientToDoctor(patientId) {
    const currentUser = getCurrentUser();
    const result = updatePatient(patientId, { assignedDoctor: currentUser.id });
    if (result.success) {
        alert('Patient assigned to you successfully!');
        loadAssignedPatients();
    }
}

// Add Diagnosis
function openAddDiagnosis() {
    showModal('addDiagnosisModal');
    const patients = getPatients();
    const select = document.getElementById('diagnosisPatientId');
    select.innerHTML = '<option value="">Select Patient</option>' + 
        patients.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName} (ID: ${p.patientId})</option>`).join('');
    document.getElementById('diagnosisForm').reset();
}

function submitDiagnosis() {
    const form = document.getElementById('diagnosisForm');
    const formData = new FormData(form);
    
    const recordData = {
        patientId: parseInt(formData.get('patientId')),
        type: 'diagnosis',
        diagnosis: formData.get('diagnosis'),
        description: formData.get('description'),
        notes: formData.get('notes')
    };
    
    const result = addHealthRecord(recordData);
    
    if (result.success) {
        alert(result.message);
        closeModal('addDiagnosisModal');
        form.reset();
    } else {
        alert(result.message);
    }
}

// Add Prescriptions
function openPrescriptions() {
    showModal('addPrescriptionModal');
    const patients = getPatients();
    const select = document.getElementById('prescriptionPatientId');
    select.innerHTML = '<option value="">Select Patient</option>' + 
        patients.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName} (ID: ${p.patientId})</option>`).join('');
    document.getElementById('prescriptionForm').reset();
}

function submitPrescription() {
    const form = document.getElementById('prescriptionForm');
    const formData = new FormData(form);
    
    const recordData = {
        patientId: parseInt(formData.get('patientId')),
        type: 'prescription',
        prescription: formData.get('prescription'),
        dosage: formData.get('dosage'),
        frequency: formData.get('frequency'),
        duration: formData.get('duration'),
        notes: formData.get('notes')
    };
    
    const result = addHealthRecord(recordData);
    
    if (result.success) {
        alert(result.message);
        closeModal('addPrescriptionModal');
        form.reset();
    } else {
        alert(result.message);
    }
}

// Update Patient Progress
function openUpdateProgress() {
    showModal('updateProgressModal');
    const patients = getPatients();
    const select = document.getElementById('progressPatientId');
    select.innerHTML = '<option value="">Select Patient</option>' + 
        patients.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName} (ID: ${p.patientId})</option>`).join('');
    document.getElementById('progressForm').reset();
}

function submitProgress() {
    const form = document.getElementById('progressForm');
    const formData = new FormData(form);
    
    const recordData = {
        patientId: parseInt(formData.get('patientId')),
        type: 'progress',
        progress: formData.get('progress'),
        status: formData.get('status'),
        notes: formData.get('notes')
    };
    
    const result = addHealthRecord(recordData);
    
    if (result.success) {
        alert(result.message);
        closeModal('updateProgressModal');
        form.reset();
    } else {
        alert(result.message);
    }
}

// ============ ADMIN FEATURES ============

// Manage User Accounts
function openManageUsers() {
    showModal('manageUsersModal');
    loadUsers();
}

function loadUsers() {
    const users = getUsers();
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        return `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role.replace('_', ' ')}</td>
                <td>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editUserRole(${user.id})">Edit Role</button>
                    <button class="btn-action btn-delete" onclick="deleteUserConfirm(${user.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddUser() {
    showModal('addUserModal');
    document.getElementById('addUserForm').reset();
}

function submitAddUser() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
    
    const result = registerUser(username, email, password, role);
    
    if (result.success) {
        alert(result.message);
        closeModal('addUserModal');
        loadUsers();
        form.reset();
    } else {
        alert(result.message);
    }
}

function editUserRole(userId) {
    const users = getUsers();
    const user = users.find(u => u.id == userId);
    if (!user) return;
    
    showModal('editUserRoleModal');
    document.getElementById('editUserRoleId').value = userId;
    document.getElementById('editUserRoleSelect').value = user.role;
    document.getElementById('editUserRoleUsername').textContent = user.username;
}

function submitEditUserRole() {
    const userId = parseInt(document.getElementById('editUserRoleId').value);
    const newRole = document.getElementById('editUserRoleSelect').value;
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id == userId);
    
    if (userIndex !== -1) {
        users[userIndex].role = newRole;
        saveUsers(users);
        alert('User role updated successfully!');
        closeModal('editUserRoleModal');
        loadUsers();
    }
}

function deleteUserConfirm(userId) {
    const users = getUsers();
    const user = users.find(u => u.id == userId);
    if (!user) return;
    
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
        const filtered = users.filter(u => u.id != userId);
        saveUsers(filtered);
        alert('User deleted successfully!');
        loadUsers();
    }
}

// Assign Role to Worker
function openAssignRole() {
    openManageUsers(); // Reuse manage users functionality
}

// Generate Reports and Backup
function openReports() {
    showModal('reportsModal');
    generateReport();
}

function generateReport() {
    const patients = getPatients();
    const appointments = getAppointments();
    const healthRecords = getHealthRecords();
    const users = getUsers();
    
    const report = {
        generatedAt: new Date().toISOString(),
        statistics: {
            totalPatients: patients.length,
            totalAppointments: appointments.length,
            totalHealthRecords: healthRecords.length,
            totalUsers: users.length,
            scheduledAppointments: appointments.filter(a => a.status === 'scheduled').length,
            completedAppointments: appointments.filter(a => a.status === 'completed').length
        },
        data: {
            patients: patients,
            appointments: appointments,
            healthRecords: healthRecords,
            users: users
        }
    };
    
    document.getElementById('reportContent').innerHTML = `
        <h3>System Report</h3>
        <p><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</p>
        <hr>
        <h4>Statistics</h4>
        <ul>
            <li>Total Patients: ${report.statistics.totalPatients}</li>
            <li>Total Appointments: ${report.statistics.totalAppointments}</li>
            <li>Scheduled: ${report.statistics.scheduledAppointments}</li>
            <li>Completed: ${report.statistics.completedAppointments}</li>
            <li>Total Health Records: ${report.statistics.totalHealthRecords}</li>
            <li>Total Users: ${report.statistics.totalUsers}</li>
        </ul>
        <hr>
        <button class="btn btn-secondary" onclick="downloadBackup()">Download Backup</button>
    `;
}

function downloadBackup() {
    const patients = getPatients();
    const appointments = getAppointments();
    const healthRecords = getHealthRecords();
    const users = getUsers();
    
    const backup = {
        exportDate: new Date().toISOString(),
        patients: patients,
        appointments: appointments,
        healthRecords: healthRecords,
        users: users
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Backup downloaded successfully!');
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

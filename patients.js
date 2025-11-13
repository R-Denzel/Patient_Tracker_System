// Patient Management System using localStorage

// Initialize patients array in localStorage if it doesn't exist
function initPatients() {
    if (!localStorage.getItem('patients')) {
        localStorage.setItem('patients', JSON.stringify([]));
    }
}

// Get all patients
function getPatients() {
    const patients = localStorage.getItem('patients');
    return patients ? JSON.parse(patients) : [];
}

// Save patients to localStorage
function savePatients(patients) {
    localStorage.setItem('patients', JSON.stringify(patients));
}

// Add a new patient
function addPatient(patientData) {
    const patients = getPatients();
    
    // Check if patient ID already exists
    if (patients.find(p => p.patientId === patientData.patientId)) {
        return { success: false, message: 'Patient ID already exists' };
    }
    
    const newPatient = {
        id: Date.now(),
        ...patientData,
        registeredAt: new Date().toISOString(),
        appointments: [],
        healthRecords: [],
        assignedDoctor: null
    };
    
    patients.push(newPatient);
    savePatients(patients);
    
    return { success: true, message: 'Patient registered successfully!', patient: newPatient };
}

// Update patient
function updatePatient(patientId, updatedData) {
    const patients = getPatients();
    const index = patients.findIndex(p => p.id == patientId);
    
    if (index === -1) {
        return { success: false, message: 'Patient not found' };
    }
    
    patients[index] = { ...patients[index], ...updatedData };
    savePatients(patients);
    
    return { success: true, message: 'Patient updated successfully!' };
}

// Delete patient
function deletePatient(patientId) {
    const patients = getPatients();
    const filtered = patients.filter(p => p.id != patientId);
    savePatients(filtered);
    return { success: true, message: 'Patient deleted successfully!' };
}

// Get patient by ID
function getPatientById(patientId) {
    const patients = getPatients();
    return patients.find(p => p.id == patientId);
}

// Initialize on load
initPatients();


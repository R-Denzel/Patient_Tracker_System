// Health Records Management System using localStorage

// Initialize health records
function initHealthRecords() {
    if (!localStorage.getItem('healthRecords')) {
        localStorage.setItem('healthRecords', JSON.stringify([]));
    }
}

// Get all health records
function getHealthRecords() {
    const records = localStorage.getItem('healthRecords');
    return records ? JSON.parse(records) : [];
}

// Save health records
function saveHealthRecords(records) {
    localStorage.setItem('healthRecords', JSON.stringify(records));
}

// Add health record (diagnosis, prescription, progress)
function addHealthRecord(recordData) {
    const records = getHealthRecords();
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const newRecord = {
        id: Date.now(),
        ...recordData,
        doctorId: currentUser.id,
        doctorName: currentUser.username,
        createdAt: new Date().toISOString()
    };
    
    records.push(newRecord);
    saveHealthRecords(records);
    
    // Also add to patient's health records array
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const patientIndex = patients.findIndex(p => p.id == recordData.patientId);
    if (patientIndex !== -1) {
        if (!patients[patientIndex].healthRecords) {
            patients[patientIndex].healthRecords = [];
        }
        patients[patientIndex].healthRecords.push(newRecord.id);
        localStorage.setItem('patients', JSON.stringify(patients));
    }
    
    return { success: true, message: 'Health record added successfully!' };
}

// Get health records by patient ID
function getHealthRecordsByPatient(patientId) {
    const records = getHealthRecords();
    return records.filter(r => r.patientId == patientId);
}

// Get health records by type
function getHealthRecordsByType(patientId, type) {
    const records = getHealthRecords();
    return records.filter(r => r.patientId == patientId && r.type === type);
}

// Update health record
function updateHealthRecord(recordId, updatedData) {
    const records = getHealthRecords();
    const index = records.findIndex(r => r.id == recordId);
    
    if (index === -1) {
        return { success: false, message: 'Health record not found' };
    }
    
    records[index] = { ...records[index], ...updatedData };
    saveHealthRecords(records);
    
    return { success: true, message: 'Health record updated successfully!' };
}

// Initialize on load
initHealthRecords();


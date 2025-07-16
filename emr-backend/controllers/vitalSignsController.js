const VitalSigns = require('../models/VitalSigns');
const Patient = require('../models/Patient');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllVitalSigns = catchAsync(async (req, res, next) => {
  const vitalSigns = await VitalSigns.find({ patient: req.params.patientId });

  res.status(200).json({
    status: 'success',
    results: vitalSigns.length,
    data: {
      vitalSigns
    }
  });
});

exports.getVitalSigns = catchAsync(async (req, res, next) => {
  const vitalSigns = await VitalSigns.findById(req.params.id);

  if (!vitalSigns) {
    return next(new AppError('No vital signs found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      vitalSigns
    }
  });
});

exports.createVitalSigns = catchAsync(async (req, res, next) => {
  // 1. Create the most basic document possible
  const vitalData = {
    patient: req.body.patient,
    recordedBy: req.user._id,
    notes: req.body.notes || undefined
  };

  // 2. Manually add ONLY fields that have values
  const vitalFields = [
    'temperature', 'heartRate', 'bloodPressure', 
    'respiratoryRate', 'oxygenSaturation',
    'height', 'weight', 'bloodSugar'
  ];

  vitalFields.forEach(field => {
    if (req.body[field]?.value !== undefined && req.body[field]?.value !== '') {
      vitalData[field] = {
        value: parseFloat(req.body[field].value),
        unit: req.body[field].unit || getDefaultUnit(field)
      };
      // Special handling for blood pressure
      if (field === 'bloodPressure') {
        vitalData.bloodPressure = {
          systolic: parseInt(req.body.bloodPressure.systolic),
          diastolic: parseInt(req.body.bloodPressure.diastolic),
          unit: req.body.bloodPressure.unit || 'mmHg'
        };
      }
      // Special handling for blood sugar
      if (field === 'bloodSugar') {
        vitalData.bloodSugar.fasting = req.body.bloodSugar.fasting || false;
      }
    }
  });

  // 3. Save with debug logging
  console.log('Final data being saved:', JSON.stringify(vitalData, null, 2));
  const newVitalSigns = await VitalSigns.create(vitalData);
  console.log('Actually saved:', JSON.stringify(newVitalSigns, null, 2));

  res.status(201).json({
    status: 'success',
    data: {
      vitalSigns: newVitalSigns
    }
  });
});

// Helper function
function getDefaultUnit(field) {
  const units = {
    temperature: '°C',
    heartRate: 'bpm',
    bloodPressure: 'mmHg',
    respiratoryRate: 'breaths/min',
    oxygenSaturation: '%',
    height: 'cm',
    weight: 'kg',
    bloodSugar: 'mg/dL'
  };
  return units[field];
}

exports.updateVitalSigns = catchAsync(async (req, res, next) => {
  const vitalSigns = await VitalSigns.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!vitalSigns) {
    return next(new AppError('No vital signs found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      vitalSigns
    }
  });
});

exports.deleteVitalSigns = catchAsync(async (req, res, next) => {
  const vitalSigns = await VitalSigns.findByIdAndDelete(req.params.id);

  if (!vitalSigns) {
    return next(new AppError('No vital signs found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllVitalSignsWithoutPatient = catchAsync(async (req, res, next) => {
  const vitalSigns = await VitalSigns.find(req.query);

  res.status(200).json({
    status: 'success',
    results: vitalSigns.length,
    data: {
      vitalSigns
    }
  });
});
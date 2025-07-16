const LabOrder = require('../models/LabOrder');
const Billing = require('../models/Billing');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Add this at the top of labPaymentController.js
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// @desc    Create billing for lab order
// @route   POST /api/v1/lab-orders/:id/create-billing
// @access  Private/Doctor
exports.createLabOrderBilling = catchAsync(async (req, res, next) => {
  const labOrder = await LabOrder.findById(req.params.id);
  
  if (!labOrder) {
    return next(new AppError('No lab order found with that ID', 404));
  }

  // Check if billing already exists
  const existingBilling = await Billing.findOne({ relatedLabOrder: labOrder._id });
  if (existingBilling) {
    return next(new AppError('Billing already exists for this lab order', 400));
  }

  // Calculate total from lab tests
  const total = labOrder.tests.reduce((sum, test) => sum + (test.price * test.quantity), 0);

  const billing = await Billing.create({
    patient: labOrder.patient,
    items: labOrder.tests.map(test => ({
      description: test.name,
      quantity: test.quantity,
      unitPrice: test.price,
      total: test.price * test.quantity
    })),
    subtotal: total,
    total,
    status: 'pending',
    paymentType: 'lab-test',
    relatedLabOrder: labOrder._id,
    createdBy: req.user._id,
    createdByModel: capitalizeFirstLetter(req.user.role)
  });

  // Update lab order status and link billing
  labOrder.status = 'pending-payment';
  labOrder.billing = billing._id;
  await labOrder.save();

  res.status(201).json({
    status: 'success',
    data: {
      billing
    }
  });
});

// @desc    Verify lab order payment status
// @route   GET /api/v1/lab-orders/:id/payment-status
// @access  Private
exports.checkLabOrderPaymentStatus = catchAsync(async (req, res, next) => {
  const labOrder = await LabOrder.findById(req.params.id).populate('billing');
  
  if (!labOrder) {
    return next(new AppError('No lab order found with that ID', 404));
  }

  if (!labOrder.billing) {
    return res.status(200).json({
      status: 'success',
      data: {
        paid: false,
        message: 'No billing record found for this lab order'
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      paid: labOrder.billing.status === 'paid',
      billingStatus: labOrder.billing.status,
      billingId: labOrder.billing._id,
      amount: labOrder.billing.total
    }
  });
});

// @desc    Process payment for lab order
// @route   POST /api/v1/lab-orders/:id/process-payment
// @access  Private/Patient
// Replace both processLabOrderPayment and processLabPayment with this single function:
exports.processLabPayment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { paymentMethod, notes, amount } = req.body;

  // 1. Find lab order with billing populated
  const labOrder = await LabOrder.findById(id)
    .populate('billing patient tests')
    .populate({
      path: 'billing',
      populate: { path: 'patient' }
    });

  if (!labOrder) {
    return next(new AppError('No lab order found with that ID', 404));
  }

  // 2. Verify payment status
  if (labOrder.billing?.status === 'paid') {
    return next(new AppError('This lab order has already been paid', 400));
  }

  // 3. Create payment record
  const receiptNumber = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const payment = await Payment.create({
    billing: labOrder.billing?._id,
    patient: labOrder.patient._id,
    amount: amount || labOrder.billing?.total,
    paymentMethod,
    paymentType: 'lab-test',
    relatedLabOrder: labOrder._id,
    status: 'paid', // Consistent status
    notes,
    receiptNumber,
    processedBy: req.user._id,
    processedByModel: capitalizeFirstLetter(req.user.role)
  });

  // 4. Update all related records consistently
  const updates = [];
  
  if (labOrder.billing) {
    updates.push(
      Billing.findByIdAndUpdate(labOrder.billing._id, {
        status: 'paid',
        payment: payment._id,
        updatedAt: Date.now()
      })
    );
  }

  updates.push(
    LabOrder.findByIdAndUpdate(labOrder._id, {
      status: 'paid',
      paymentStatus: 'paid',
      payment: payment._id,
      $unset: { billing: 1 } // Remove billing reference
    }, { new: true })
  );

  await Promise.all(updates);

  // 5. Create audit log
  await AuditLog.create({
    action: 'payment',
    entity: 'LabOrder',
    entityId: id,
    user: req.user._id,
    userModel: capitalizeFirstLetter(req.user.role),
    changes: {
      from: 'pending-payment',
      to: 'paid',
      paymentId: payment._id,
      amount: payment.amount
    },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json({
    status: 'success',
    data: {
      payment,
      labOrder: {
        ...labOrder.toObject(),
        status: 'paid',
        paymentStatus: 'paid'
      }
    }
  });
});
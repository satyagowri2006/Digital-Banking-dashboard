const mongoose = require('mongoose');

const loanSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    loanType: {
      type: String,
      required: true,
      enum: ['personal', 'home', 'car', 'education', 'business', 'gold', 'other'],
    },
    amount: {
      type: Number,
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    tenure: {
      type: Number,
      required: true, // in months
    },
    emi: {
      type: Number,
      required: true,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'active', 'completed', 'rejected'],
      default: 'pending',
    },
    nextPaymentDate: {
      type: Date,
    },
    description: {
      type: String,
    },
    paymentHistory: [
      {
        amount: Number,
        date: {
          type: Date,
          default: Date.now,
        },
        paymentMethod: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate end date and next payment date before saving
loanSchema.pre('save', function (next) {
  if (!this.endDate) {
    const start = this.startDate || new Date();
    this.endDate = new Date(start.setMonth(start.getMonth() + this.tenure));
  }
  
  if (!this.nextPaymentDate && this.status === 'active') {
    const today = new Date();
    this.nextPaymentDate = new Date(today.setMonth(today.getMonth() + 1));
  }
  
  next();
});

module.exports = mongoose.model('Loan', loanSchema);

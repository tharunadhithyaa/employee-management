/**
 * Employee Routes
 * ===============
 * This file defines all the REST API endpoints for managing employees.
 * 
 * Endpoints:
 *   GET    /api/employees      - Fetch all employees
 *   GET    /api/employees/:id  - Fetch a single employee by ID
 *   POST   /api/employees      - Create a new employee
 *   PUT    /api/employees/:id  - Update an existing employee
 *   DELETE /api/employees/:id  - Delete an employee
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ============================================================
// Mongoose Schema & Model
// ============================================================
// Define the shape of an Employee document in MongoDB.
// Each employee has a name, email, department, designation,
// salary, and a joining date (defaults to now).

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Create the Mongoose model from the schema
const Employee = mongoose.model('Employee', employeeSchema);


// ============================================================
// GET /api/employees — Fetch all employees
// ============================================================
// Returns an array of all employees, sorted by newest first.

router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees'
    });
  }
});


// ============================================================
// GET /api/employees/:id — Fetch a single employee
// ============================================================

router.get('/:id', async (req, res) => {
  try {
    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format'
      });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee'
    });
  }
});


// ============================================================
// POST /api/employees — Create a new employee
// ============================================================
// Expects a JSON body with: name, email, department,
// designation, salary, and optionally joinDate.

router.post('/', async (req, res) => {
  try {
    const { name, email, department, designation, salary, joinDate } = req.body;

    // Basic validation
    if (!name || !email || !department || !designation || !salary) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, department, designation, salary'
      });
    }

    // Create and save the new employee
    const employee = new Employee({
      name,
      email,
      department,
      designation,
      salary,
      joinDate: joinDate || Date.now()
    });

    const savedEmployee = await employee.save();

    console.log(`✅ New employee created: ${savedEmployee.name}`);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: savedEmployee
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists'
      });
    }

    console.error('Error creating employee:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating employee'
    });
  }
});


// ============================================================
// PUT /api/employees/:id — Update an existing employee
// ============================================================
// Expects a JSON body with the fields to update.

router.put('/:id', async (req, res) => {
  try {
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format'
      });
    }

    // Find and update the employee
    // { new: true } returns the updated document instead of the old one
    // { runValidators: true } ensures the update obeys schema validations
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log(`✅ Employee updated: ${employee.name}`);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    // Handle duplicate email error on update
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists'
      });
    }

    console.error('Error updating employee:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating employee'
    });
  }
});


// ============================================================
// DELETE /api/employees/:id — Delete an employee
// ============================================================

router.delete('/:id', async (req, res) => {
  try {
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format'
      });
    }

    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log(`🗑️  Employee deleted: ${employee.name}`);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error deleting employee:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting employee'
    });
  }
});


// Export the router so it can be used in server.js
module.exports = router;

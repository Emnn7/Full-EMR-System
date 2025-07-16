import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Helper function to calculate age
function calculateAge(dob) {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

// Async Thunk for generating reports
export const generateReport = createAsyncThunk(
  'report/generateReport',
  async ({ type, startDate, endDate }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      let reportData = {
        columns: [],
        rows: []
      };

      switch(type) {
        case 'patientDemographics': {
          const patients = state.patient.patients || [];
          
          // Filter patients by date range
          const filteredPatients = patients.filter(patient => {
            if (!patient.createdAt) return false;
            const created = new Date(patient.createdAt);
            return (!startDate || created >= new Date(startDate)) && 
                   (!endDate || created <= new Date(endDate));
          });
          
          // Calculate age groups
          const ageGroups = {
            '0-18': { count: 0, gender: { male: 0, female: 0, other: 0 } },
            '19-35': { count: 0, gender: { male: 0, female: 0, other: 0 } },
            '36-50': { count: 0, gender: { male: 0, female: 0, other: 0 } },
            '51+': { count: 0, gender: { male: 0, female: 0, other: 0 } }
          };
          
          filteredPatients.forEach(patient => {
            const age = calculateAge(patient.dob);
            const gender = patient.gender?.toLowerCase() || 'other';
            
            if (age <= 18) {
              ageGroups['0-18'].count++;
              ageGroups['0-18'].gender[gender]++;
            } 
            else if (age <= 35) {
              ageGroups['19-35'].count++;
              ageGroups['19-35'].gender[gender]++;
            }
            else if (age <= 50) {
              ageGroups['36-50'].count++;
              ageGroups['36-50'].gender[gender]++;
            }
            else {
              ageGroups['51+'].count++;
              ageGroups['51+'].gender[gender]++;
            }
          });
          
          const total = filteredPatients.length;
          
          reportData = {
            columns: ["Age Group", "Count", "Percentage", "Male", "Female", "Other"],
            rows: Object.entries(ageGroups).map(([group, data]) => ({
              "Age Group": group,
              "Count": data.count,
              "Percentage": total > 0 ? `${Math.round((data.count / total) * 100)}%` : "0%",
              "Male": data.gender.male,
              "Female": data.gender.female,
              "Other": data.gender.other
            }))
          };
          break;
        }
          
        case 'appointmentAnalysis': {
          const appointments = state.appointment.appointments || [];
          const doctors = state.doctor.doctors || [];
          
          // Filter appointments by date range
          const filteredAppointments = appointments.filter(appt => {
            const apptDate = new Date(appt.date);
            return (!startDate || apptDate >= new Date(startDate)) && 
                  (!endDate || apptDate <= new Date(endDate));
          });

          // Group by specialty
          const specialties = {};
          const doctorMap = doctors.reduce((acc, doctor) => {
            acc[doctor.id] = doctor;
            return acc;
          }, {});

          filteredAppointments.forEach(appt => {
            const doctor = doctorMap[appt.doctorId];
            if (!doctor) return;
            
            const specialty = doctor.specialty || 'Unknown';
            
            if (!specialties[specialty]) {
              specialties[specialty] = {
                total: 0,
                completed: 0,
                cancelled: 0,
                noShow: 0,
                doctors: new Set()
              };
            }
            
            specialties[specialty].total++;
            specialties[specialty].doctors.add(appt.doctorId);
            
            switch(appt.status) {
              case 'completed':
                specialties[specialty].completed++;
                break;
              case 'cancelled':
                specialties[specialty].cancelled++;
                break;
              case 'no-show':
                specialties[specialty].noShow++;
                break;
              default:
                break;
            }
          });

          // Calculate percentages and prepare rows
          reportData = {
            columns: [
              "Specialty", 
              "Total Appointments", 
              "Completed (%)", 
              "Cancelled (%)", 
              "No Show (%)", 
              "Unique Doctors"
            ],
            rows: Object.entries(specialties).map(([specialty, data]) => {
              const total = data.total;
              return {
                "Specialty": specialty,
                "Total Appointments": total,
                "Completed (%)": total > 0 ? `${Math.round((data.completed / total) * 100)}%` : "0%",
                "Cancelled (%)": total > 0 ? `${Math.round((data.cancelled / total) * 100)}%` : "0%",
                "No Show (%)": total > 0 ? `${Math.round((data.noShow / total) * 100)}%` : "0%",
                "Unique Doctors": data.doctors.size
              };
            })
          };
          break;
        }
          
        case 'financialSummary': {
          // Safely access billing data with optional chaining
          const billings = state.billing?.data || [];
          
          // Filter by date range
          const filteredBillings = billings.filter(billing => {
            if (!billing.date) return false;
            const billingDate = new Date(billing.date);
            return (!startDate || billingDate >= new Date(startDate)) && 
                  (!endDate || billingDate <= new Date(endDate));
          });
          
          // Calculate totals
          const totalBilled = filteredBillings.reduce((sum, billing) => sum + (billing.amount || 0), 0);
          const totalPaid = filteredBillings.reduce((sum, billing) => sum + (billing.paidAmount || 0), 0);
          const outstanding = totalBilled - totalPaid;
          
          // Group by service type
          const serviceTypes = {};
          filteredBillings.forEach(billing => {
            const serviceType = billing.serviceType || 'Other';
            if (!serviceTypes[serviceType]) {
              serviceTypes[serviceType] = {
                billed: 0,
                paid: 0,
                count: 0,
                outstanding: 0
              };
            }
            serviceTypes[serviceType].billed += billing.amount || 0;
            serviceTypes[serviceType].paid += billing.paidAmount || 0;
            serviceTypes[serviceType].outstanding += (billing.amount || 0) - (billing.paidAmount || 0);
            serviceTypes[serviceType].count++;
          });
          
          // Prepare report data
          reportData = {
            columns: [
              "Service Type",
              "Number of Services",
              "Total Billed",
              "Total Paid",
              "Outstanding Balance"
            ],
            rows: [
              ...Object.entries(serviceTypes).map(([serviceType, data]) => ({
                "Service Type": serviceType,
                "Number of Services": data.count,
                "Total Billed": formatCurrency(data.billed),
                "Total Paid": formatCurrency(data.paid),
                "Outstanding Balance": formatCurrency(data.outstanding)
              })),
              {
                "Service Type": "TOTAL",
                "Number of Services": filteredBillings.length,
                "Total Billed": formatCurrency(totalBilled),
                "Total Paid": formatCurrency(totalPaid),
                "Outstanding Balance": formatCurrency(outstanding)
              }
            ]
          };
          break;
        }
          
        default:
          throw new Error('Invalid report type');
      }
      
      return {
        type,
        data: reportData
      };
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for getting report history
export const getReportHistory = createAsyncThunk(
  'report/getHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/history');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch report history');
    }
  }
);

const initialState = {
  currentReport: null,
  history: [],
  loading: false,
  error: null,
  success: false
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReport: (state) => {
      state.currentReport = null;
      state.error = null;
      state.success = false;
    },
    resetReportState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
        state.success = true;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to generate report';
      })
      .addCase(getReportHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReportHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getReportHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load report history';
      });
  }
});

export const { clearReport, resetReportState } = reportSlice.actions;
export default reportSlice.reducer;
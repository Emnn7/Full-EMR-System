// api/medicalReports.js (or similar)
export const downloadMedicalReport = async (patientId, reportId = null) => {
    try {
      const url = reportId 
        ? `/api/v1/patients/${patientId}/medical-reports/${reportId}/download`
        : `/api/v1/patients/${patientId}/medical-report`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download report');
      
      const blob = await response.blob();
      const filename = response.headers.get('content-disposition')?.split('filename=')[1] 
        || `medical-report-${patientId}.pdf`;
      
      // Download the file
      const urlObject = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObject;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlObject);
      
      return { success: true };
    } catch (error) {
      console.error('Download failed:', error);
      return { success: false, error: error.message };
    }
  };
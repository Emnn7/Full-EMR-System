import { NOTIFICATION_TYPES } from '../config/constants';

export const formatNotificationMessage = (type, data) => {
  switch (type) {
    case NOTIFICATION_TYPES.NEW_LAB_ORDER:
      return `New lab order for ${data.patientName}`;
    case NOTIFICATION_TYPES.REPORT_VERIFICATION:
      return `Lab results ready for ${data.patientName}`;
    case NOTIFICATION_TYPES.PAYMENT_REQUIRED:
      return `Payment required for ${data.serviceName}`;
    case NOTIFICATION_TYPES.PAYMENT_COMPLETED:
      return `Payment completed for ${data.serviceName}`;
    case NOTIFICATION_TYPES.ABNORMAL_RESULT:
      return `Abnormal results for ${data.testName}`;
    default:
      return data.message || 'New notification';
  }
};

export const getNotificationIcon = (type) => {
  // Return appropriate icon based on notification type
  switch (type) {
    case NOTIFICATION_TYPES.NEW_LAB_ORDER:
      return 'science';
    case NOTIFICATION_TYPES.REPORT_VERIFICATION:
      return 'assignment';
    case NOTIFICATION_TYPES.PAYMENT_REQUIRED:
      return 'payment';
    case NOTIFICATION_TYPES.ABNORMAL_RESULT:
      return 'warning';
    default:
      return 'notifications';
  }
};
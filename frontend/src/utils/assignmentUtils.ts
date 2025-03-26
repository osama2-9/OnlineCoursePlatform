export const formatDate = (date: Date | string) => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(date);
    }
  };
  
  export const getDaysRemaining = (endDate: Date | string) => {
    if (!endDate) return 0;
    
    try {
      const today = new Date();
      const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
      const diff = end.getTime() - today.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return 0;
    }
  };
  
  export const getStatusDetails = (endDate: Date | string) => {
    try {
      const daysRemaining = getDaysRemaining(endDate);
  
      if (daysRemaining < 0) {
        return {
          label: "Closed",
          color: "bg-gray-100 text-gray-800",
          textColor: "text-gray-500",
        };
      } else if (daysRemaining <= 3) {
        return {
          label: `${daysRemaining} DL`,
          color: "bg-red-100 text-red-800",
          textColor: "text-red-500",
        };
      } else if (daysRemaining <= 7) {
        return {
          label: `${daysRemaining} DL`,
          color: "bg-yellow-100 text-yellow-800",
          textColor: "text-yellow-600",
        };
      } else {
        return {
          label: "Active",
          color: "bg-green-100 text-green-800",
          textColor: "text-green-600",
        };
      }
    } catch (error) {
      console.error('Error getting status details:', error);
      return {
        label: "Unknown",
        color: "bg-gray-100 text-gray-800",
        textColor: "text-gray-500",
      };
    }
  };
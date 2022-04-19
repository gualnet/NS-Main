
/**
 * take a timestamps and output a formated string (DD/MM/YYYY)
 * format accept [DD/MM/YYYY, YYYY/MM/DD, DD-MM-YYYY, YYYY-MM-DD]
 * default is set to DD/MM/YYYY
 * @param {EpochTimeStamp} timestamp 
 * @param {['DD/MM/YYYY', 'YYYY/MM/DD', 'DD-MM-YYYY', 'YYYY-MM-DD']} format 
 * @returns 
 */
function formatDate (timestamp, format = 'DD/MM/YYYY') {
  let tempDate = new Date(timestamp);
  let separator;
  switch (format) {
    case 'DD/MM/YYYY':
      separator = '/';
      tempDate = tempDate.toISOString().split('T')[0];
      tempDate = tempDate.split('-').reverse().join(separator);
      break;
    case 'YYYY/MM/DD':
      separator = '/';
      tempDate = tempDate.toISOString().split('T')[0];
      tempDate = tempDate.split('-').join(separator);
      break;
    case 'DD-MM-YYYY':
      separator = '-';
      tempDate = tempDate.toISOString().split('T')[0];
      tempDate = tempDate.split('-').reverse().join(separator);
      break;
    case 'YYYY-MM-DD':
      separator = '-';
      tempDate = tempDate.toISOString().split('T')[0];
      tempDate = tempDate.split('-').join(separator);
      break;

    default: // DD/MM/YYYY
      separator = '/';
      tempDate = tempDate.toISOString().split('T')[0];
      tempDate = tempDate.split('-').reverse().join(separator);
      break;
  }

  return (tempDate);
};

module.exports = {
  formatDate: formatDate,
}
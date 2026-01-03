const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const safeParseInt = (value, defaultValue = null) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const buildPaginationMeta = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalItems,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

module.exports = {
  isValidObjectId,
  safeParseInt,
  parseDate,
  sanitizeString,
  buildPaginationMeta
};

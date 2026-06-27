const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: err.message 
    });
  }
  
  if (err.code === '23505') {
    return res.status(409).json({ 
      error: 'Duplicate Entry', 
      message: 'Record already exists' 
    });
  }
  
  if (err.code === '23503') {
    return res.status(400).json({ 
      error: 'Foreign Key Violation', 
      message: 'Referenced record does not exist' 
    });
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not Found' });
};

module.exports = { errorHandler, notFoundHandler };
